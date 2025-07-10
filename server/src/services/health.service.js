const axios = require('axios');
const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const telegramService = require('./telegram.service');

// Parse the new JSON bot configuration
let botConfig;
try {
    botConfig = JSON.parse(process.env.TELEGRAM_BOT_TOKENS || '[]');
} catch (e) {
    throw new Error("FATAL: TELEGRAM_BOT_TOKENS in .env is not valid JSON.");
}
const botTokenMap = new Map(botConfig.map(bot => [bot.id, bot.token]));

const TEMP_UPLOAD_DIR = path.join(__dirname, '..', '..', 'tmp-uploads');
fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

const repairQueue = [];
let isRepairWorkerRunning = false;

async function isReplicaHealthy(fileId, botToken) {
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${botToken}`;
    try {
        await axios.get(`${TELEGRAM_API_URL}/getFile`, { params: { file_id: fileId }, timeout: 5000 });
        return true;
    } catch (error) {
        return false;
    }
}

async function runHealthCheck() {
    console.log("HEALTH CHECKER: Starting job to verify file integrity...");
    const desiredReplicaCount = parseInt(process.env.TELEGRAM_REPLICA_COUNT, 10) || 2;

    try {
        for (const file of await File.find({ status: 'IN_TELEGRAM' }).limit(100)) {
            let needsSave = false;
            for (const chunk of file.telegramChunks) {
                const healthyLocations = [];
                for (const location of chunk.locations) {
                    const token = botTokenMap.get(location.botId);
                    if (token && await isReplicaHealthy(location.fileId, token)) {
                        healthyLocations.push(location);
                    } else {
                        needsSave = true;
                    }
                }

                if (healthyLocations.length < chunk.locations.length) {
                    console.log(`HEALTH CHECKER: Pruned dead replicas for chunk ${chunk.order} of file ${file.originalName}.`);
                    chunk.locations = healthyLocations;
                }

                if (healthyLocations.length > 0 && healthyLocations.length < desiredReplicaCount) {
                    if (!repairQueue.some(j => j.fileId === file._id.toString() && j.chunkOrder === chunk.order)) {
                        console.log(`HEALTH CHECKER: Queuing chunk ${chunk.order} of file ${file.originalName} for repair.`);
                        repairQueue.push({ fileId: file._id.toString(), chunkOrder: chunk.order });
                    }
                } else if (healthyLocations.length === 0) {
                    if (file.status !== 'ERROR') {
                        console.error(`HEALTH CHECKER: FATAL! All replicas for chunk ${chunk.order} of ${file.originalName} lost.`);
                        file.status = 'ERROR';
                        needsSave = true;
                    }
                    break;
                }
            }
            if (needsSave) await file.save();
        }
    } catch (error) {
        console.error("HEALTH CHECKER: Error during health check.", error);
    }
    
    console.log("HEALTH CHECKER: Job finished.");
    if (repairQueue.length > 0) processRepairQueue();
}

async function processRepairQueue() {
    if (isRepairWorkerRunning || repairQueue.length === 0) return;
    isRepairWorkerRunning = true;
    const job = repairQueue.shift();
    console.log(`REPAIR WORKER: Starting job for file ${job.fileId}, chunk ${job.chunkOrder}.`);
    
    let tempChunkPath = null;
    try {
        const file = await File.findById(job.fileId);
        if (!file || file.status !== 'IN_TELEGRAM') throw new Error("File not found or not in Telegram.");
        
        const chunkToRepair = file.telegramChunks.find(c => c.order === job.chunkOrder);
        if (!chunkToRepair || chunkToRepair.locations.length === 0) throw new Error("Chunk has no healthy replicas.");
        
        const healthyLocation = chunkToRepair.locations[0];
        const healthyBotToken = botTokenMap.get(healthyLocation.botId);
        if (!healthyBotToken) throw new Error(`Source bot ID ${healthyLocation.botId} not in config.`);
        
        const chunkStream = await telegramService.getFileStream(healthyLocation.fileId, healthyBotToken);
        tempChunkPath = path.join(TEMP_UPLOAD_DIR, `repair-${file.groupId}-${job.chunkOrder}`);
        await new Promise((res, rej) => chunkStream.pipe(fs.createWriteStream(tempChunkPath)).on('finish', res).on('error', rej));
        
        const existingBotIds = new Set(chunkToRepair.locations.map(l => l.botId));
        const newBot = botConfig.find(bot => !existingBotIds.has(bot.id));
        if (!newBot) throw new Error("No available bots to create a new replica.");

        const chunkUploadName = `${file.originalName}.part${String(job.chunkOrder).padStart(4, '0')}`;
        console.log(`REPAIR WORKER: Uploading new replica for chunk ${job.chunkOrder} to Bot '${newBot.id}'`);
        const { messageId, fileId } = await telegramService.uploadFile(tempChunkPath, chunkUploadName, newBot.token);

        chunkToRepair.locations.push({ botId: newBot.id, messageId, fileId });
        await file.save();
        console.log(`REPAIR WORKER: Successfully repaired chunk ${job.chunkOrder} of file ${job.fileId}.`);
    } catch (error) {
        console.error(`REPAIR WORKER: Job for file ${job.fileId}, chunk ${job.chunkOrder} FAILED.`, error);
    } finally {
        if (tempChunkPath && fs.existsSync(tempChunkPath)) await fs.promises.unlink(tempChunkPath);
        isRepairWorkerRunning = false;
        process.nextTick(processRepairQueue);
    }
}

module.exports = { runHealthCheck };