const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require('discord.js');
const ms = require('ms');
const Reminder = require('../../data/Reminder.js'); // MongoDB model

module.exports = {
  name: 'reminder',
  description: 'Set a reminder and get pinged when time ends',

  async execute(message, args) {
    const timeArg = args[0];
    const reminderText = args.slice(1).join(' ');

    // ❌ Missing Time
    if (!timeArg || !ms(timeArg)) {
      const timeError = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Missing Time**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Please provide a time (e.g. `10s`, `30m`, `3d`).'));

      return message.channel.send({
        components: [timeError],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // ❌ Missing Reminder Text
    if (!reminderText) {
      const textError = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Missing Reminder Text**'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Please provide what you want to be reminded about.'));

      return message.channel.send({
        components: [textError],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const durationMs = ms(timeArg);
    const remindAt = Date.now() + durationMs;
    const timestamp = `<t:${Math.floor(remindAt / 1000)}:R>`;

    // ✅ Save to MongoDB
    await Reminder.create({
      userId: message.author.id,
      channelId: message.channel.id,
      reminderText,
      remindAt: new Date(remindAt)
    });

    // ✅ Success Confirmation
    const successContainer = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('# Reminder Set Successfully'))
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('-# You will be pinged with your reminder message according to time'))
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`✅ | I will remind you ${timestamp}\n**Reminder:** ${reminderText}`)
      );

    await message.channel.send({
      components: [successContainer],
      flags: MessageFlags.IsComponentsV2
    });

    // ⏰ Schedule Reminder
    setTimeout(async () => {
      await message.channel.send({
        content: `<@${message.author.id}> here is your reminder: **${reminderText}**`
      });

      await Reminder.deleteOne({
        userId: message.author.id,
        channelId: message.channel.id,
        reminderText,
        remindAt: new Date(remindAt)
      });
    }, durationMs);
  }
};