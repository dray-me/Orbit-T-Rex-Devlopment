const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require('discord.js');
const Ignore = require('../data/Ignore');
const NoPrefix = require('../data/Noprefix');
const AutoResponder = require('../data/Autoresponder');
const Prefix = require('../data/Prefix');
const config = require('../config.json');

const processedMessages = new Set();

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot || !message.guild) return;
    if (processedMessages.has(message.id)) return;
    processedMessages.add(message.id);
    if (processedMessages.size > 1000) {
      const first = processedMessages.values().next().value;
      processedMessages.delete(first);
    }

    // 📌 AutoResponder
    try {
      const allResponders = await AutoResponder.find({ guildId: message.guild.id });
      if (allResponders.length) {
        const contentLower = message.content.toLowerCase();
        const matched = allResponders.find(ar => contentLower.includes(ar.trigger.toLowerCase()));

        if (matched) {
          if (matched.response) {
            if (matched.embed) {
              const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(matched.response));
              if (matched.footer) {
                container.addSeparatorComponents(new SeparatorBuilder())
                  .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${matched.footer}`));
              }

              await message.channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
              });
            } else {
              await message.channel.send(matched.response);
            }
          }

          if (matched.reacts?.length) {
            for (const emoji of matched.reacts) {
              try {
                await message.react(emoji);
              } catch (err) {
                console.warn(`Failed to react with ${emoji}:`, err.message);
              }
            }
          }

          return;
        }
      }
    } catch (err) {
      console.error('Autoresponder/Autoreact Error:', err);
    }

    // 📌 Custom Prefix
    let guildPrefix = config.defaultPrefix;
    try {
      const prefixData = await Prefix.findOne({ guildId: message.guild.id });
      if (prefixData?.prefix) guildPrefix = prefixData.prefix;
    } catch (err) {
      console.error('Prefix Fetch Error:', err);
    }

    const botMention = `<@${client.user.id}>`;
    let args, commandName;

    const isMentionCommand = message.content.startsWith(botMention);
    const isPrefixedCommand = message.content.startsWith(guildPrefix);

    // 📌 No-Prefix System
    const data = await NoPrefix.findOne({ userId: message.author.id });
    const hasNoPrefix = data && (!data.expiresAt || data.expiresAt > Date.now());

    if (!isMentionCommand && !isPrefixedCommand && !hasNoPrefix) return;

    if (isMentionCommand) {
      args = message.content.slice(botMention.length).trim().split(/ +/);
    } else if (isPrefixedCommand) {
      args = message.content.slice(guildPrefix.length).trim().split(/ +/);
    } else if (hasNoPrefix) {
      args = message.content.trim().split(/ +/);
    }

    commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command =
      client.commands.get(commandName) ||
      client.commands.find(cmd => cmd.aliases?.includes(commandName));
    if (!command) return;

    // 📌 Owner-only check
    if (command.ownerOnly && message.author.id !== config.ownerID) {
      const ownerError = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Owner Only Command**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('❌ This command can only be used by the bot owner!'));

      return message.channel.send({
        components: [ownerError],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // 📌 Ignore System
    try {
      const ignoreData = await Ignore.findOne({ guildId: message.guild.id });
      if (ignoreData?.ignoredChannels.includes(message.channel.id)) {
        const hasBypass = message.member.roles.cache.some(role =>
          ignoreData.bypassRoles.includes(role.id)
        );
        if (!hasBypass) {
          const ignoreContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Ignored Channel**'))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('🚫 This channel is ignored for commands'));

          const reply = await message.channel.send({
            components: [ignoreContainer],
            flags: MessageFlags.IsComponentsV2
          });

          setTimeout(() => reply.delete().catch(() => {}), 5000);
          return;
        }
      }
    } catch (err) {
      console.error('Ignore Check Error:', err);
    }

    // 📌 Execute Command
    try {
      await (command.execute || command.run)(message, args, client);
    } catch (error) {
      console.error('Command Error:', error);
    }
  }
};