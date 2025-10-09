const NoPrefix = require("../data/Noprefix");

module.exports = {
  name: "ready",
  async execute(client) {
    setInterval(async () => {
      const now = Date.now();
      const all = await NoPrefix.find({});

      for (const entry of all) {
        if (!entry.expiresAt) continue;

        const remaining = entry.expiresAt.getTime() - now;

        if (remaining <= 86400000 && !entry.warned) {
          const user = await client.users.fetch(entry.userId).catch(() => null);
          if (user) {
            try {
              await user.send("⚠️ Your NoPrefix access will expire in **1 day**.");
            } catch {}
          }
          entry.warned = true;
          await entry.save();
        }

        if (remaining <= 0) {
          await NoPrefix.deleteOne({ userId: entry.userId });
        }
      }
    }, 60000); // Every 1 minute
  }
};