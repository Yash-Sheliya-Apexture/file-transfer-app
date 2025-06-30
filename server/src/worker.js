// server/src/worker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const File = require('./models/File');
const gDriveService = require('./services/googleDrive.service');
const telegramService = require('./services/telegram.service');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// The processor function: this is the logic that will run for each job.
const processor = async (job) => {
    const { groupId } = job.data;
    console.log(`[WORKER] Processing job for group: ${groupId}`);

    const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
    let allTransfersSucceeded = true;

    for (const fileDoc of filesInGroup) {
        try {
            await job.updateProgress({ message: `Archiving ${fileDoc.originalName}...` });
            await fileDoc.updateOne({ status: 'ARCHIVING' });

            const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
            const CHUNK_SIZE = 15 * 1024 * 1024;
            let chunkBuffer = Buffer.alloc(0);
            const uploadPromises = [];
            let chunkIndex = 0;

            for await (const data of gDriveStream) {
                chunkBuffer = Buffer.concat([chunkBuffer, data]);
                while (chunkBuffer.length >= CHUNK_SIZE) {
                    const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
                    chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
                    uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
                }
            }
            if (chunkBuffer.length > 0) {
                uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
            }

            const messageIds = await Promise.all(uploadPromises);
            await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
            console.log(`[WORKER] SUCCESS: Transferred ${fileDoc.originalName} to Telegram.`);
        } catch (error) {
            console.error(`[WORKER] FATAL ERROR for ${fileDoc.originalName}. Aborting group.`, error);
            await fileDoc.updateOne({ status: 'ERROR' });
            allTransfersSucceeded = false;
            throw new Error(`Failed to transfer ${fileDoc.originalName}`);
        }
    }

    if (allTransfersSucceeded) {
        console.log(`[WORKER] All transfers for group ${groupId} successful. Starting cleanup.`);
        const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
        for (const transferredFile of successfullyTransferredFiles) {
            if (transferredFile.gDriveFileId) {
                try { await gDriveService.deleteFile(transferredFile.gDriveFileId); }
                catch (error) { console.error(`[WORKER] FAILED to delete ${transferredFile.gDriveFileId} from Drive.`); }
            }
        }
    } else {
        console.log(`[WORKER] Group ${groupId} failed. No files deleted from Drive.`);
    }

    await job.updateProgress({ message: 'Completed!' });
    return { status: 'done', groupId };
};

// --- EXPORT A FUNCTION TO INITIALIZE THE WORKER ---
function initializeWorker() {
    const worker = new Worker('archive-queue', processor, {
        connection,
        concurrency: 5,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
    });

    console.log('Worker initialized and waiting for jobs...');

    worker.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed! Result:`, result);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed with error:`, err.message);
    });
}

module.exports = { initializeWorker };