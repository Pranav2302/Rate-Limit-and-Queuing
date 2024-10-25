const taskQueue = require('./config/queue');
const processTask = require('./services/taskProcessor');

taskQueue.process(async (job) => {
  const { userId } = job.data;
  await processTask(userId);
});