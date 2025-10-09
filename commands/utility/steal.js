const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  GuildPremiumTier,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ThumbnailBuilder
} = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'steal',
  description: 'Steal emojis or stickers from other servers',
  aliases: ['eadd'],
  usage: '[emoji] or reply to a message with attachments/stickers/emojis',
  permissions: [PermissionFlagsBits.ManageEmojisAndStickers],
  cooldown: 3,
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
      return message.reply({
        components: [
          new ContainerBuilder()
            .setAccentColor(0x2f3136)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("❌ You need `Manage Emojis & Stickers` permission to use this!")
            )
        ],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (message.reference) {
      const refMessage = await message.channel.messages.fetch(message.reference.messageId);
      const attachments = refMessage.attachments;
      const stickers = refMessage.stickers;
      const emojis = refMessage.content.match(/<a?:.+?:\d+>/g) || [];

      if (attachments.size > 0 || stickers.size > 0 || emojis.length > 0) {
        return createButtons(message, attachments, stickers, emojis);
      }
    }

    if (args[0]) {
      return processEmoji(message, args[0]);
    }

    return message.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0x2f3136)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Steal")
          )
          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("No emoji or sticker found")
          )
      ],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

async function processEmoji(message, emote) {
  try {
    const emojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
    const match = emote.match(emojiRegex);

    if (!match) {
      return message.reply({
        components: [
          new ContainerBuilder()
            .setAccentColor(0x2f3136)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("# Steal")
            )
            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("Invalid emoji format")
            )
        ],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const [, animated, name, emojiId] = match;
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;
    await addEmoji(message, url, name, !!animated);
  } catch (error) {
    console.error(error);
    message.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0x2f3136)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Steal")
          )
          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Failed to add emoji: ${error.message}`)
          )
      ],
      flags: MessageFlags.IsComponentsV2
    });
  }
}

async function addEmoji(message, url, name, animated) {
  try {
    if (!hasEmojiSlot(message.guild, animated)) {
      return message.reply({
        components: [
          new ContainerBuilder()
            .setAccentColor(0x2f3136)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("# Steal")
            )
            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("No more emoji slots available")
            )
        ],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const sanitizedName = sanitizeName(name);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const emoji = await message.guild.emojis.create({
      attachment: response.data,
      name: sanitizedName
    });

    return message.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0x2f3136)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Steal")
          )
          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Added emoji **${emoji}**!`)
          )
      ],
      flags: MessageFlags.IsComponentsV2
    });
  } catch (error) {
    console.error(error);
    return message.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0x2f3136)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Steal")
          )
          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Failed to add emoji: ${error.message}`)
          )
      ],
      flags: MessageFlags.IsComponentsV2
    });
  }
}

async function addSticker(message, url, name) {
  try {
    if (message.guild.stickers.cache.size >= getMaxStickerCount(message.guild)) {
      return message.reply({
        components: [
          new ContainerBuilder()
            .setAccentColor(0x2f3136)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("# Steal")
            )
            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("No more sticker slots available")
            )
        ],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const sanitizedName = sanitizeName(name);
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    await message.guild.stickers.create({
      file: Buffer.from(response.data),
      name: sanitizedName,
      description: "Added by bot",
      tags: "stolen"
    });

    return message.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0x2f3136)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Steal")
          )
          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Added sticker **${sanitizedName}**!`)
          )
      ],
      flags: MessageFlags.IsComponentsV2
    });
  } catch (error) {
    console.error(error);
    return message.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0x2f3136)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Steal")
          )
          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Failed to add sticker: ${error.message}`)
          )
      ],
      flags: MessageFlags.IsComponentsV2
    });
  }
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
}

function hasEmojiSlot(guild, animated) {
  const normalEmojis = guild.emojis.cache.filter(e => !e.animated).size;
  const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
  const [maxNormal, maxAnimated] = getMaxEmojiCount(guild);
  return animated ? animatedEmojis < maxAnimated : normalEmojis < maxNormal;
}

function getMaxEmojiCount(guild) {
  switch (guild.premiumTier) {
    case GuildPremiumTier.Tier3: return [250, 250];
    case GuildPremiumTier.Tier2: return [150, 150];
    case GuildPremiumTier.Tier1: return [100, 100];
    default: return [50, 50];
  }
}

function getMaxStickerCount(guild) {
  switch (guild.premiumTier) {
    case GuildPremiumTier.Tier3: return 60;
    case GuildPremiumTier.Tier2: return 30;
    case GuildPremiumTier.Tier1: return 15;
    default: return 5;
  }
}

async function createButtons(message, attachments, stickers, emojis) {
  const getPreviewUrl = () => {
    if (attachments.size > 0) return attachments.first().url;
    if (stickers.size > 0) return stickers.first().url;
    if (emojis.length > 0) {
      const emote = emojis[0];
      const isAnimated = emote.startsWith('<a:');
      const emojiId = emote.match(/:(\d+)>/)[1];
      return `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
    }
    return null;
  };

  const previewUrl = getPreviewUrl();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('steal_emoji')
      .setLabel('Steal as Emoji')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('steal_sticker')
      .setLabel('Steal as Sticker')
      .setStyle(ButtonStyle.Success)
  );

  const choiceContainer = new ContainerBuilder()
    .setAccentColor(0x2f3136)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("# Steal")
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("Choose what to steal:")
    );

  if (previewUrl) {
    choiceContainer
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("**Preview**")
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(previewUrl)
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
  }

  choiceContainer.addActionRowComponents(row);

  const reply = await message.reply({ 
    components: [choiceContainer], 
    flags: MessageFlags.IsComponentsV2 
  });

  const collector = reply.createMessageComponentCollector({ time: 15000 });

  const createDisabledContainer = () => {
    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('steal_emoji')
        .setLabel('Steal as Emoji')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('steal_sticker')
        .setLabel('Steal as Sticker')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
    );

    const disabledContainer = new ContainerBuilder()
      .setAccentColor(0x2f3136)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("# Steal")
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Choose what to steal:")
      );

    if (previewUrl) {
      disabledContainer
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("**Preview**")
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder().setURL(previewUrl)
            )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
    }

    disabledContainer.addActionRowComponents(disabledRow);

    return disabledContainer;
  };

  collector.on('collect', async interaction => {
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({ content: "This interaction is not for you.", ephemeral: true });
    }

    await interaction.deferUpdate();

    try {
      if (interaction.customId === 'steal_emoji') {
        // Process stickers as emojis
        for (const sticker of stickers.values()) {
          const animated = sticker.format === 'APNG' || sticker.format === 'LOTTIE';
          await addEmoji(message, sticker.url, sticker.name.replace(/\s+/g, '_'), animated);
        }
        
        // Process attachments as emojis
        for (const attachment of attachments.values()) {
          const isAnimated = attachment.name.toLowerCase().endsWith('.gif');
          await addEmoji(message, attachment.url, attachment.name.split('.')[0].replace(/\s+/g, '_'), isAnimated);
        }
        
        // Process emojis
        for (const emote of emojis) {
          await processEmoji(message, emote);
        }
      } else if (interaction.customId === 'steal_sticker') {
        // Process stickers as stickers
        for (const sticker of stickers.values()) {
          await addSticker(message, sticker.url, sticker.name);
        }
        
        // Process attachments as stickers
        for (const attachment of attachments.values()) {
          await addSticker(message, attachment.url, attachment.name.split('.')[0]);
        }
        
        // Process emojis as stickers
        for (const emote of emojis) {
          const name = emote.split(':')[1];
          const emojiId = emote.split(':')[2].replace('>', '');
          const isAnimated = emote.startsWith('<a:');
          const url = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
          await addSticker(message, url, name);
        }
      }
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: `An error occurred: ${error.message}`,
        ephemeral: true
      }).catch(console.error);
    }

    // Disable buttons after processing
    await reply.edit({ 
      components: [createDisabledContainer()], 
      flags: MessageFlags.IsComponentsV2 
    }).catch(console.error);
  });

  collector.on('end', () => {
    reply.edit({ 
      components: [createDisabledContainer()], 
      flags: MessageFlags.IsComponentsV2 
    }).catch(console.error);
  });
}