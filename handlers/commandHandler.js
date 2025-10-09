const fs = require("fs");
const logger = require("../utils/logger");

function loadCommands(client) {
  let commandCount = 0;
  
  try {
    const commandFolders = fs.readdirSync('./commands');
    
    for (const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        try {
          const command = require(`../commands/${folder}/${file}`);
          
          if (command.name) {
            client.commands.set(command.name, command);
            commandCount++;
          } else {
            logger.warn(`⚠️ Command in ${folder}/${file} is missing a name property`);
          }
        } catch (error) {
          logger.error(`❌ Error loading command ${folder}/${file}:`, error);
        }
      }
    }
  } catch (error) {
    logger.error("❌ Error reading commands directory:", error);
  }
  
  return commandCount;
}

module.exports = loadCommands;
