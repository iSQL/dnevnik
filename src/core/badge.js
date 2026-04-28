import { db } from './db.js';
import { api } from './api.js';
import { hasIdentity, getIdentity } from './identity.js';

// Computes the total of pending recommendations + pending received challenges
// and persists the count under settings.pendingCount. Reactively consumed by
// TabBar via useLiveQuery. Errors are swallowed (warn + return null) so that
// a flaky network leaves the last-known value in place rather than zeroing it.
export async function refreshBadge() {
  if (!(await hasIdentity())) {
    await db.settings.put({ key: 'pendingCount', value: 0 });
    return 0;
  }
  try {
    const [identity, recs, challenges] = await Promise.all([
      getIdentity(),
      api.inbox('pending'),
      api.listChallenges(),
    ]);
    const recCount = recs.length;
    const chCount = challenges.filter(
      (c) => c.to_id === identity.userId && c.status === 'pending',
    ).length;
    const total = recCount + chCount;
    await db.settings.put({ key: 'pendingCount', value: total });
    return total;
  } catch (e) {
    console.warn('badge refresh failed', e);
    return null;
  }
}
