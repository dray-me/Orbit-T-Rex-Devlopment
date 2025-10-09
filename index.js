const { connect } = require("mongoose");
const config = require("./config.json");
const logger = require("./utils/logger");
const client = require("./client/botClient");

async function initializeBot() {
  try {
    await connect(config.mongoURI);
    logger.success("✅ Connected to MongoDB | T-Rex Devlopment");
    
    await client.login(config.token);
    logger.debug("🔑 Login process initiated | T-Rex Devlopment");
    
  } catch (error) {
    logger.error("❌ Bot initialization failed: | T-Rex Devlopment", error);
    // Do not exit the process here; allow manual restart or operator intervention.
    return;
  }
}

// ✅ FIX #1: DO NOT destroy client on unhandled rejections
// Just log the error and continue - individual commands should handle their own errors
process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Unhandled Promise Rejection at: | T-Rex Devlopment", promise);
  logger.error("Reason:", reason);
  // Log the stack trace for debugging
  if (reason && reason.stack) {
    logger.error("Stack:", reason.stack);
  }
  // DO NOT destroy the client - the bot should continue running
});

// ✅ FIX #2: DO NOT destroy client on uncaught exceptions
// Log and let process manager handle restarts if needed
process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception: | T-Rex Devlopment", error);
  if (error && error.stack) {
    logger.error("Stack:", error.stack);
  }
  // DO NOT destroy the client - the bot should continue running
});

process.on("SIGINT", () => {
  logger.info("🛑 Received SIGINT. Graceful shutdown... | T-Rex Devlopment");
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("🛑 Received SIGTERM. Graceful shutdown... | T-Rex Devlopment");
  client.destroy();
  process.exit(0);
});

initializeBot();

module.exports = client;
