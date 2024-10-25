const Queue = require('bull');
const logger = require('./logger');

const taskQueue = new Queue('taskQueue', {
  redis: {
    host: 'localhost',
    port: 6379
  },
  limiter: {
    max: 1,
    duration: 1000
  }
});

taskQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed for user ${job.data.userId}`);
});

taskQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed for user ${job.data.userId}:`, err);
});

module.exports = taskQueue;