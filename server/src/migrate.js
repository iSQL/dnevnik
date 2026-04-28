import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from './db.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', 'sql');

async function ensureMigrationsTable() {
  await sql`
    create table if not exists _migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `;
}

async function appliedSet() {
  const rows = await sql`select filename from _migrations`;
  return new Set(rows.map((r) => r.filename));
}

async function run() {
  await ensureMigrationsTable();
  const applied = await appliedSet();
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const path = join(migrationsDir, file);
    const text = await readFile(path, 'utf8');
    console.log(`applying ${file}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(text);
      await tx`insert into _migrations (filename) values (${file})`;
    });
    ran++;
  }
  console.log(ran ? `applied ${ran} migration(s)` : 'no new migrations');
  await sql.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
