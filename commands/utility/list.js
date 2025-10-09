const {
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize
} = require("discord.js");

// Define the emojis at the top
const tick = "<:tick:1343079179641557053>";
const cross = "<:info:1355153278060593154>";
const boosterEmoji = "<a:boost:1343247733141799094>";

module.exports = {
    name: "list",
    description: "Lists various server information",
    async execute(message, args) {
        const createErrorContainer = (description) => {
            return new ContainerBuilder()
                .setAccentColor(0x000000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${cross} ${description}`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("Stratos Development")
                );
        };

        if (!args[0]) {
            return message.reply({
                components: [createErrorContainer("Please specify a valid option: `boosters`, `bans`, `emojis`, `roles`, `bots`")],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const type = args[0].toLowerCase();
        let items = [];
        let title = "";
        let accentColor = 0xFFA500;

        try {
            switch (type) {
                case "boosters":
                case "boost":
                    const boosters = message.guild.members.cache.filter(m => m.premiumSince);
                    if (boosters.size === 0) {
                        return message.reply({
                            components: [createErrorContainer("This server has no boosters.")],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                    
                    title = `${boosterEmoji} Boosters in ${message.guild.name} [${boosters.size}]`;
                    items = Array.from(boosters.values()).map((booster, index) => 
                        `\`#${index + 1}.\` [${booster.user.tag}](https://discord.com/users/${booster.id}) [${booster}] - <t:${Math.floor(booster.premiumSinceTimestamp / 1000)}:R>`
                    );
                    break;

                case "bans":
                case "ban":
                    const bans = await message.guild.bans.fetch();
                    if (bans.size === 0) {
                        return message.reply({
                            components: [createErrorContainer("No banned users found in this server.")],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                    
                    title = `<:bans:1355153276126888027> Banned Users in ${message.guild.name} [${bans.size}]`;
                    items = Array.from(bans.values()).map((ban, index) => 
                        `\`#${index + 1}.\` ${ban.user.tag} (${ban.user.id}) - Reason: ${ban.reason || "No reason provided"}`
                    );
                    break;

                case "emojis":
                case "emoji":
                    const emojis = message.guild.emojis.cache;
                    if (emojis.size === 0) {
                        return message.reply({
                            components: [createErrorContainer("No emojis found in this server.")],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                    
                    title = `<:emojis:1355153246561239210> Emojis in ${message.guild.name} [${emojis.size}]`;
                    items = Array.from(emojis.values()).map((emoji, index) => 
                        `\`#${index + 1}.\` ${emoji} - \`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>\``
                    );
                    break;

                case "roles":
                case "role":
                    const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position);
                    if (roles.size === 0) {
                        return message.reply({
                            components: [createErrorContainer("No roles found in this server.")],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                    
                    title = `<:roles:1355153252609556610> Roles in ${message.guild.name} [${roles.size}]`;
                    items = Array.from(roles.values()).map((role, index) => 
                        `\`#${index + 1}.\` ${role} - \`[${role.id}]\``
                    );
                    break;

                case "bots":
                case "bot":
                    await message.guild.members.fetch();
                    const bots = message.guild.members.cache.filter(m => m.user.bot);
                    if (bots.size === 0) {
                        return message.reply({
                            components: [createErrorContainer("No bots found in this server.")],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                    
                    title = `<:bots_:1355153256929820762> Bots in ${message.guild.name} [${bots.size}]`;
                    items = Array.from(bots.values()).map((bot, index) => 
                        `\`#${index + 1}.\` [${bot.user.tag}](https://discord.com/users/${bot.id}) [${bot}]`
                    );
                    break;

                default:
                    return message.reply({
                        components: [createErrorContainer("Invalid option! Use: `boosters`, `bans`, `emojis`, `roles`, or `bots`")],
                        flags: MessageFlags.IsComponentsV2
                    });
            }

            // Pagination
            let currentPage = 0;
            const perPage = 10;
            const totalPages = Math.ceil(items.length / perPage);

            const createButtons = (page, total) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("◀")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId("delete")
                        .setLabel("🗑️ Delete")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("▶")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= total - 1)
                );
            };

            const generateContainer = (page) => {
                const start = page * perPage;
                const end = start + perPage;
                const pageItems = items.slice(start, end).join("\n") || "No items to display";
                const footerText = `Page ${page + 1}/${totalPages} | Stratos Development`;
                return new ContainerBuilder()
                    .setAccentColor(accentColor)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`**${title}**`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(pageItems)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(footerText)
                    )
                    .addActionRowComponents(createButtons(page, totalPages));
            };

            const response = await message.reply({ 
                components: [generateContainer(0)], 
                flags: MessageFlags.IsComponentsV2
            });

            const collector = response.createMessageComponentCollector({ 
                filter: i => i.user.id === message.author.id, 
                time: 60000 
            });

            collector.on("collect", async interaction => {
                await interaction.deferUpdate();
                if (interaction.customId === "prev") {
                    currentPage--;
                } else if (interaction.customId === "next") {
                    currentPage++;
                } else if (interaction.customId === "delete") {
                    await response.delete();
                    return;
                }

                await interaction.editReply({ 
                    components: [generateContainer(currentPage)], 
                    flags: MessageFlags.IsComponentsV2
                });
            });

            collector.on("end", () => {
                if (!response.deleted) {
                    const finalContainer = new ContainerBuilder()
                        .setAccentColor(accentColor)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**${title}**`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(items.slice(currentPage * perPage, (currentPage + 1) * perPage).join("\n") || "No items to display")
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`Page ${currentPage + 1}/${totalPages} | Stratos Development`)
                        );
                    response.edit({ 
                        components: [finalContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    }).catch(() => {});
                }
            });

        } catch (error) {
            console.error("List command error:", error);
            message.reply({ 
                components: [createErrorContainer("An error occurred while processing your request.")],
                flags: MessageFlags.IsComponentsV2
            }).catch(() => {});
        }
    }
};