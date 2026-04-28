import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { sql } from './db.js';
import { bearerAuth } from './auth.js';
import { generateFriendCode, isUuid } from './codes.js';

const app = new Hono();

const allowed = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: allowed.length ? allowed : '*',
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  }),
);

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', async (c) => {
  const [{ now }] = await sql`select now()`;
  return c.json({ ok: true, now });
});

// ── Identity bootstrap ──────────────────────────────────────────────────────
// Client generates its own auth_secret (uuid v4) on first launch and sends it
// here with a chosen handle. Server assigns user_id + friend_code and returns
// them. Idempotent on auth_secret — re-posting just refreshes the handle.
app.post('/me', async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'bad_json' }, 400);
  }

  const auth_secret = body?.auth_secret;
  const handle = typeof body?.handle === 'string' ? body.handle.trim() : '';

  if (!isUuid(auth_secret)) return c.json({ error: 'invalid_auth_secret' }, 400);
  if (!handle || handle.length > 32) return c.json({ error: 'invalid_handle' }, 400);

  const userId = randomUUID();
  const friendCode = generateFriendCode();

  const [row] = await sql`
    insert into users (user_id, auth_secret, friend_code, handle)
    values (${userId}, ${auth_secret}, ${friendCode}, ${handle})
    on conflict (auth_secret) do update
      set handle = excluded.handle,
          last_seen_at = now()
    returning user_id, friend_code, handle
  `;

  return c.json(row);
});

app.get('/me', bearerAuth, (c) => c.json(c.get('user')));

// ── Sync ────────────────────────────────────────────────────────────────────
// Client pushes a precomputed weekly summary blob. We don't validate the shape
// here — the client owns it and friends just render whatever's in `payload`.
app.post('/sync', bearerAuth, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'bad_json' }, 400);
  }
  if (!body || typeof body !== 'object') {
    return c.json({ error: 'invalid_payload' }, 400);
  }

  const { user_id } = c.get('user');
  await sql`
    insert into summaries (user_id, payload)
    values (${user_id}, ${sql.json(body)})
    on conflict (user_id) do update
      set payload = excluded.payload,
          updated_at = now()
  `;
  return c.json({ ok: true });
});

app.get('/me/summary', bearerAuth, async (c) => {
  const { user_id } = c.get('user');
  const [row] = await sql`
    select payload, updated_at from summaries where user_id = ${user_id}
  `;
  return c.json(row ?? null);
});

// ── Friends ─────────────────────────────────────────────────────────────────
// Add by friend_code. Symmetric: both directions inserted in one tx.
app.post('/friends', bearerAuth, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'bad_json' }, 400);
  }

  const raw = typeof body?.friend_code === 'string' ? body.friend_code.trim().toUpperCase() : '';
  if (!raw) return c.json({ error: 'invalid_friend_code' }, 400);

  const me = c.get('user');
  if (raw === me.friend_code) return c.json({ error: 'cannot_add_self' }, 400);

  const [target] = await sql`
    select user_id, handle, friend_code
    from users
    where friend_code = ${raw}
  `;
  if (!target) return c.json({ error: 'not_found' }, 404);

  await sql.begin(async (tx) => {
    await tx`
      insert into friends (user_id, friend_id) values (${me.user_id}, ${target.user_id})
      on conflict do nothing
    `;
    await tx`
      insert into friends (user_id, friend_id) values (${target.user_id}, ${me.user_id})
      on conflict do nothing
    `;
  });

  return c.json(target);
});

// List friends with their latest summary joined in (avoid N+1 from the client).
app.get('/friends', bearerAuth, async (c) => {
  const { user_id } = c.get('user');
  const rows = await sql`
    select u.user_id, u.handle, u.friend_code, u.last_seen_at,
           s.payload    as summary,
           s.updated_at as summary_updated_at
    from friends f
    join users u on u.user_id = f.friend_id
    left join summaries s on s.user_id = u.user_id
    where f.user_id = ${user_id}
    order by f.created_at desc
  `;
  return c.json(rows);
});

