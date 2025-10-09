const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const logger = require("../utils/logger");
const commandHandler = require("../handlers/commandHandler");
const eventHandler = require("../handlers/eventHandler");


// Initialize client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  allowedMentions: {
    repliedUser: false,
    parse: ["users", "roles"],
  },
});

// Initialize collections
client.commands = new Collection();

// Load handlers
const commandCount = commandHandler(client);
const eventCount = eventHandler(client);

// ✅ FIX #3: Changed 'ready' to 'clientReady' to fix deprecation warning
// ✅ FIX #4: Removed duplicate ready handler - now handled in events/ClientReady.js
// The ready event logic has been moved to /app/events/ClientReady.js
// to avoid duplicate handlers and follow the event handler pattern

logger.info(`🛠️  Loaded ${commandCount} commands`);
logger.info(`🎉 Loaded ${eventCount} events`);

module.exports = client;
