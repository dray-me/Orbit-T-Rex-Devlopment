const {
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    ButtonBuilder,
    ButtonStyle,
    SeparatorBuilder,
    MessageFlags,
    PermissionFlagsBits,
} = require("discord.js");

module.exports = {
    name: "nuke",
    aliases: ["boom"],
    description: "Deletes and clones the current channel",
    usage: "!nuke",

    async execute(message, args) {
        try {
            // Permission check for the user
            if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
                const errorContainer = new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("❌ **Access Denied**\n\nYou don't have permission to nuke channels!")
                    )
                    .setAccentColor(0xFF0000);

                return message.reply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Permission check for the bot
            if (!message.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
                const errorContainer = new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("❌ **Bot Permission Error**\n\nI don't have permission to manage channels!")
                    )
                    .setAccentColor(0xFF0000);

                return message.reply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Confirmation container with Components v2
            const confirmContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000);

            // Header text
            confirmContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("⚠️ **Nuke Confirmation**")
            );

            confirmContainer.addSeparatorComponents(new SeparatorBuilder());

            // Warning section with confirm button
            confirmContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("**Are you sure you want to nuke this channel?**\nThis will completely delete and recreate the current channel."),
                        new TextDisplayBuilder().setContent("⚠️ **Warning:** This action cannot be undone!\n• All messages will be lost\n• Channel will be recreated in the same position")
                    )
                    .setButtonAccessory(
                        new ButtonBuilder()
                            .setCustomId("confirm_nuke")
                            .setLabel("💣 Confirm Nuke")
                            .setStyle(ButtonStyle.Danger)
                    )
            );

            confirmContainer.addSeparatorComponents(new SeparatorBuilder());

            // Cancel section
            confirmContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("**Changed your mind?**\nClick the button below to cancel the nuke operation.")
                    )
                    .setButtonAccessory(
                        new ButtonBuilder()
                            .setCustomId("cancel_nuke")
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Secondary)
                    )
            );

            const msg = await message.reply({
                components: [confirmContainer],
                flags: MessageFlags.IsComponentsV2
            });

            // Collector for button interactions
            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 30000, // Increased timeout for better UX
            });

            collector.on("collect", async (interaction) => {
                if (interaction.customId === "confirm_nuke") {
                    await interaction.deferUpdate();

                    try {
                        // Store channel information
                        const channelName = message.channel.name;
                        const position = message.channel.position;
                        
                        // Create success container
                        const successContainer = new ContainerBuilder()
                            .setAccentColor(0x00FF00)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("💣 **Channel Nuked Successfully!**\n\nThe channel has been deleted and recreated.")
                            );

                        // Clone and delete channel
                        const newChannel = await message.channel.clone();
                        await message.channel.delete();
                        await newChannel.setPosition(position);

                        return newChannel.send({
                            components: [successContainer],
                            flags: MessageFlags.IsComponentsV2
                        });
                        
                    } catch (error) {
                        console.error("Error during nuke process:", error);
                        
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xFF0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("❌ **Nuke Failed**\n\nAn error occurred while trying to nuke the channel. Please check permissions and try again.")
                            );

                        return interaction.followUp({
                            components: [errorContainer],
                            flags: MessageFlags.IsComponentsV2,
                            ephemeral: true
                        });
                    }
                }

                if (interaction.customId === "cancel_nuke") {
                    const cancelContainer = new ContainerBuilder()
                        .setAccentColor(0xFFA500)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("❌ **Nuke Cancelled**\n\nThe channel nuke operation has been cancelled.")
                        );

                    await interaction.update({
                        components: [cancelContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            });

            collector.on("end", async (collected) => {
                if (collected.size === 0) {
                    try {
                        const timeoutContainer = new ContainerBuilder()
                            .setAccentColor(0x808080)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("⌛ **Confirmation Timed Out**\n\nThe nuke confirmation has expired. Please run the command again if you still want to nuke the channel.")
                            );

                        await msg.edit({
                            components: [timeoutContainer],
                            flags: MessageFlags.IsComponentsV2
                        });
                    } catch (error) {
                        // Message might have been deleted, ignore error
                        console.log("Could not edit message - likely deleted during nuke process");
                    }
                }
            });

        } catch (err) {
            console.error("Nuke Command Error:", err);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("❌ **Command Error**\n\nAn unexpected error occurred while processing the nuke command.")
                );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};