// Unfriend — removes both edges.
app.delete('/friends/:id', bearerAuth, async (c) => {
  const friendId = c.req.param('id');
  if (!isUuid(friendId)) return c.json({ error: 'invalid_id' }, 400);

  const me = c.get('user');
  await sql.begin(async (tx) => {
    await tx`delete from friends where user_id = ${me.user_id} and friend_id = ${friendId}`;
    await tx`delete from friends where user_id = ${friendId} and friend_id = ${me.user_id}`;
  });
  return c.json({ ok: true });
});

async function isFriendOf(a, b) {
  const [row] = await sql`
    select 1 from friends where user_id = ${a} and friend_id = ${b} limit 1
  `;
  return !!row;
}

// ── Recommendations ─────────────────────────────────────────────────────────
// Send a quest definition to a friend's inbox. Recipient accepts/declines on
// their device; on accept, their client inserts a new local quest row.
app.post('/recommend', bearerAuth, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'bad_json' }, 400);
  }

  const me = c.get('user');
  const toId = body?.to;
  const quest = body?.quest;
  const note = typeof body?.note === 'string' ? body.note.slice(0, 280) : null;

  if (!isUuid(toId)) return c.json({ error: 'invalid_to' }, 400);
  if (toId === me.user_id) return c.json({ error: 'cannot_recommend_to_self' }, 400);
  if (!quest || typeof quest !== 'object' || typeof quest.name !== 'string' || !quest.name.trim()) {
    return c.json({ error: 'invalid_quest' }, 400);
  }
  if (!(await isFriendOf(me.user_id, toId))) {
    return c.json({ error: 'not_friends' }, 403);
  }

  const id = randomUUID();
  const [row] = await sql`
    insert into recommendations (id, from_id, to_id, quest, note)
    values (${id}, ${me.user_id}, ${toId}, ${sql.json(quest)}, ${note})
    returning id, from_id, to_id, quest, note, status, created_at
  `;
  return c.json(row);
});

// Recommendations in my inbox (default: pending only).
app.get('/recommend/inbox', bearerAuth, async (c) => {
  const { user_id } = c.get('user');
  const status = c.req.query('status') ?? 'pending';
  const rows = await sql`
    select r.id, r.quest, r.note, r.status, r.created_at, r.responded_at,
           u.user_id as from_id, u.handle as from_handle, u.friend_code as from_code
    from recommendations r
    join users u on u.user_id = r.from_id
    where r.to_id = ${user_id} and r.status = ${status}
    order by r.created_at desc
  `;
  return c.json(rows);
});

// Recommendations I've sent (history).
app.get('/recommend/sent', bearerAuth, async (c) => {
  const { user_id } = c.get('user');
  const rows = await sql`
    select r.id, r.quest, r.note, r.status, r.created_at, r.responded_at,
           u.user_id as to_id, u.handle as to_handle, u.friend_code as to_code
    from recommendations r
    join users u on u.user_id = r.to_id
    where r.from_id = ${user_id}
    order by r.created_at desc
  `;
  return c.json(rows);
});

// Accept or decline. Only the recipient can respond, and only while pending.
app.post('/recommend/:id/respond', bearerAuth, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'bad_json' }, 400);
  }

  const accept = body?.accept;
  if (typeof accept !== 'boolean') return c.json({ error: 'invalid_response' }, 400);

  const recId = c.req.param('id');
  if (!isUuid(recId)) return c.json({ error: 'invalid_id' }, 400);

  const { user_id } = c.get('user');
  const status = accept ? 'accepted' : 'declined';

  const [row] = await sql`
    update recommendations
    set status = ${status}, responded_at = now()
    where id = ${recId} and to_id = ${user_id} and status = 'pending'
    returning id, status, responded_at
  `;
  if (!row) return c.json({ error: 'not_found_or_already_responded' }, 404);
  return c.json(row);
});

