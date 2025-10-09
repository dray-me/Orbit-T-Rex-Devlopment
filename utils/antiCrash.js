const logger = require('./utils/logger');


module.exports = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('[AntiCrash] Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err, origin) => {
    logger.error('[AntiCrash] Uncaught Exception:', err);
  });

  process.on('uncaughtExceptionMonitor', (err, origin) => {
    logger.error('[AntiCrash] Uncaught Exception Monitor:', err);
  });

  process.on('multipleResolves', (type, promise, reason) => {
    logger.warn('[AntiCrash] Multiple Resolves:', type, reason);
  });
};