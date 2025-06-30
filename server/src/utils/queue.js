// server/src/utils/queue.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

const archiveQueue = new Queue('archive-queue', { connection });

module.exports = archiveQueue;