// ── Challenges ──────────────────────────────────────────────────────────────
// Server stores the goal + deadline; progress is read from each side's
// pushed summary. No server-side arbitration of who won.
const VALID_STATS = new Set([
  'fitness', 'intellect', 'discipline', 'creativity', 'social', 'wellbeing',
]);

app.post('/challenge', bearerAuth, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'bad_json' }, 400);
  }

  const me = c.get('user');
  const toId = body?.to;
  const stat = body?.stat;
  const goal = Number(body?.goal);
  const deadlineRaw = body?.deadline;

  if (!isUuid(toId)) return c.json({ error: 'invalid_to' }, 400);
  if (toId === me.user_id) return c.json({ error: 'cannot_challenge_self' }, 400);
  if (!VALID_STATS.has(stat)) return c.json({ error: 'invalid_stat' }, 400);
  if (!Number.isInteger(goal) || goal <= 0) return c.json({ error: 'invalid_goal' }, 400);

  const deadline = new Date(deadlineRaw);
  if (isNaN(deadline.getTime()) || deadline <= new Date()) {
    return c.json({ error: 'invalid_deadline' }, 400);
  }
  if (!(await isFriendOf(me.user_id, toId))) {
    return c.json({ error: 'not_friends' }, 403);
  }

  const id = randomUUID();
  const [row] = await sql`
    insert into challenges (id, from_id, to_id, stat, goal, deadline)
    values (${id}, ${me.user_id}, ${toId}, ${stat}, ${goal}, ${deadline})
    returning id, from_id, to_id, stat, goal, deadline, status, created_at
  `;
  return c.json(row);
});

// All challenges I'm in, on either side, with both handles for rendering.
app.get('/challenges', bearerAuth, async (c) => {
  const { user_id } = c.get('user');
  const rows = await sql`
    select c.id, c.from_id, c.to_id, c.stat, c.goal, c.deadline, c.status, c.created_at,
           uf.handle as from_handle, uf.friend_code as from_code,
           ut.handle as to_handle,   ut.friend_code as to_code
    from challenges c
    join users uf on uf.user_id = c.from_id
    join users ut on ut.user_id = c.to_id
    where c.from_id = ${user_id} or c.to_id = ${user_id}
    order by c.deadline asc
  `;
  return c.json(rows);
});

// Recipient accepts or declines a pending challenge.
app.post('/challenge/:id/respond', bearerAuth, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'bad_json' }, 400);
  }

  const accept = body?.accept;
  if (typeof accept !== 'boolean') return c.json({ error: 'invalid_response' }, 400);

  const challengeId = c.req.param('id');
  if (!isUuid(challengeId)) return c.json({ error: 'invalid_id' }, 400);

  const { user_id } = c.get('user');
  const status = accept ? 'accepted' : 'declined';

  const [row] = await sql`
    update challenges
    set status = ${status}
    where id = ${challengeId} and to_id = ${user_id} and status = 'pending'
    returning id, status
  `;
  if (!row) return c.json({ error: 'not_found_or_already_responded' }, 404);
  return c.json(row);
});

// Sender withdraws a pending challenge.
app.delete('/challenge/:id', bearerAuth, async (c) => {
  const challengeId = c.req.param('id');
  if (!isUuid(challengeId)) return c.json({ error: 'invalid_id' }, 400);

  const { user_id } = c.get('user');
  const result = await sql`
    delete from challenges
    where id = ${challengeId} and from_id = ${user_id} and status = 'pending'
  `;
  if (result.count === 0) return c.json({ error: 'not_found_or_not_cancellable' }, 404);
  return c.json({ ok: true });
});

// ── Errors / 404 ────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'not_found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal_error' }, 500);
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`dnevnik-server listening on http://localhost:${port}`);
});
