const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  PermissionsBitField
} = require('discord.js');
const Ignore = require('../../data/Ignore');

module.exports = {
  name: 'ignore',
  description: 'Manage ignored channels and bypass roles',

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const noPerm = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Missing Permission**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('You need **Manage Channels** permission to use this command.')
        );

      return message.channel.send({
        components: [noPerm],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const [type, action] = args;
    const channel = message.mentions.channels.first();
    const role = message.mentions.roles.first();

    let data = await Ignore.findOne({ guildId: message.guild.id });
    if (!data) {
      data = new Ignore({
        guildId: message.guild.id,
        ignoredChannels: [],
        bypassRoles: []
      });
      await data.save();
    }

    // 📘 Help Message
    if (!type) {
      const help = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('# Ignore Command Help'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            '```bash\n' +
            'ignore channel add <channel>\n' +
            'ignore channel remove <channel>\n' +
            'ignore channel list\n' +
            'ignore channel reset\n' +
            'ignore bypass add <role>\n' +
            'ignore bypass remove <role>\n' +
            'ignore bypass list\n' +
            'ignore bypass reset\n' +
            '```\nUse these commands to manage ignored channels and bypass roles.'
          )
        );

      return message.channel.send({
        components: [help],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const response = new ContainerBuilder();

    // 📁 Channel Subcommands
    if (type === 'channel') {
      switch (action) {
        case 'add':
          if (!channel) return sendError('Mention a channel to ignore.');
          if (data.ignoredChannels.includes(channel.id)) return sendError('This channel is already ignored.');
          data.ignoredChannels.push(channel.id);
          await data.save();
          response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`✅ Channel <#${channel.id}> added to ignore list.`));
          break;

        case 'remove':
          if (!channel) return sendError('Mention a channel to remove.');
          if (!data.ignoredChannels.includes(channel.id)) return sendError('This channel is not in the ignore list.');
          data.ignoredChannels = data.ignoredChannels.filter(id => id !== channel.id);
          await data.save();
          response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`✅ Channel <#${channel.id}> removed from ignore list.`));
          break;

        case 'list':
          if (!data.ignoredChannels.length) return sendError('No ignored channels.');
          response
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# Ignored Channels'))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(data.ignoredChannels.map(id => `<#${id}>`).join('\n'))
            );
          break;

        case 'reset':
          data.ignoredChannels = [];
          await data.save();
          response.addTextDisplayComponents(new TextDisplayBuilder().setContent('✅ Ignore list reset.'));
          break;

        default:
          return sendError('Use: `ignore channel add/remove/list/reset`');
      }

      return message.channel.send({
        components: [response],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // 🛡️ Bypass Subcommands
    if (type === 'bypass') {
      switch (action) {
        case 'add':
          if (!role) return sendError('Mention a role to bypass ignore.');
          if (data.bypassRoles.includes(role.id)) return sendError('This role is already in the bypass list.');
          data.bypassRoles.push(role.id);
          await data.save();
          response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`✅ Role <@&${role.id}> added to bypass list.`));
          break;

        case 'remove':
          if (!role) return sendError('Mention a role to remove.');
          if (!data.bypassRoles.includes(role.id)) return sendError('This role is not in the bypass list.');
          data.bypassRoles = data.bypassRoles.filter(id => id !== role.id);
          await data.save();
          response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`✅ Role <@&${role.id}> removed from bypass list.`));
          break;

        case 'list':
          if (!data.bypassRoles.length) return sendError('No bypass roles configured.');
          response
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# Bypass Roles'))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(data.bypassRoles.map(id => `<@&${id}>`).join('\n'))
            );
          break;

        case 'reset':
          data.bypassRoles = [];
          await data.save();
          response.addTextDisplayComponents(new TextDisplayBuilder().setContent('✅ Bypass list reset.'));
          break;

        default:
          return sendError('Use: `ignore bypass add/remove/list/reset`');
      }

      return message.channel.send({
        components: [response],
        flags: MessageFlags.IsComponentsV2
      });
    }

    return sendError('Invalid usage. Use `ignore channel` or `ignore bypass`.');

    // 🔧 Error Helper
    function sendError(text) {
      const error = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Error**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(text));

      return message.channel.send({
        components: [error],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};