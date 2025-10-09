const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Autorole = require('../data/Autorole'); // MongoDB schema for autoroles

const filePath = path.join(__dirname, '../../data/welcomeConfig.json');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // ===== 1. WELCOME MESSAGE SYSTEM =====
        if (fs.existsSync(filePath)) {
            const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const guildId = member.guild.id;
            const data = config[guildId];
            if (data && data.channel) {
                const channel = member.guild.channels.cache.get(data.channel);
                if (channel && channel.send) {
                    const embedData = data.embed || {};
                    const embed = new EmbedBuilder()
                        .setColor(embedData.color || '#2b2d31')
                        .setTitle(replaceVars(embedData.title, member) || 'Welcome!')
                        .setDescription(replaceVars(embedData.description, member) || `Welcome to **${member.guild.name}**!`)
                        .setImage(embedData.image || null)
                        .setFooter(embedData.footer ? { text: replaceVars(embedData.footer, member) } : null);

                    channel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        }

        // ===== 2. AUTOROLE SYSTEM =====
        try {
            const data = await Autorole.findOne({ guildId: member.guild.id });
            if (!data) return;

            if (!member.user.bot && data.humanRoles.length > 0) {
                for (const roleId of data.humanRoles) {
                    const role = member.guild.roles.cache.get(roleId);
                    if (role) await member.roles.add(role).catch(() => {});
                }
            }
            if (member.user.bot && data.botRoles.length > 0) {
                for (const roleId of data.botRoles) {
                    const role = member.guild.roles.cache.get(roleId);
                    if (role) await member.roles.add(role).catch(() => {});
                }
            }
        } catch (err) {
            console.error(`Autorole Error: ${err}`);
        }
    }
};

// ===== Helper Function =====
function replaceVars(text, member) {
    if (!text) return null;
    return text
        .replace(/{user}/gi, `<@${member.id}>`)
        .replace(/{server}/gi, member.guild.name)
        .replace(/{memberCount}/gi, member.guild.memberCount.toString());
}