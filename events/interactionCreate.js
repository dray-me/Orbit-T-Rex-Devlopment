const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  InteractionType
} = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Dropdown Selection
    if (interaction.isStringSelectMenu() && interaction.customId === "report-menu") {
      const category = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`report-modal-${category}`)
        .setTitle("Submit Your Report");

      const input = new TextInputBuilder()
        .setCustomId("report-content")
        .setLabel("Describe the issue")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return await interaction.showModal(modal);
    }

    // Modal Submission
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith("report-modal-")) {
      const category = interaction.customId.split("-")[2];
      const content = interaction.fields.getTextInputValue("report-content");
      const reportChannel = client.channels.cache.get(config.reportChannelID);

      if (!reportChannel) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Report channel not found in config.")
          ],
          ephemeral: true
        });
      }

      const reportEmbed = new EmbedBuilder()
        .setColor("Blurple")
        .setAuthor({ name: `Stratos ${category}`, iconURL: client.user.displayAvatarURL() })
        .setTitle(`Reported by ${interaction.user.tag}`)
        .setDescription(content)
        .setFooter({ text: `Report submitted ${new Date().toLocaleString()}`, iconURL: interaction.user.displayAvatarURL() });

      await reportChannel.send({
        content: "<@1105408192537698334>",
        embeds: [reportEmbed]
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription("Your report has been submitted successfully!")
        ],
        ephemeral: true
      });
    }
  }
};