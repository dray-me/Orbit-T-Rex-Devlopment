const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { ownerID } = require('../../config.json');

module.exports = {
  name: 'reload',
  aliases: ['rlcmd', 'reloadcmd', 'refresh'],
  description: '⌨️ Reloads all commands',

  async execute(message, args, client) {
    if (message.author.id !== ownerID) {
      const deniedContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Access Denied**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('⌨️ You are not authorized to use this command.'));

      return message.reply({ components: [deniedContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const processingContainer = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('<a:Load:1363574418965790901> **Reloading commands, please wait...**'));

    const msg = await message.channel.send({ components: [processingContainer], flags: MessageFlags.IsComponentsV2 });

    try {
      client.commands.clear();

      const commandFolders = fs.readdirSync('./commands');
      for (const folder of commandFolders) {
        const commandFiles = fs
          .readdirSync(`./commands/${folder}`)
          .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
          const filePath = path.join(__dirname, `../${folder}/${file}`);
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);
          client.commands.set(command.name, command);
        }
      }

      const successContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('<:tick:1362840468668551198> **All commands have been successfully reloaded.**'));

      await msg.edit({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error('Error reloading commands:', error);

      const errorContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('<:cross:1362840470987870420> **An error occurred while reloading commands.**'));

      await msg.edit({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }
  }
};