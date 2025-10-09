const { 
    PermissionsBitField, 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags,
    SeparatorBuilder 
} = require('discord.js');

module.exports = {
    name: 'deletechannel',
    aliases: ['deletech'],
    description: 'Deletes the mentioned or current channel with confirmation',
    
    run: async (message, args, client) => {
        // ✅ **Check Permissions**
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('❌ **Permission Denied**\n\nYou need `Manage Channels` permission to use this command.')
                );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('❌ **Bot Permission Error**\n\nI need `Manage Channels` permission to delete a channel.')
                );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // 🏷️ **Get Channel to Delete**
        let channel = message.mentions.channels.first() || message.channel;
        if (!channel) {
            const helpContainer = new ContainerBuilder()
                .setAccentColor(0xFFA500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('❌ **Invalid Usage**\n\nPlease mention a channel or use this command in the channel you want to delete.')
                );

            return message.reply({
                components: [helpContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ⚠️ **Warning Container with Components v2**
        const warningContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000);

        // Header warning
        warningContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('⚠️ **Delete Channel Warning**')
        );

        warningContainer.addSeparatorComponents(new SeparatorBuilder());

        // Main warning section with delete button
        warningContainer.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**Are you sure you want to delete #${channel.name}?**`),
                    new TextDisplayBuilder().setContent('⚠️ **This action cannot be undone!**\n• All messages in this channel will be permanently lost\n• Channel permissions and settings will be deleted\n• This cannot be reversed'),
                    new TextDisplayBuilder().setContent('Click the delete button below to confirm this destructive action.')
                )
                .setButtonAccessory(
                    new ButtonBuilder()
                        .setCustomId('confirm_deletechannel')
                        .setLabel('🗑️ Delete Channel')
                        .setStyle(ButtonStyle.Danger)
                )
        );

        const msg = await message.channel.send({
            components: [warningContainer],
            flags: MessageFlags.IsComponentsV2
        });

        // 🕐 **Collector for Button Response**
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'confirm_deletechannel') {
                await interaction.deferUpdate();

                try {
                    // ✅ **Deleting Message Container**
                    const deletingContainer = new ContainerBuilder()
                        .setAccentColor(0xFFA500)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('🗑️ **Deleting Channel**'),
                            new TextDisplayBuilder().setContent(`**#${channel.name}** is being deleted...`)
                        );

                    await msg.edit({
                        components: [deletingContainer],
                        flags: MessageFlags.IsComponentsV2
                    });

                    // 🗑️ **Delete Channel with delay for user to see confirmation**
                    setTimeout(async () => {
                        try {
                            await channel.delete();
                            
                            // If we're deleting the current channel, we can't send a success message
                            // The channel will be deleted and the message with it
                            
                        } catch (deleteError) {
                            console.error('Failed to delete channel:', deleteError);
                            
                            // Create error container for failed deletion
                            const errorContainer = new ContainerBuilder()
                                .setAccentColor(0xFF0000)
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent('❌ **Deletion Failed**'),
                                    new TextDisplayBuilder().setContent(`Failed to delete **#${channel.name}**.\n\nPossible reasons:\n• Insufficient permissions\n• Channel no longer exists\n• Discord API error`)
                                );

                            // Try to send error message in the same channel if it still exists
                            try {
                                await message.channel.send({
                                    components: [errorContainer],
                                    flags: MessageFlags.IsComponentsV2
                                });
                            } catch (sendError) {
                                // If we can't send in the original channel, try to send to the user
                                try {
                                    await message.author.send({
                                        components: [errorContainer],
                                        flags: MessageFlags.IsComponentsV2
                                    });
                                } catch (dmError) {
                                    console.error('Could not send error message anywhere:', dmError);
                                }
                            }
                        }
                    }, 2000);

                } catch (error) {
                    console.error('Error during deletion process:', error);
                    
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xFF0000)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('❌ **Unexpected Error**'),
                            new TextDisplayBuilder().setContent('An unexpected error occurred while trying to delete the channel.')
                        );

                    await interaction.followUp({
                        components: [errorContainer],
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true
                    });
                }
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                try {
                    const timeoutContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('⌛ **Confirmation Timed Out**'),
                            new TextDisplayBuilder().setContent(`The delete confirmation for **#${channel.name}** has expired.\n\nThe channel was not deleted. Run the command again if you still want to delete it.`)
                        );

                    await msg.edit({
                        components: [timeoutContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (error) {
                    // Message might have been deleted or channel removed, ignore error
                    console.log('Could not edit timeout message - likely channel was deleted or message removed');
                }
            }
        });
    }
};