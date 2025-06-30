// server/src/services/archival.service.js
const File = require('../models/File');
const gDriveService = require('./googleDrive.service');
const telegramService = require('./telegram.service');

async function transferGroupToTelegram(groupId) {
    const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
    let allTransfersSucceeded = true;

    console.log(`[WORKER] [GROUP ${groupId}] Starting transfer for ${filesInGroup.length} files.`);

    for (const fileDoc of filesInGroup) {
        try {
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
            console.log(`[WORKER] [GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName}`);
        } catch (error) {
            console.error(`[WORKER] [GROUP ${groupId}] FATAL ERROR on ${fileDoc.originalName}:`, error);
            await fileDoc.updateOne({ status: 'ERROR' });
            allTransfersSucceeded = false;
            break;
        }
    }

    if (allTransfersSucceeded) {
        console.log(`[WORKER] [GROUP ${groupId}] All transfers successful. Starting cleanup.`);
        const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
        for (const transferredFile of successfullyTransferredFiles) {
            if (transferredFile.gDriveFileId) {
                try {
                    await gDriveService.deleteFile(transferredFile.gDriveFileId);
                } catch (error) {
                    console.error(`[WORKER] [GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId}:`, error);
                }
            }
        }
    } else {
        console.log(`[WORKER] [GROUP ${groupId}] Transfer failed. No files will be deleted from Drive.`);
    }
    console.log(`[WORKER] [GROUP ${groupId}] Finished processing.`);
}

module.exports = { transferGroupToTelegram };