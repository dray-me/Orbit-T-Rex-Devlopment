const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { defaultPrefix } = require('../../config.json');

module.exports = {
  name: 'help',
  aliases: ['h'],
  description: 'Shows all available commands',

  async execute(message) {
    const totalCommands = getTotalCommands();

    // Categories
    const categories = [
      { label: 'Server', value: 'server', description: 'Get all Server commands' },
      { label: 'Moderation', value: 'moderation', description: 'Get all Moderation commands' },
      { label: 'Information', value: 'information', description: 'Get all Information commands' },
      { label: 'Giveaway', value: 'giveaway', description: 'Get all Giveaway commands' },
      { label: 'Utility', value: 'utility', description: 'Get all Utility commands' },
      { label: 'Fun', value: 'fun', description: 'Get all Fun commands' }
    ];

    // Select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-menu')
      .setPlaceholder('Select a category to view commands')
      .addOptions(categories);

    const dropdownRow = new ActionRowBuilder().addComponents(selectMenu);

    // Buttons
    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('help_home')
        .setLabel('Home')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('help_delete')
        .setLabel('Close')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('help_all')
        .setLabel('All Commands')
        .setStyle(ButtonStyle.Primary)
    );

    // Main container
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${message.client.user.username} Help Menu`)
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Stratos bot’s commands work without a prefix**\n\n` +
          `📁 __**Command Categories:**__\n` +
          `• Server\n• Moderation\n• Information\n• Giveaway\n• Utility\n• Fun`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# Requested by **${message.author.tag}**`)
      );

    // Send message
    const sentMessage = await message.channel.send({
      components: [container, dropdownRow, buttonsRow],
      flags: MessageFlags.IsComponentsV2
    });

    // Collector
    const collector = sentMessage.createMessageComponentCollector({ time: 600000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: '❌ | This menu is not for you!', ephemeral: true });
      }

      if (interaction.isStringSelectMenu()) {
        const selectedCategory = interaction.values[0];
        const categoryDetails = getCategoryDetails(selectedCategory);

        const categoryContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${categoryDetails.title}`)
          )
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(categoryDetails.description)
          );

        await interaction.update({
          components: [categoryContainer, dropdownRow, buttonsRow],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'help_home') {
          await interaction.update({
            components: [container, dropdownRow, buttonsRow],
            flags: MessageFlags.IsComponentsV2
          });
        }

        if (interaction.customId === 'help_delete') {
          await interaction.message.delete().catch(() => {});
        }

        if (interaction.customId === 'help_all') {
          const allContainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('# All Commands')
            )
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                '1. **Server Commands**\nmaintenance on, mt on, maintenance off, mt off, rename, deletechannel\n\n' +
                '2. **Moderation Commands**\nkick, ban, unban, lock, unlock, hide, unhide, purge, unhideall, hideall, lockall, unlockall\n\n' +
                '3. **Information Commands**\ninvite, help, support, ping, uptime, stats\n\n' +
                '4. **Giveaway Commands**\ngstart, gend, greroll\n\n' +
                '5. **Utility Commands**\nlist emojis, list bots, list roles, list boosters, list bans, serverinfo\n\n' +
                '6. **Fun Commands**\nslap, kiss, hug'
              )
            );

          await interaction.update({
            components: [allContainer, dropdownRow, buttonsRow],
            flags: MessageFlags.IsComponentsV2
          });
        }
      }
    });

    collector.on('end', () => {
      const disabledDropdown = new ActionRowBuilder().addComponents(selectMenu.setDisabled(true));
      const disabledButtons = new ActionRowBuilder().addComponents(
        buttonsRow.components.map(button => button.setDisabled(true))
      );
      sentMessage.edit({ components: [container, disabledDropdown, disabledButtons], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    });

    // Helpers
    function getTotalCommands() {
      const commandBasePath = path.join(__dirname, '../../commands');
      if (!fs.existsSync(commandBasePath)) return 0;

      let count = 0;
      const folders = fs.readdirSync(commandBasePath).filter(folder =>
        fs.statSync(path.join(commandBasePath, folder)).isDirectory()
      );

      for (const folder of folders) {
        count += fs.readdirSync(path.join(commandBasePath, folder)).filter(file => file.endsWith('.js')).length;
      }

      return count;
    }

    function getCategoryDetails(category) {
      const categoryData = {
        server: { title: 'Server Commands', description: 'maintenance on, mt on, maintenance off, mt off, rename, deletechannel' },
        moderation: { title: 'Moderation Commands', description: 'kick, ban, unban, lock, unlock, hide, unhide, purge, unhideall, hideall, lockall, unlockall' },
        information: { title: 'Information Commands', description: 'invite, help, support, ping, uptime, stats' },
        giveaway: { title: 'Giveaway Commands', description: 'gstart, gend, greroll' },
        utility: { title: 'Utility Commands', description: 'list emojis, list bots, list roles, list boosters, list bans, serverinfo' },
        fun: { title: 'Fun Commands', description: 'slap, kiss, hug' }
      };
      return categoryData[category];
    }
  }
};