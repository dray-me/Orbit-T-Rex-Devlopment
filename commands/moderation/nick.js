const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
  name: 'nick',
  description: 'Change the nickname of a user',
  category: 'utility',
  usage: '<@user> <new nickname>',
  aliases: ['nickname'],
  execute: async (message, args) => {
    // Permission check (user)
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          {
            type: 1, // container
            components: [
              {
                type: 2, // text block (V2 raw object)
                text: '❌ You need **Manage Nicknames** permission to use this command!',
              },
            ],
          },
        ],
      });
    }

    // Permission check (bot)
    if (
      !message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator) ||
      !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)
    ) {
      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                text: '❌ I need **Administrator** and **Manage Nicknames** permissions!',
              },
            ],
          },
        ],
      });
    }

    // Get target user
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          {
            type: 1,
            components: [{ type: 2, text: 'Please mention a user.' }],
          },
        ],
      });
    }

    // Get nickname
    const newNickname = args.slice(1).join(' ');
    if (!newNickname) {
      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          {
            type: 1,
            components: [{ type: 2, text: 'Please provide a new nickname.' }],
          },
        ],
      });
    }

    try {
      await target.setNickname(newNickname);
      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                text: `✅ Changed **${target.user.tag}**'s nickname to **${newNickname}**`,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error('Error changing nickname:', error);
      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          {
            type: 1,
            components: [{ type: 2, text: '❌ Failed to change nickname!' }],
          },
        ],
      });
    }
  },
};