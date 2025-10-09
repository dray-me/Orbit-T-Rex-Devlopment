const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    name: 'serverinfo',
    aliases: ['si'],
    description: 'Shows detailed information about the server.',
    
    async execute(message) {
        const { guild } = message;

        // Gather server details
        const owner = await guild.fetchOwner();
        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`; // relative timestamp
        const memberCount = guild.memberCount;
        const channelCount = guild.channels.cache.size;
        const roleCount = guild.roles.cache.size;
        const boostCount = guild.premiumSubscriptionCount;

        // Build container
        const container = new ContainerBuilder();

        // Header
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Server Information`)
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        // Main info
        const infoText =
            `> **Name:** ${guild.name}\n` +
            `> **ID:** ${guild.id}\n` +
            `> **Owner:** ${owner.user.tag}\n` +
            `> **Created:** ${createdAt}\n` +
            `> **Members:** ${memberCount}\n` +
            `> **Channels:** ${channelCount}\n` +
            `> **Roles:** ${roleCount}\n` +
            `> **Boosts:** ${boostCount}`;

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(infoText)
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        // Footer
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# Requested by **${message.author.tag}**`)
        );

        // Send with Components V2 flag
        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};