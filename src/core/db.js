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

// Always-safe boot step: ensures the six stat rows exist. No quest logic.
export async function ensureCoreSeed() {
  const existing = await db.stats.count();
  if (existing === 0) {
    await db.stats.bulkAdd(STATS.map((id) => ({ id, xp: 0, level: 0 })));
  }
}

// Picks quests from a module's defaultQuests array based on the chosen preset.
function pickQuestsForModule(module, choice) {
  const all = module.defaultQuests ?? [];
  if (choice === 'empty') return [];
  const nonEpic = all.filter((q) => q.difficulty !== 'epic');
  if (choice === 'minimal') return nonEpic.slice(0, 1);
  if (choice === 'recommended') {
    const epics = all.filter((q) => q.difficulty === 'epic');
    return [...nonEpic.slice(0, 3), ...epics];
  }
  return [];
}

// Seeds default quests for the user's chosen preset. Idempotent per module:
// modules already listed in settings.seededModules are skipped, so calling this
// on a later boot (e.g. after a new module ships) only seeds the newcomers.
export async function seedQuestsForChoice(modules, choice) {
  const seeded = await db.settings.get('seededModules');
  const seededSet = new Set(seeded?.value ?? []);
  const newQuests = [];
  for (const m of modules) {
    if (seededSet.has(m.id)) continue;
    for (const q of pickQuestsForModule(m, choice)) {
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
