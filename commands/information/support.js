const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  name: 'support',
  description: 'Get the support server link and bot invite link',

  async execute(message, args, client) {
    const supportLink = 'https://discord.gg/5ZJ9TVNafR';

    // Dynamically generated OAuth2 invite link for your bot
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

    // Components V2 container content
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# Support and invite')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('Join the support server or invite the bot to your server.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Requested by **${message.author.tag}**`)
    );

    // Buttons must be inside an ActionRow
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Support server')
        .setStyle(ButtonStyle.Link)
        .setURL(supportLink),
      new ButtonBuilder()
        .setLabel('Invite me')
        .setStyle(ButtonStyle.Link)
        .setURL(inviteLink)
    );

    await message.channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};