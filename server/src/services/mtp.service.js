const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Readable } = require('stream');

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const sessionString = process.env.SESSION_STRING;

// A dummy object to export if credentials are not set, preventing server crash on require()
const dummyClient = {
    getDownloadStream: () => {
        console.error("MTP Client not configured. Cannot process MTP download.");
        throw new Error("MTP Client is not configured in .env file.");
    }
};

let client;
if (apiId && apiHash && sessionString) {
    client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
    });
} else {
    console.warn("MTP API credentials (API_ID, API_HASH, SESSION_STRING) are not configured. MTP downloads will be disabled.");
}

// Connect the client when the server starts
if (client) {
    (async () => {
        try {
            console.log("MTP Client: Connecting...");
            await client.connect();
            console.log("MTP Client: Connected successfully.");
        } catch (error) {
            console.error("MTP Client: Failed to connect.", error);
        }
    })();
}


/**
 * Fetches a file from a Telegram message and returns it as a Readable stream.
 * @param {number} messageId The ID of the message containing the file.
 * @param {number} channelId The ID of the channel where the message is.
 * @returns {Readable} A Node.js Readable stream of the file content.
 */
const getDownloadStream = async (messageId, channelId) => {
    if (!client || !client.connected) {
        throw new Error("MTP client is not connected.");
    }
    
    try {
        const messages = await client.getMessages(channelId, { ids: [messageId] });
        const media = messages?.[0]?.media;

        if (!media) {
            throw new Error(`MTP: Message or media not found for messageId: ${messageId} in channel: ${channelId}`);
        }

        const readableStream = new Readable({ read() {} });

        // This async block fetches chunks from Telegram and pushes them into our stream.
        (async () => {
            try {
                const iterator = client.iterDownload({ file: media });
                for await (const chunk of iterator) {
                    readableStream.push(chunk);
                }
                readableStream.push(null); // Signal the end of the stream
            } catch (streamError) {
                console.error("MTP stream download error:", streamError);
                readableStream.emit('error', streamError);
            }
        })();

        return readableStream;

    } catch (error) {
        console.error("MTP getDownloadStream Error:", error);
        throw error;
    }
};

module.exports = client ? { getDownloadStream } : dummyClient;