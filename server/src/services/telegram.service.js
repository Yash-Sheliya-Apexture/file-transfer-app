// const TelegramBot = require('node-telegram-bot-api');
// const stream = require('stream');

// const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// const bot = new TelegramBot(TOKEN);

// // Uploads a buffer (chunk) to Telegram as a document
// exports.uploadChunk = async (chunkBuffer, fileName) => {
//   const response = await bot.sendDocument(CHAT_ID, chunkBuffer, {}, {
//     filename: fileName,
//     contentType: 'application/octet-stream',
//   });
//   return response.message_id;
// };

// // Gets a readable stream for a file from Telegram
// exports.getFileStream = async (messageId) => {
//     const fileId = (await bot.getFile(messageId)).file_id;
//     const fileLink = await bot.getFileLink(fileId);
//     // In a real app, you'd stream this. For simplicity, we get the link.
//     // The node-telegram-bot-api library doesn't directly support streaming downloads well.
//     // We'll use axios to fetch it.
//     const axios = require('axios');
//     const response = await axios({
//         url: fileLink,
//         method: 'GET',
//         responseType: 'stream'
//     });
//     return response.data;
// };

// // server/src/services/telegram.service.js
// const TelegramBot = require('node-telegram-bot-api');
// const axios = require('axios');
// const FormData = require('form-data');
// const stream = require('stream');

// const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
// const API_URL = `https://api.telegram.org/bot${TOKEN}`;

// // We still use the bot instance for non-upload tasks if needed
// const bot = new TelegramBot(TOKEN);

// /**
//  * Uploads a file chunk to Telegram using axios for better reliability.
//  * This bypasses the node-telegram-bot-api's internal request handling for file uploads.
//  */
// exports.uploadChunk = async (chunkBuffer, fileName) => {
//   const form = new FormData();
//   form.append('chat_id', CHAT_ID);
//   form.append('document', chunkBuffer, {
//     filename: fileName,
//     contentType: 'application/octet-stream',
//   });

//   try {
//     const response = await axios.post(`${API_URL}/sendDocument`, form, {
//       headers: {
//         ...form.getHeaders(),
//       },
//       maxContentLength: Infinity, // Important for large files
//       maxBodyLength: Infinity,    // Important for large files
//     });

//     if (response.data.ok) {
//       return response.data.result.message_id;
//     } else {
//       throw new Error(`Telegram API error: ${response.data.description}`);
//     }
//   } catch (error) {
//     // Log more detailed error information from axios
//     if (error.response) {
//       console.error('Telegram API Error Response:', error.response.data);
//     }
//     throw error; // Re-throw the error to be caught by the controller
//   }
// };

// /**
//  * Gets a readable stream for a file from Telegram.
//  * This part can remain as is, but we can also make it more robust with axios.
//  */
// exports.getFileStream = async (messageId) => {
//   try {
//     // First, get the file path from Telegram
//     const getFileResponse = await axios.get(`${API_URL}/getFile`, {
//       params: { chat_id: CHAT_ID, file_id: messageId }
//     });
    
//     // In some cases, messageId is the file_id itself. Let's get the file object.
//     const file = await bot.getFile(messageId);
//     const filePath = file.file_path;

//     if (!filePath) {
//       throw new Error('Could not get file path from Telegram.');
//     }
    
//     // Construct the full URL to download the file
//     const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

//     // Use axios to get the file as a stream
//     const response = await axios({
//       url: fileUrl,
//       method: 'GET',
//       responseType: 'stream',
//     });

//     return response.data;
//   } catch (error) {
//     if (error.response) {
//       console.error('Telegram getFileStream Error:', error.response.data);
//     }
//     throw error;
//   }
// };

// // server/src/services/telegram.service.js

// // REMOVED: const TelegramBot = require('node-telegram-bot-api');
// const axios = require('axios');
// const FormData = require('form-data');

// const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
// const API_URL = `https://api.telegram.org/bot${TOKEN}`;

// // REMOVED: const bot = new TelegramBot(TOKEN);

// /**
//  * Uploads a file chunk to Telegram using axios.
//  * (This function is correct and remains unchanged)
//  */
// exports.uploadChunk = async (chunkBuffer, fileName) => {
//     const form = new FormData();
//     form.append('chat_id', CHAT_ID);
//     form.append('document', chunkBuffer, {
//         filename: fileName,
//         contentType: 'application/octet-stream',
//     });

//     try {
//         const response = await axios.post(`${API_URL}/sendDocument`, form, {
//             headers: { ...form.getHeaders() },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity,
//         });

//         if (response.data.ok) {
//             return response.data.result.message_id;
//         } else {
//             throw new Error(`Telegram API error: ${response.data.description}`);
//         }
//     } catch (error) {
//         if (error.response) {
//             console.error('Telegram Upload Error Response:', error.response.data);
//         }
//         throw error;
//     }
// };


