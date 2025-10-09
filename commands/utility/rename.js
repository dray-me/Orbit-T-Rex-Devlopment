const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  PermissionsBitField
} = require('discord.js');

module.exports = {
  name: 'rename',
  description: 'Rename the current channel',
  category: 'utility',
  usage: '<new name>',
  aliases: ['renamechannel'],

  async execute(message, args) {
    // ❌ User lacks permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const noPerm = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Missing Permission**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('<:cross:1354835259107180687> You need **Manage Channels** permission to use this command!')
        );

      return message.channel.send({
        components: [noPerm],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // ❌ Bot lacks permission
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const botPerm = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Missing Bot Permission**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('<:cross:1354835259107180687> I need **Administrator** permission to rename the channel!')
        );

      return message.channel.send({
        components: [botPerm],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // ❌ No name provided
    if (!args.length) {
      const noName = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Missing Channel Name**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('<:cross:1354835259107180687> Please provide a new name for the channel!')
        );

      return message.channel.send({
        components: [noName],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const newName = args.join(' ');

    try {
      await message.channel.setName(newName);

      const success = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Channel Renamed Successfully**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<:tick:1354835257223807036> Channel renamed to ${message.channel}`)
        );

      await message.channel.send({
        components: [success],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error('Error renaming channel:', error);

      const errorContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Rename Failed**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('<:cross:1354835259107180687> An error occurred while renaming the channel!')
        );

      await message.channel.send({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};