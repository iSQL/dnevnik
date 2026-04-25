import { db } from './db.js';

const SCHEMA = 1;
const TABLES = ['stats', 'quests', 'completions', 'achievements', 'settings'];

export async function exportProfile() {
  const entries = await Promise.all(TABLES.map((t) => db[t].toArray()));
  const data = Object.fromEntries(TABLES.map((t, i) => [t, entries[i]]));
  return {
    app: 'dnevnik',
    schema: SCHEMA,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadProfile(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dnevnik-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importProfile(payload) {
  if (!payload || payload.app !== 'dnevnik' || !payload.data) {
    throw new Error('Nije validan Dnevnik backup.');
  }
  if (payload.schema !== SCHEMA) {
    throw new Error(`Nepoznata verzija šeme (${payload.schema}). Očekivano: ${SCHEMA}.`);
  }
  const { data } = payload;
  await db.transaction('rw', TABLES.map((t) => db[t]), async () => {
    for (const t of TABLES) await db[t].clear();
    for (const t of TABLES) {
      const rows = data[t];
      if (Array.isArray(rows) && rows.length) await db[t].bulkAdd(rows);
    }
  });
}
