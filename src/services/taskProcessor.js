const logger = require('../config/logger');

async function processTask(userId) {
  logger.info(`${userId}-task completed at-${Date.now()}`);
}

module.exports = processTask;