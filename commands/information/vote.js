const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags
} = require('discord.js');

module.exports = {
  name: 'vote',
  description: 'Vote for Stratos on Top.gg',

  async execute(message) {
    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('# Support Stratos!'))
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Vote for [**Stratos**](https://top.gg/bot/1294987004483862528/vote) on Top.gg to help us grow!\n\nYour support is appreciated 💙`
        )
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Vote Stratos')
        .setStyle(ButtonStyle.Link)
        .setURL('https://top.gg/bot/1294987004483862528/vote')
    );

    await message.channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2
    });
  }
};