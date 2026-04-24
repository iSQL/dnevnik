import Dexie from 'dexie';
import { STATS } from './stats.js';

export const db = new Dexie('dnevnik');

db.version(1).stores({
  stats:        '&id, xp, level',
  quests:       '++id, moduleId, schedule, active, createdAt',
  completions:  '++id, questId, stat, amount, timestamp',
  achievements: '&id, unlockedAt',
  settings:     '&key',
});

export async function ensureSeeded(modules) {
  const existing = await db.stats.count();
  if (existing === 0) {
    await db.stats.bulkAdd(STATS.map((id) => ({ id, xp: 0, level: 0 })));
  }

  const seeded = await db.settings.get('seededModules');
  const seededSet = new Set(seeded?.value ?? []);
  const newQuests = [];
  for (const m of modules) {
    if (seededSet.has(m.id)) continue;
    for (const q of (m.defaultQuests ?? [])) {
      newQuests.push({
        moduleId: m.id,
        name: q.name,
        difficulty: q.difficulty ?? 'medium',
        schedule: q.schedule ?? 'daily',
        active: 1,
        createdAt: Date.now(),
      });
    }
    seededSet.add(m.id);
  }
  if (newQuests.length) await db.quests.bulkAdd(newQuests);
  await db.settings.put({ key: 'seededModules', value: [...seededSet] });
}
