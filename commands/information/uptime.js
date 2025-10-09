const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags
} = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'uptime',
    description: 'Shows the bot\'s uptime using Components V2.',
    async execute(message) {
        const uptimeMs = message.client.uptime || 0;
        const uptimeStr = ms(uptimeMs, { long: true });

        // Create a container for Components V2
        const container = new ContainerBuilder();

        // Header
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('# Bot Uptime')
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        // Main content
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`⏱️ I have been online for **${uptimeStr}**`)
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        // Footer
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# Requested by **${message.author.tag}**`)
        );

        // Send the message with Components V2 flag
        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};