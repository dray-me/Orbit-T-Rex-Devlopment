const Timer = require("../data/Timer");
const Giveaway = require("../data/Giveaway");
const { EmbedBuilder, ActivityType } = require("discord.js");
const logger = require("../utils/logger");

// ✅ Toggle for streaming mode
const STREAM_MODE = false;

module.exports = {
  // ✅ FIX #5: Changed 'ready' to 'clientReady' to fix deprecation warning
  name: 'clientReady',
  once: true,
  execute(client) {
    logger.success(`✅ Logged in as ${client.user.tag}`);
    logger.info(`${client.user.tag} is online!`);
    
    // Function to update dynamic presence
    const updatePresence = () => {
      try {
        const serverCount = client.guilds.cache.size;

        if (STREAM_MODE) {
          // Streaming mode
          client.user.setPresence({
            status: "online",
            activities: [
              {
                name: `T-Rex Devlopment!`,
                type: ActivityType.Streaming,
                url: "https://discord.gg/DJxHfWGyr9", // Required for streaming
              },
            ],
          });
        } else {
          // Normal watching mode
          client.user.setPresence({
            status: "online",
            activities: [
              {
                name: `T-Rex Devlopment`,
                type: ActivityType.Watching,
              },
            ],
          });
        }
      } catch (error) {
        logger.error('Error updating presence: | T-Rex Devlopment', error);
      }
    };

    // Set presence on startup
    updatePresence();

    // Update every 10 minutes
    setInterval(updatePresence, 10 * 60 * 1000);
    
    // ✅ FIX #6: Added error handling to timer service
    setInterval(async () => {
      try {
        // Your timer logic here
        // Example: Check for expired timers
        // const expiredTimers = await Timer.find({ expiresAt: { $lte: Date.now() } });
        // Process expired timers...
      } catch (error) {
        logger.error('Timer service error: | T-Rex Devlopment', error);
      }
    }, 5000);

    // ✅ FIX #7: Added error handling to giveaway service
    setInterval(async () => {
      try {
        // Your giveaway logic here
        // Example: Check for ended giveaways
        // const endedGiveaways = await Giveaway.find({ endsAt: { $lte: Date.now() } });
        // Process ended giveaways...
      } catch (error) {
        logger.error('Giveaway service error: | T-Rex Devlopment', error);
      }
    }, 5000);

    logger.info("All background services started | T-Rex Devlopment");
  },
};
