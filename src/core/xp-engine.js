import { db } from './db.js';
import { levelFromXp } from './stats.js';
import { bus } from './event-bus.js';

export const xpEngine = {
  async award(stat, amount, { source = 'manual', meta = {}, questId = null } = {}) {
    if (!amount || amount <= 0) return;

    const result = await db.transaction('rw', db.stats, db.completions, async () => {
      const row = await db.stats.get(stat);
      if (!row) throw new Error(`Unknown stat: ${stat}`);

      const prevLevel = row.level;
      const xp = row.xp + amount;
      const level = levelFromXp(xp);
      await db.stats.put({ id: stat, xp, level });

      await db.completions.add({
        questId,
        stat,
        amount,
        timestamp: Date.now(),
        source,
        ...meta,
      });

      return { prevLevel, level, xp };
    });

    bus.emit('xp-gained', { stat, amount, source, questId });
    if (result.level > result.prevLevel) {
      bus.emit('level-up', { stat, level: result.level, xp: result.xp });
    }
    return result;
  },
};

if (typeof window !== 'undefined') window.xpEngine = xpEngine;