// /**
//  * Gets a readable stream for a file from Telegram using only axios.
//  * THIS IS THE NEW, BULLETPROOF VERSION.
//  */
// exports.getFileStream = async (messageId) => {
//     try {
//         // STEP 1: Use axios to call the `forwardMessage` method.
//         // We "forward" the message containing the file to ourself (the bot).
//         // The API response to this action will contain the full message object,
//         // including the crucial `file_id` of the document.
//         const forwardResponse = await axios.post(`${API_URL}/forwardMessage`, {
//             chat_id: CHAT_ID,      // Forward TO our chat
//             from_chat_id: CHAT_ID, // Forward FROM our chat
//             message_id: messageId, // The ID of the message with the file
//         });

//         if (!forwardResponse.data.ok || !forwardResponse.data.result.document) {
//             throw new Error('Failed to forward message to get file_id.');
//         }

//         // STEP 2: Extract the actual `file_id` from the forwarded message's document object.
//         const fileId = forwardResponse.data.result.document.file_id;
//         const forwardedMessageId = forwardResponse.data.result.message_id;

//         // STEP 3: Now that we have the correct `file_id`, call the `getFile` method.
//         const getFileResponse = await axios.post(`${API_URL}/getFile`, {
//             file_id: fileId,
//         });

//         if (!getFileResponse.data.ok) {
//             throw new Error('Could not get file path from Telegram after getting file_id.');
//         }
        
//         const filePath = getFileResponse.data.result.file_path;

//         // STEP 4 (Optional but recommended): Delete the forwarded message to keep the chat clean.
//         axios.post(`${API_URL}/deleteMessage`, {
//             chat_id: CHAT_ID,
//             message_id: forwardedMessageId,
//         }).catch(err => console.error("Could not delete forwarded message:", err.response?.data));


//         // STEP 5: Construct the final download URL and get the stream.
//         const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

//         const streamResponse = await axios({
//             url: fileUrl,
//             method: 'GET',
//             responseType: 'stream',
//         });

//         return streamResponse.data;

//     } catch (error) {
//         if (error.response) {
//             console.error(`Telegram getFileStream API Error for messageId ${messageId}:`, error.response.data);
//         } else {
//             console.error(`Telegram getFileStream General Error for messageId ${messageId}:`, error.message);
//         }
//         throw error;
//     }
// };

// // server/src/services/telegram.service.js

// const axios = require('axios');
// const FormData = require('form-data');

// const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
// const API_URL = `https://api.telegram.org/bot${TOKEN}`;

// /**
//  * Uploads a file chunk to Telegram using axios.
//  */
// exports.uploadChunk = async (chunkBuffer, fileName) => {
//     const form = new FormData();
//     form.append('chat_id', CHAT_ID);
//     form.append('document', chunkBuffer, {
//         filename: fileName,
//         contentType: 'application/octet-stream',
//     });

//     try {
//         const response = await axios.post(`${API_URL}/sendDocument`, form, {
//             headers: { ...form.getHeaders() },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity,
//         });

//         if (response.data.ok) {
//             return response.data.result.message_id;
//         } else {
//             throw new Error(`Telegram API error: ${response.data.description}`);
//         }
//     } catch (error) {
//         if (error.response) {
//             console.error('Telegram Upload Error Response:', error.response.data);
//         }
//         throw error;
//     }
// };

// /**
//  * Gets a readable stream for a file from Telegram using only axios.
//  */
// exports.getFileStream = async (messageId) => {
//     try {
//         // Forward the message to ourselves to reliably get the full message object
//         const forwardResponse = await axios.post(`${API_URL}/forwardMessage`, {
//             chat_id: CHAT_ID,
//             from_chat_id: CHAT_ID,
//             message_id: messageId,
//         });

//         if (!forwardResponse.data.ok || !forwardResponse.data.result.document) {
//             throw new Error('Failed to get file metadata by forwarding message.');
//         }

//         const fileId = forwardResponse.data.result.document.file_id;
//         const forwardedMessageId = forwardResponse.data.result.message_id;

//         // Get the file path using the correct file_id
//         const getFileResponse = await axios.post(`${API_URL}/getFile`, {
//             file_id: fileId,
//         });
        
//         // Clean up the forwarded message
//         axios.post(`${API_URL}/deleteMessage`, {
//             chat_id: CHAT_ID,
//             message_id: forwardedMessageId,
//         }).catch(err => console.error("Non-critical: Could not delete forwarded message:", err.response?.data));


//         if (!getFileResponse.data.ok) {
//             throw new Error('Could not get file path from Telegram.');
//         }
        
//         const filePath = getFileResponse.data.result.file_path;

//         // Construct the final download URL and get the stream
//         const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

//         const streamResponse = await axios({
//             url: fileUrl,
//             method: 'GET',
//             responseType: 'stream',
//         });

//         return streamResponse.data;

//     } catch (error) {
//         if (error.response) {
//             console.error(`Telegram getFileStream API Error for messageId ${messageId}:`, error.response.data);
//         } else {
//             console.error(`Telegram getFileStream General Error for messageId ${messageId}:`, error.message);
//         }
//         throw error;
//     }
// };


