const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionsBitField,
  ComponentType
} = require('discord.js');

module.exports = {
  name: 'unhideall',
  description: 'Unhides all channels in the server (public command)',

  async execute(message) {
    const client = message.client;

    // ✅ Permission Checks
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const noPermContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Permission Denied**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('You need `Manage Channels` permission to use this command.'));

      return message.reply({ components: [noPermContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const botPermContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Bot Permission Error**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('I need `Manage Channels` permission to unhide all channels.'));

      return message.reply({ components: [botPermContainer], flags: MessageFlags.IsComponentsV2 });
    }

    // 🟠 Initial Processing Message
    const processingContainer = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('<a:red_loading:1221326019986980894> | **Processing Command Please Wait**'));

    const msg = await message.channel.send({ components: [processingContainer], flags: MessageFlags.IsComponentsV2 });

    // 🕒 Delay before confirmation
    setTimeout(async () => {
      const confirmContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('⚠️ **Are you sure you want to unhide all channels in this server?**'))
        .addActionRowComponents(row =>
          row.addComponents(
            new ButtonBuilder().setCustomId('confirm_unhideall').setLabel('Yes').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cancel_unhideall').setLabel('No').setStyle(ButtonStyle.Danger)
          )
        );

      await msg.edit({ components: [confirmContainer], flags: MessageFlags.IsComponentsV2 });

      // 🕐 Collector
      const filter = i => i.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 15000, componentType: ComponentType.Button });

      collector.on('collect', async interaction => {
        await interaction.deferUpdate();

        if (interaction.customId === 'confirm_unhideall') {
          const startedContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('<:tick:1343079179641557053> | **Started unhiding all channels...**'));

          await msg.edit({ components: [startedContainer], flags: MessageFlags.IsComponentsV2 });

          let unhiddenChannels = 0;
          for (const channel of message.guild.channels.cache.values()) {
            if (channel.manageable) {
              await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: true
              }).catch(() => {});
              unhiddenChannels++;
            }
          }

          setTimeout(() => {
            const finalContainer = new ContainerBuilder()
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(`<:tick:1180470648053702657> | **Successfully unhid ${unhiddenChannels} channels**`));

            message.channel.send({ components: [finalContainer], flags: MessageFlags.IsComponentsV2 });
          }, 2000);
        }

        if (interaction.customId === 'cancel_unhideall') {
          const cancelContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ | **Unhiding process cancelled.**'));

          await msg.edit({ components: [cancelContainer], flags: MessageFlags.IsComponentsV2 });
        }
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(() => {});
      });
    }, 2000);
  }
};