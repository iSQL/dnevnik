import { db } from './db.js';
import { api } from './api.js';

const KEY = 'identity';

export async function getIdentity() {
  const row = await db.settings.get(KEY);
  return row?.value ?? null;
}

export async function hasIdentity() {
  const id = await getIdentity();
  return !!id?.authSecret;
}

// Bootstraps a new identity OR refreshes handle on the existing one.
// Server is idempotent on auth_secret — re-posting just updates the handle.
export async function bootstrapIdentity(handle) {
  const existing = await getIdentity();
  const authSecret = existing?.authSecret ?? crypto.randomUUID();
  const result = await api.bootstrap({ authSecret, handle });

  const value = {
    authSecret,
    userId: result.user_id,
    friendCode: result.friend_code,
    handle: result.handle,
  };
  await db.settings.put({ key: KEY, value });
  return value;
}

export async function clearIdentity() {
  await db.settings.delete(KEY);
}
