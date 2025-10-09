const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require('discord.js');
const { ownerID } = require('../../config.json');

module.exports = {
  name: 'scount',
  description: '⌨️ Displays the bot\'s total server and user count (Owner only)',

  async execute(message, args, client) {
    if (message.author.id !== ownerID) {
      const deniedContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Access Denied**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('⌨️ This command is for the bot owner only.'));

      return message.reply({ components: [deniedContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const serverCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const statsContainer = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('📊 **Bot Statistics**'))
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`🖥️ Servers: **${serverCount}**`))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`👥 Users: **${userCount.toLocaleString()}**`))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`⌨️ Requested by ${message.author.tag}`));

    return message.channel.send({ components: [statsContainer], flags: MessageFlags.IsComponentsV2 });
  }
};