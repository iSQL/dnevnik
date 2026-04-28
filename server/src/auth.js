import { sql } from './db.js';
import { isUuid } from './codes.js';

export async function bearerAuth(c, next) {
  const header = c.req.header('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!isUuid(token)) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  const [user] = await sql`
    select user_id, handle, friend_code
    from users
    where auth_secret = ${token}
  `;
  if (!user) return c.json({ error: 'unauthorized' }, 401);

  // Fire-and-forget last_seen touch — don't block the request.
  sql`update users set last_seen_at = now() where user_id = ${user.user_id}`
    .catch((err) => console.error('last_seen update failed', err));

  c.set('user', user);
  await next();
}
