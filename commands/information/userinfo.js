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
  name: 'userinfo',
  aliases: ['whois', 'ui'],
  description: 'Shows detailed information about a user.',

  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(target.id);

    const createdAt = `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`;
    const joinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;
    const highestRole = member.roles.highest ? member.roles.highest.toString() : 'None';

    // Function to build containers for each tab
    const buildOverview = () =>
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# User Information: ${target.username}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `> **Username:** ${target.username}\n` +
            `> **Tag:** ${target.tag}\n` +
            `> **ID:** ${target.id}\n` +
            `> **Created:** ${createdAt}\n\n` +
            `> **Nickname:** ${member.nickname || 'None'}\n` +
            `> **Joined:** ${joinedAt}\n` +
            `> **Highest Role:** ${highestRole}`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Requested by **${message.author.tag}**`));

    const buildRoles = () => {
      const roles = member.roles.cache
        .filter(r => r.id !== message.guild.id)
        .map(r => r.toString())
        .join(', ') || 'No roles';
      return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# Roles for ${target.username}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(roles));
    };

    const buildPermissions = () => {
      const perms = member.permissions.toArray().join(', ') || 'No permissions';
      return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# Permissions for ${target.username}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(perms));
    };

    // Buttons row
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('userinfo_overview').setLabel('Overview').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('userinfo_roles').setLabel('Roles').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('userinfo_permissions').setLabel('Permissions').setStyle(ButtonStyle.Secondary),
      // Avatar button ab ek LINK hai
      new ButtonBuilder()
        .setLabel('Avatar')
        .setStyle(ButtonStyle.Link)
        .setURL(target.displayAvatarURL({ size: 1024 }))
    );

    // Send initial message
    const sent = await message.channel.send({
      components: [buildOverview(), buttons],
      flags: MessageFlags.IsComponentsV2
    });

    // Collector (5 minutes = 300000 ms)
    const collector = sent.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (interaction) => {
      if (!interaction.isButton()) return;
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: '❌ | This menu is not for you!', ephemeral: true });
      }

      let container;
      switch (interaction.customId) {
        case 'userinfo_overview':
          container = buildOverview();
          break;
        case 'userinfo_roles':
          container = buildRoles();
          break;
        case 'userinfo_permissions':
          container = buildPermissions();
          break;
      }

      await interaction.update({
        components: [container, buttons],
        flags: MessageFlags.IsComponentsV2
      });
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        buttons.components.map(btn =>
          btn.data.style === ButtonStyle.Link ? btn : btn.setDisabled(true) // link button disable nahi hota
        )
      );
      await sent.edit({
        components: [buildOverview(), disabledRow],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => {});
    });
  }
};