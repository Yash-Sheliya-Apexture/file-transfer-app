// server/src/services/queue.service.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Ensure you have REDIS_URL in your .env and on Render
const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null // Important for production
});

// Create the queue. We'll use this to add jobs.
const archivalQueue = new Queue('archival-queue', { connection });

console.log("Archival job queue initialized.");

module.exports = { archivalQueue, connection };