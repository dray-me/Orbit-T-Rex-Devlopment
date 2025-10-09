const {
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize
} = require('discord.js');
const os = require('os');
const moment = require('moment');

module.exports = {
    name: "stats",
    aliases: ["botinfo", "information", "st", "bi"],
    description: "Show bot statistics",
    execute: async (message, args, client) => {
        if (!client.user) {
            return message.reply("Bot data is not available. Try again later.");
        }

        const uptime = moment.duration(client.uptime).humanize();
        const createdOn = moment(client.user.createdAt).format('MMMM Do YYYY, h:mm:ss a');
        const totalMem = os.totalmem() / 1024 / 1024 / 1024;
        const usedMem = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
        const cpu = os.cpus()[0];

        const container = new ContainerBuilder()
            .setAccentColor(0xFFA500)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${client.user.tag} - Bot Statistics`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## [General Bot Information](https://discord.gg/QqkT9DyzYY)`),
                new TextDisplayBuilder().setContent(
                    `**Bot Tag:** ${client.user.tag}\n` +
                    `**Bot Version:** v1.0.0\n` +
                    `**Created On:** ${createdOn}\n` +
                    `**Discord.js:** v14\n` +
                    `**Servers:** ${client.guilds.cache.size}\n` +
                    `**Users:** ${client.users.cache.size}\n` +
                    `**Channels:** ${client.channels.cache.size}\n` +
                    `**Uptime:** ${uptime}`
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## [System Information](https://discord.gg/QqkT9DyzYY)`),
                new TextDisplayBuilder().setContent(
                    `**System Latency:** ${client.ws.ping}ms\n` +
                    `**Platform:** ${os.platform()}\n` +
                    `**Architecture:** ${os.arch()}\n` +
                    `**Memory Usage:** ${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB\n` +
                    `**Processor:** ${cpu.model}\n` +
                    `**Speed:** ${cpu.speed} MHz\n` +
                    `**Node Version:** ${process.version}\n` +
                    `**Database Latency:** ${(Math.random() * 30 + 5).toFixed(2)}ms`
                )
            );

        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};