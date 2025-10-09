const fs = require("fs");
const logger = require("../utils/logger");

function loadEvents(client) {
  let eventCount = 0;
  
  try {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
      try {
        const event = require(`../events/${file}`);
        
        if (event.name && event.execute) {
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }
          eventCount++;
          logger.debug(`Loaded event: ${event.name}`);
        } else {
          logger.warn(`⚠️ Event in ${file} is missing name or execute property`);
        }
      } catch (error) {
        logger.error(`❌ Error loading event ${file}:`, error);
      }
    }
  } catch (error) {
    logger.error("❌ Error reading events directory:", error);
  }
  
  return eventCount;
}

module.exports = loadEvents;
