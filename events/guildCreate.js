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
  name: 'guildCreate',
  async execute(guild, client) {
    try {
      // Leave if server has fewer than 20 members
      if (guild.memberCount < 20) {
        const container = new ContainerBuilder();

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# Important Message')
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `> You cannot add me if your server has less than **20 members**.\n` +
            `> Since this server has **${guild.memberCount} members**, I have to leave this server.\n\n` +
            `> For any queries related to the bot, please join our [Support Server](https://discord.gg/DJxHfWGyr9)`
          )
        );

        const channel = guild.channels.cache.find(
          ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has(['SendMessages', 'ViewChannel'])
        );

        if (channel) {
          await channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        console.log(`🚪 Left server "${guild.name}" (member count: ${guild.memberCount}) due to low members.`);
        await guild.leave();
        return;
      }

      // Normal flow for valid servers
      const fetchedLogs = await guild.fetchAuditLogs({ type: 28, limit: 1 });
      const botAddLog = fetchedLogs.entries.first();
      const inviter = botAddLog?.executor;

      if (!inviter) {
        console.log(`Bot added to ${guild.name}, but inviter not found.`);
        return;
      }

      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Thank you for adding Stratos!`)
      );

      container.addSeparatorComponents(new SeparatorBuilder());

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> I am T-Rex Devlopment Team Member aka ~ Dray !!\n` +
          `> Use the \`help\` command to see all features.\n` +
          `> Need help? Visit our [Support Server](https://discord.gg/S6AjkyQKNZ)`
        )
      );

      container.addSeparatorComponents(new SeparatorBuilder());

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# Developed With ❤️ By The Arnab`)
      );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Invite Me')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot+applications.commands`),
        new ButtonBuilder()
          .setLabel('Support')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/S6AjkyQKNZ')
      );

      await inviter.send({
        components: [container, row],
        flags: MessageFlags.IsComponentsV2
      });

      console.log(`🔸 Sent welcome message to ${inviter.tag}`);
    } catch (error) {
      console.error('Failed to send welcome message or process guild join: | T-Rex Devlopment', error);
    }
  }
};