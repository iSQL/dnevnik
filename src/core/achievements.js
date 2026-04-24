import { db } from './db.js';
import { bus } from './event-bus.js';

// Static catalog of v1 achievements. Add more by appending to this array.
// Each entry: { id, name, description, tint, rarity, check(ctx) → boolean }
export const ACHIEVEMENTS = [
  {
    id: 'first-step',
    name: 'Prvi korak',
    description: 'Završi bilo koji zadatak',
    tint: 'var(--coin)',
    rarity: 'Common',
    check: ({ totalCompletions }) => totalCompletions >= 1,
  },
  {
    id: 'streak-7',
    name: 'Sedmica u nizu',
    description: '7 dana zaredom',
    tint: 'var(--fire)',
    rarity: 'Common',
    check: ({ streakDays }) => streakDays >= 7,
  },
  {
    id: 'streak-30',
    name: 'Mesec dana',
    description: '30 dana. Respekat.',
    tint: 'var(--pink)',
    rarity: 'Rare',
    check: ({ streakDays }) => streakDays >= 30,
  },
  {
    id: 'fitness-lv5',
    name: 'Mišićić',
    description: 'Kondicija nivo 5',
    tint: 'var(--fire)',
    rarity: 'Common',
    check: ({ stats }) => (stats.fitness?.level ?? 0) >= 5,
  },
  {
    id: 'intellect-lv5',
    name: 'Sitno učen',
    description: 'Intelekt nivo 5',
    tint: 'var(--violet)',
    rarity: 'Common',
    check: ({ stats }) => (stats.intellect?.level ?? 0) >= 5,
  },
  {
    id: 'discipline-lv5',
    name: 'Mali asketa',
    description: 'Disciplina nivo 5',
    tint: 'var(--coin)',
    rarity: 'Common',
    check: ({ stats }) => (stats.discipline?.level ?? 0) >= 5,
  },
  {
    id: 'centurion',
    name: 'Stoti zadatak',
    description: '100 obavljenih zadataka',
    tint: 'var(--mint)',
    rarity: 'Rare',
    check: ({ totalCompletions }) => totalCompletions >= 100,
  },
  {
    id: 'all-rounder',
    name: 'Svestrani',
    description: 'Svaka veština ≥ nivo 3',
    tint: 'var(--violet)',
    rarity: 'Epic',
    check: ({ stats }) => Object.values(stats).every((s) => (s?.level ?? 0) >= 3),
  },
  {
    id: 'mythic',
    name: '???',
    description: 'Skriveni trofej',
    tint: 'var(--ink)',
    rarity: 'Legendary',
    check: ({ stats }) =>
      Object.values(stats).reduce((sum, s) => sum + (s?.xp ?? 0), 0) >= 50000,
  },
];

async function buildContext() {
  const [statsRows, totalCompletions, completions] = await Promise.all([
    db.stats.toArray(),
    db.completions.count(),
    db.completions.toArray(),
  ]);
  const stats = Object.fromEntries(statsRows.map((s) => [s.id, s]));

  // Streak: count consecutive days (including today) that have at least one completion.
  const dayKey = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };
  const days = new Set(completions.map((c) => dayKey(c.timestamp)));
  let streakDays = 0;
  const cursor = new Date();
  while (days.has(dayKey(cursor.getTime()))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { stats, totalCompletions, streakDays };
}

export async function evaluateAchievements() {
  const ctx = await buildContext();
  const already = new Set((await db.achievements.toArray()).map((a) => a.id));
  const newlyUnlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (already.has(a.id)) continue;
    try {
      if (a.check(ctx)) {
        await db.achievements.put({ id: a.id, unlockedAt: Date.now() });
        newlyUnlocked.push(a);
      }
    } catch (e) {
      console.warn('[achievements] check failed', a.id, e);
    }
  }
  for (const a of newlyUnlocked) bus.emit('achievement-unlocked', a);
  return newlyUnlocked;
}

export function startAchievementsWatcher() {
  bus.on('xp-gained', () => { evaluateAchievements(); });
  bus.on('level-up', () => { evaluateAchievements(); });
  evaluateAchievements();
}
