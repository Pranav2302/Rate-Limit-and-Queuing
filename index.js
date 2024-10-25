require('dotenv').config();
const cluster = require('cluster');
const numCPUs = 2;
const app = require('./src/app');
const logger = require('./src/config/logger');

if (cluster.isMaster) {
  logger.info(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Worker ${process.pid} started on port ${port}`);
  });
}