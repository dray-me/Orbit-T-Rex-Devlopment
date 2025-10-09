const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require('discord.js');

module.exports = {
  name: 'messageCreate',
  execute(message, client) {
    if (message.author.bot || !message.guild) return;

    if (message.content.trim() === `<@${client.user.id}>`) {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Hey, It's Me ${client.user.username}`)
      );

      container.addSeparatorComponents(new SeparatorBuilder());

      container.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Hi, I'm T-Rex Development Team Member aka **~ Dray !!**.`),
            new TextDisplayBuilder().setContent(`It's your ultimate server management bot. Make By T-Rex Dev's`),
            new TextDisplayBuilder().setContent(`Language: English\nServer ID: ${message.guild.id}`),
            new TextDisplayBuilder().setContent(`Developed with ❤️ by T-Rex Devlopment`)
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
            )
          )
      );

      container.addSeparatorComponents(new SeparatorBuilder());

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};