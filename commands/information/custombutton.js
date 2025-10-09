const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  name: 'custombutton',
  description: 'Sends a message with a custom ID button using Components V2',

  async execute(message) {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# Custom Button Example')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('Click the button below to trigger an interaction.')
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('custom_button_pressed') // ✅ This is your custom ID
        .setLabel('Click Me') // ✅ Required for non-link buttons
        .setStyle(ButtonStyle.Primary) // ✅ Choose style: Primary, Secondary, Success, Danger
    );

    await message.channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2
    });
  }
};