// // server/src/services/telegram.service.js
// const axios = require('axios');
// const FormData = require('form-data');

// const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
// const API_URL = `https://api.telegram.org/bot${TOKEN}`;

// // Default timeout for all axios requests in this service (e.g., 5 minutes)
// const AXIOS_TIMEOUT = 5 * 60 * 1000;

// exports.uploadChunk = async (chunkBuffer, fileName) => {
//     const form = new FormData();
//     form.append('chat_id', CHAT_ID);
//     form.append('document', chunkBuffer, { filename: fileName, contentType: 'application/octet-stream' });

//     try {
//         const response = await axios.post(`${API_URL}/sendDocument`, form, {
//             headers: { ...form.getHeaders() },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity,
//             timeout: AXIOS_TIMEOUT, // Apply timeout
//         });
//         if (response.data.ok) return response.data.result.message_id;
//         throw new Error(`Telegram API error: ${response.data.description}`);
//     } catch (error) {
//         if (error.response) console.error('Telegram Upload Error:', error.response.data);
//         throw error;
//     }
// };

// exports.getFileStream = async (messageId) => {
//     try {
//         const forwardResponse = await axios.post(`${API_URL}/forwardMessage`, {
//             chat_id: CHAT_ID, from_chat_id: CHAT_ID, message_id: messageId
//         }, { timeout: AXIOS_TIMEOUT });

//         if (!forwardResponse.data.ok || !forwardResponse.data.result.document) {
//             throw new Error('Failed to get file metadata.');
//         }

//         const fileId = forwardResponse.data.result.document.file_id;
//         const forwardedMessageId = forwardResponse.data.result.message_id;

//         const getFileResponse = await axios.post(`${API_URL}/getFile`, { file_id: fileId }, { timeout: AXIOS_TIMEOUT });
        
//         axios.post(`${API_URL}/deleteMessage`, { chat_id: CHAT_ID, message_id: forwardedMessageId })
//             .catch(err => console.error("Non-critical: cleanup failed", err.response?.data));

//         if (!getFileResponse.data.ok) throw new Error('Could not get file path.');
        
//         const filePath = getFileResponse.data.result.file_path;
//         const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

//         const streamResponse = await axios({
//             url: fileUrl, method: 'GET', responseType: 'stream', timeout: AXIOS_TIMEOUT
//         });

//         return streamResponse.data;
//     } catch (error) {
//         if (error.response) console.error(`TG getFileStream Error:`, error.response.data);
//         else console.error(`TG getFileStream Error:`, error.message);
//         throw error;
//     }
// };

// server/src/services/telegram.service.js

const axios = require('axios');
const FormData = require('form-data');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_URL = `https://api.telegram.org/bot${TOKEN}`;

// A very generous default timeout for all network requests in this service
const AXIOS_TIMEOUT = 120 * 60 * 1000; // 2 hours

exports.uploadChunk = async (chunkBuffer, fileName) => {
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('document', chunkBuffer, { filename: fileName, contentType: 'application/octet-stream' });

    try {
        const response = await axios.post(`${API_URL}/sendDocument`, form, {
            headers: { ...form.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: AXIOS_TIMEOUT,
        });
        if (response.data.ok) return response.data.result.message_id;
        throw new Error(`Telegram API error: ${response.data.description}`);
    } catch (error) {
        if (error.response) console.error('Telegram Upload Error:', error.response.data);
        else console.error('Telegram Upload Error:', error.message);
        throw error;
    }
};

exports.getFileStream = async (messageId) => {
    try {
        const forwardResponse = await axios.post(`${API_URL}/forwardMessage`, {
            chat_id: CHAT_ID, from_chat_id: CHAT_ID, message_id: messageId
        }, { timeout: AXIOS_TIMEOUT });

        if (!forwardResponse.data.ok || !forwardResponse.data.result.document) {
            throw new Error('Failed to get file metadata by forwarding message.');
        }

        const fileId = forwardResponse.data.result.document.file_id;
        const forwardedMessageId = forwardResponse.data.result.message_id;

        const getFileResponse = await axios.post(`${API_URL}/getFile`, { file_id: fileId }, { timeout: AXIOS_TIMEOUT });
        
        // Clean up the forwarded message in the background
        axios.post(`${API_URL}/deleteMessage`, { chat_id: CHAT_ID, message_id: forwardedMessageId })
            .catch(err => console.error("Non-critical: Could not delete forwarded message:", err.response?.data));

        if (!getFileResponse.data.ok) {
            throw new Error('Could not get file path from Telegram.');
        }
        
        const filePath = getFileResponse.data.result.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

        const streamResponse = await axios({
            url: fileUrl, method: 'GET', responseType: 'stream', timeout: AXIOS_TIMEOUT
        });

        return streamResponse.data;
    } catch (error) {
        if (error.response) {
            console.error(`Telegram getFileStream API Error for messageId ${messageId}:`, error.response.data);
        } else {
            console.error(`Telegram getFileStream General Error for messageId ${messageId}:`, error.message);
        }
        throw error;
    }
};