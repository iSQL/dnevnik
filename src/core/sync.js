import { db } from './db.js';
import { STATS } from './stats.js';
import { api } from './api.js';
import { hasIdentity } from './identity.js';

// Monday 00:00 of the current week (local time).
function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // Mon = 0 ... Sun = 6
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

export async function buildSummary() {
  const since = startOfWeek();
  const [statsRows, weekCompletions, achievements, quests] = await Promise.all([
    db.stats.toArray(),
    db.completions.where('timestamp').above(since).toArray(),
    db.achievements.toArray(),
    db.quests.toArray(),
  ]);

  const perStat = {};
  for (const s of STATS) perStat[s] = { xp: 0, level: 0, weekXp: 0 };
  for (const r of statsRows) {
    if (perStat[r.id]) {
      perStat[r.id].xp = r.xp;
      perStat[r.id].level = r.level;
    }
  }
  for (const c of weekCompletions) {
    if (perStat[c.stat]) perStat[c.stat].weekXp += c.amount;
  }

  const totalXp = statsRows.reduce((s, r) => s + r.xp, 0);
  const maxLevel = Math.max(0, ...statsRows.map((r) => r.level));

  const recentAchievements = achievements
    .slice()
    .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
    .slice(0, 5)
    .map((a) => a.id);

  // Last 10 completions of the current week, newest first, with quest name + module.
  const questById = new Map(quests.map((q) => [q.id, q]));
  const recentCompletions = weekCompletions
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
    .map((c) => {
      const q = questById.get(c.questId);
      return {
        name: q?.name ?? 'Zadatak',
        moduleId: q?.moduleId ?? null,
        stat: c.stat,
        amount: c.amount,
        timestamp: c.timestamp,
      };
    });

  return {
    totalXp,
    maxLevel,
    perStat,
    recentAchievements,
    recentCompletions,
    weekStartedAt: since,
    builtAt: Date.now(),
  };
}

export async function pushSync() {
  if (!(await hasIdentity())) return null;
  const payload = await buildSummary();
  await api.syncSummary(payload);
  await db.settings.put({ key: 'lastSyncedAt', value: Date.now() });
  return payload;
}

let intervalId = null;
let visibilityHooked = false;

export function startSync({ intervalMs = 60 * 60 * 1000 } = {}) {
  if (intervalId) return;

  pushSync().catch((err) => console.warn('initial sync failed', err));

  intervalId = setInterval(() => {
    pushSync().catch((err) => console.warn('periodic sync failed', err));
  }, intervalMs);

  if (!visibilityHooked) {
    visibilityHooked = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        pushSync().catch((err) => console.warn('visibility sync failed', err));
      }
    });
  }
}

export function stopSync() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}
