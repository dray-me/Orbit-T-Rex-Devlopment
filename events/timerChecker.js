const Timer = require('../data/Timer');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  MessageFlags
} = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,

  execute(client) {
    setInterval(async () => {
      try {
        const now = Date.now();
        const timers = await Timer.find({ paused: false, endTime: { $lte: now } });

        for (const timer of timers) {
          try {
            const channel = await client.channels.fetch(timer.channelId).catch(() => null);
            if (!channel) {
              logger.warn(`Channel ${timer.channelId} not found, removing timer`);
              await Timer.deleteOne({ _id: timer._id });
              continue;
            }

            const msg = await channel.messages.fetch(timer.messageId).catch(() => null);
            if (!msg) {
              logger.warn(`Message ${timer.messageId} not found, removing timer`);
              await Timer.deleteOne({ _id: timer._id });
              continue;
            }

            // ✅ Build Components V2 container
            const container = new ContainerBuilder()
              .addComponents(
                new SectionBuilder().setContent(
                  new TextDisplayBuilder()
                    .setStyle('Success')
                    .setLabel('✅ Timer Complete')
                )
              )
              .addSeparatorComponents(new SeparatorBuilder())
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# Timer ended at <t:${Math.floor(now / 1000)}:R>`)
              );

            await msg.edit({
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });

            await Timer.deleteOne({ _id: timer._id });
            logger.success(`Timer completed for message ${timer.messageId}`);
          } catch (timerError) {
            logger.error(`Timer cleanup error for timer ${timer._id}: ${timerError.message}`);
            await Timer.deleteOne({ _id: timer._id });
          }
        }
      } catch (mainError) {
        logger.error(`Main timer interval error: ${mainError.message}`);
      }
    }, 5000);

    logger.info('⏱️ Timer cleanup service started');
  }
};