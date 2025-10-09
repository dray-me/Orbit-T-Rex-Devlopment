const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require('discord.js');
const { ownerID } = require('../../config.json');

module.exports = {
  name: 'dm',
  aliases: [],
  description: '⌨️ Send a secret message to a user or all members.',

  async execute(message, args) {
    if (message.author.id !== ownerID) {
      const deniedContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Access Denied**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('⌨️ You are not authorized to use this command.'));

      return message.reply({ components: [deniedContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (!args.length) {
      const usageContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Missing Arguments**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Usage:\n`dm @user <message>`\n`dm all <message>`'))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Requested by ${message.author.tag}`));

      return message.reply({ components: [usageContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const target = args[0].toLowerCase();
    const dmMessage = args.slice(1).join(' ');

    if (target === 'all') {
      if (!dmMessage) {
        const missingMessageContainer = new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Missing Message**'))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(new TextDisplayBuilder().setContent('Please provide a message: `dm all <message>`'));

        return message.reply({ components: [missingMessageContainer], flags: MessageFlags.IsComponentsV2 });
      }

      const members = message.guild.members.cache.filter(member => !member.user.bot);
      let successCount = 0;
      let failCount = 0;

      for (const member of members.values()) {
        await member.send({
          content: `🔒 **Secret Message For You**\n${dmMessage}\n\nSent by ${message.author.tag}`
        }).then(() => successCount++)
          .catch(() => failCount++);
      }

      const resultContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('📬 **DM Broadcast Complete**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`✅ Sent to: ${successCount} members\n❌ Failed: ${failCount} members`));

      return message.channel.send({ components: [resultContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const user = message.mentions.users.first();
    if (!user) {
      const mentionContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Missing Mention**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Please mention a user: `dm @user <message>`'));

      return message.reply({ components: [mentionContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (!dmMessage) {
      const missingMessageContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ **Missing Message**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Please provide a message: `dm @user <message>`'));

      return message.reply({ components: [missingMessageContainer], flags: MessageFlags.IsComponentsV2 });
    }

    user.send({
      content: `🔒 **Secret Message For You**\n${dmMessage}\n\nSent by ${message.author.tag}`
    }).then(() => {
      const successContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`✅ Successfully sent a DM to **${user.tag}**.`));

      message.channel.send({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    }).catch(() => {
      const failContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`❌ Failed to send a DM to **${user.tag}**.`));

      message.channel.send({ components: [failContainer], flags: MessageFlags.IsComponentsV2 });
    });
  }
};