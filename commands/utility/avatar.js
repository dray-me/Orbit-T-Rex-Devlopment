const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize
} = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp', 'profilepic'],
  description: '🖼️ Shows a user\'s avatar in high quality',
  usage: '!avatar [@user | userID]',

  async execute(message, args) {
    const client = message.client;

    try {
      let targetUser;

      if (message.mentions.users.first()) {
        targetUser = message.mentions.users.first();
      } else if (args[0]) {
        try {
          targetUser = await client.users.fetch(args[0]);
        } catch {
          const errorContainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder()
                .setContent('<a:Cross:1388004008467103836> **User Not Found**\nCould not find that user. Please mention a user or provide a valid user ID.')
            );
          return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
      } else {
        targetUser = message.author;
      }

      let guildMember = null;
      try {
        guildMember = await message.guild.members.fetch(targetUser.id);
      } catch {}

      const globalAvatar = targetUser.displayAvatarURL({ dynamic: true, size: 4096 });
      const serverAvatar = guildMember?.avatarURL({ dynamic: true, size: 4096 }) || null;
      const avatarToShow = serverAvatar || globalAvatar;
      const isServerAvatar = !!serverAvatar;

      const formatLinks = [
        `[PNG](${targetUser.displayAvatarURL({ format: 'png', size: 1024 })})`,
        `[JPG](${targetUser.displayAvatarURL({ format: 'jpg', size: 1024 })})`,
        `[WEBP](${targetUser.displayAvatarURL({ format: 'webp', size: 1024 })})`
      ];
      if (avatarToShow.includes('.gif')) {
        formatLinks.push(`[GIF](${targetUser.displayAvatarURL({ format: 'gif', size: 1024 })})`);
      }

      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🖼️ ${targetUser.username}'s Avatar\n${isServerAvatar ? '**Type:** Server Avatar' : '**Type:** Global Avatar'}`)
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        )
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder()
              .setURL(avatarToShow)
              .setDescription(`${targetUser.username}'s ${isServerAvatar ? 'server' : 'global'} avatar`)
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`**Download Formats:** ${formatLinks.join(' • ')}`)
        );

      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    } catch (error) {
      console.error('❌ Error in avatar command:', error);
      const errorContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent('<a:Cross:1388004008467103836> **An error occurred while fetching the avatar. Please try again.**')
        );
      return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }
  }
};