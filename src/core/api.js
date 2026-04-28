import { db } from './db.js';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:13337';

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const row = await db.settings.get('identity');
    const secret = row?.value?.authSecret;
    if (!secret) throw new Error('no_identity');
    headers.Authorization = `Bearer ${secret}`;
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `http_${res.status}` }));
    throw new Error(err.error ?? `http_${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  bootstrap: ({ authSecret, handle }) =>
    request('/me', {
      method: 'POST',
      auth: false,
      body: { auth_secret: authSecret, handle },
    }),
  getMe: () => request('/me'),
  syncSummary: (payload) => request('/sync', { method: 'POST', body: payload }),
  getMySummary: () => request('/me/summary'),

  addFriend: (friendCode) =>
    request('/friends', { method: 'POST', body: { friend_code: friendCode } }),
  listFriends: () => request('/friends'),
  removeFriend: (id) => request(`/friends/${id}`, { method: 'DELETE' }),

  recommend: ({ to, quest, note }) =>
    request('/recommend', { method: 'POST', body: { to, quest, note } }),
  inbox: (status) =>
    request(`/recommend/inbox${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  sentRecommendations: () => request('/recommend/sent'),
  respondToRec: (id, accept) =>
    request(`/recommend/${id}/respond`, { method: 'POST', body: { accept } }),

  createChallenge: ({ to, stat, goal, deadline }) =>
    request('/challenge', { method: 'POST', body: { to, stat, goal, deadline } }),
  listChallenges: () => request('/challenges'),
  respondToChallenge: (id, accept) =>
    request(`/challenge/${id}/respond`, { method: 'POST', body: { accept } }),
  cancelChallenge: (id) => request(`/challenge/${id}`, { method: 'DELETE' }),
};
