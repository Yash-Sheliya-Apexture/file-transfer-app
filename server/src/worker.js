// server/src/worker.js
const { Worker } = require('bullmq');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connection } = require('./services/queue.service'); // Import connection
const { transferGroupToTelegram } = require('./services/archival.service');

const workerName = `worker-${process.pid}`;
console.log(`Starting ${workerName}...`);

// The worker processes jobs from the 'archival-queue'
const worker = new Worker('archival-queue', async job => {
    console.log(`[${workerName}] Processing job ${job.id} for group ${job.data.groupId}`);
    try {
        await transferGroupToTelegram(job.data.groupId);
        console.log(`[${workerName}] Successfully processed job ${job.id}`);
    } catch (error) {
        console.error(`[${workerName}] FAILED to process job ${job.id}:`, error);
        // Throw the error again so BullMQ knows the job failed and can retry it
        throw error;
    }
}, { 
    connection,
    // Add concurrency to process multiple jobs at once if needed
    concurrency: 5, 
    // Automatically remove completed jobs to keep the queue clean
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});