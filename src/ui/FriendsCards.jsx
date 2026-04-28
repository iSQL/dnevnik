import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/db.js';
import { bootstrapIdentity } from '../core/identity.js';
import { pushSync } from '../core/sync.js';
import { refreshBadge } from '../core/badge.js';
import { api } from '../core/api.js';
import { STAT_LABELS, STAT_COLORS } from '../core/stats.js';
import { moduleRegistry } from '../core/module-registry.js';
import { IcoX } from './icons.jsx';
import CreateChallengeModal from './CreateChallengeModal.jsx';

const DIFF_LABEL = { easy: 'Lako', medium: 'Srednje', hard: 'Teško', epic: 'Epsko' };

function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

export default function FriendsCards() {
  const idRow = useLiveQuery(() => db.settings.get('identity'), []);
  const identity = idRow?.value ?? null;

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendsErr, setFriendsErr] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeTarget, setChallengeTarget] = useState(null);

  async function refreshFriends() {
    if (!identity) return;
    setLoadingFriends(true);
    setFriendsErr(null);
    try {
      const list = await api.listFriends();
      setFriends(list);
    } catch (e) {
      setFriendsErr(String(e?.message ?? e));
    } finally {
      setLoadingFriends(false);
    }
  }

  async function refreshInbox() {
    if (!identity) return;
    try {
      setInbox(await api.inbox('pending'));
      refreshBadge().catch((err) => console.warn('badge refresh failed', err));
    } catch (e) {
      console.warn('inbox load failed', e);
    }
  }

  async function refreshChallenges() {
    if (!identity) return;
    try {
      setChallenges(await api.listChallenges());
      refreshBadge().catch((err) => console.warn('badge refresh failed', err));
    } catch (e) {
      console.warn('challenges load failed', e);
    }
  }

  useEffect(() => {
    if (identity?.userId) {
      refreshFriends();
      refreshInbox();
      refreshChallenges();
    }
  }, [identity?.userId]);

  return (
    <>
      {identity ? <ProfileView identity={identity} /> : <SetupView />}

      {identity && (
        <>
          <Inbox items={inbox} onChanged={refreshInbox} />
          <ChallengesList
            challenges={challenges}
            friends={friends}
            identity={identity}
            onChanged={refreshChallenges}
          />
          <AddFriend onAdded={refreshFriends} />
          <FriendsList
            friends={friends}
            loading={loadingFriends}
            error={friendsErr}
            onRefresh={refreshFriends}
            onRemoved={refreshFriends}
            onChallenge={(f) => setChallengeTarget(f)}
          />
        </>
      )}

      {challengeTarget && (
        <CreateChallengeModal
          friend={challengeTarget}
          onClose={() => setChallengeTarget(null)}
          onCreated={refreshChallenges}
        />
      )}
    </>
  );
}

function SetupView() {
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function save(e) {
    e.preventDefault();
    const trimmed = handle.trim();
    if (!trimmed) return;
    setBusy(true);
    setErr(null);
    try {
      await bootstrapIdentity(trimmed);
      pushSync().catch((e) => console.warn('post-setup sync failed', e));
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: '0 20px 14px' }}>
      <h2 className="title" style={{ fontSize: 17, marginBottom: 6 }}>Postavi profil</h2>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.5, marginBottom: 12 }}>
        Da bi razmenjivao zadatke i izazove sa prijateljima, treba ti nadimak.
        Sve ostaje na uređaju — samo kratki rezime nedelje ide na server.
      </p>
      <form onSubmit={save}>
        <div className="tile" style={{ padding: '14px 14px 12px', background: '#fff' }}>
          <label className="eyebrow" style={{ fontSize: 10, display: 'block' }}>Nadimak</label>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="npr. Mare"
            maxLength={32}
            style={textInputStyle}
          />
        </div>
        <button
          type="submit"
          className="chunk-btn"
          disabled={busy || !handle.trim()}
          style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 12, opacity: handle.trim() && !busy ? 1 : 0.5 }}
        >
          {busy ? 'Postavljam...' : 'Sačuvaj'}
        </button>
        {err && <ErrorRow text={err} />}
      </form>
    </div>
  );
}

function ProfileView({ identity }) {
  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState(identity.handle);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const lastSyncRow = useLiveQuery(() => db.settings.get('lastSyncedAt'), []);
  const lastSyncedAt = lastSyncRow?.value ?? null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(identity.friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function save(e) {
    e.preventDefault();
    const trimmed = handle.trim();
    if (!trimmed || trimmed === identity.handle) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await bootstrapIdentity(trimmed);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    setSyncing(true);
    try {
      await pushSync();
    } catch (e) {
      alert(friendlyError(e));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div style={{ padding: '0 20px 14px' }}>
      <div className="tile" style={{ padding: '16px 16px 14px', background: '#fff' }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Tvoj profil</div>
        {editing ? (
          <form onSubmit={save}>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              maxLength={32}
              autoFocus
              style={{ ...textInputStyle, fontSize: 22, marginTop: 0 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="submit" className="chunk-btn" disabled={busy} style={{ padding: '8px 14px', fontSize: 13, flex: 1 }}>
                {busy ? '...' : 'Sačuvaj'}
              </button>
              <button type="button" onClick={() => { setEditing(false); setHandle(identity.handle); }} style={smallBtn}>
                Otkaži
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{identity.handle}</div>
            <button onClick={() => setEditing(true)} style={smallBtn}>Promeni</button>
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1.5px dashed rgba(31,26,20,0.12)' }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Kod za prijatelje</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1.5 }}>
              {identity.friendCode}
            </span>
            <button onClick={copy} style={smallBtn}>{copied ? 'Kopirano!' : 'Kopiraj'}</button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 8 }}>
            Pošalji ovaj kod prijatelju da bi te dodao.
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1.5px dashed rgba(31,26,20,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 2 }}>Sinhronizacija</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700 }}>
              Poslednje: {lastSyncedAt ? relativeTime(lastSyncedAt) : 'još ne'}
            </div>
          </div>
          <button onClick={syncNow} disabled={syncing} style={{ ...smallBtn, padding: '7px 11px', fontSize: 11.5 }}>
            {syncing ? '...' : 'Sinhronizuj'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddFriend({ onAdded }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  async function add(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const target = await api.addFriend(trimmed);
      setOk(`Dodat: ${target.handle}`);
      setCode('');
      onAdded?.();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: '0 20px 14px' }}>
      <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Dodaj prijatelja</h2>
      <form onSubmit={add}>
        <div className="tile" style={{ padding: '14px 14px 12px', background: '#fff' }}>
          <label className="eyebrow" style={{ fontSize: 10, display: 'block' }}>Kod prijatelja</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="npr. K7Q2-X9PW"
            maxLength={9}
            style={{ ...textInputStyle, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'JetBrains Mono, monospace' }}
          />
        </div>
        <button
          type="submit"
          className="chunk-btn"
          disabled={busy || !code.trim()}
          style={{ width: '100%', padding: 12, fontSize: 14, marginTop: 10, opacity: code.trim() && !busy ? 1 : 0.5 }}
        >
          {busy ? 'Dodajem...' : 'Dodaj'}
        </button>
        {ok && (
          <div style={{ color: 'var(--leaf)', marginTop: 8, fontSize: 12, fontWeight: 800 }}>
            {ok}
          </div>
        )}
        {err && <ErrorRow text={err} />}
      </form>
    </div>
  );
}

function FriendsList({ friends, loading, error, onRefresh, onRemoved, onChallenge }) {
  return (
    <div style={{ padding: '0 20px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <h2 className="title" style={{ fontSize: 17 }}>Tvoji prijatelji</h2>
        <button onClick={onRefresh} disabled={loading} style={{ ...smallBtn, padding: '5px 9px', fontSize: 11 }}>
          {loading ? '...' : 'Osveži'}
        </button>
      </div>

      {error && <ErrorRow text={error} />}

      {!loading && friends.length === 0 && !error && (
        <div className="tile" style={{ padding: '14px 16px', background: 'var(--cream)', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
          Još nemaš prijatelje. Pošalji svoj kod ili unesi tuđi iznad.
        </div>
      )}

      {friends.map((f) => (
        <FriendCard key={f.user_id} friend={f} onRemoved={onRemoved} onChallenge={onChallenge} />
      ))}
    </div>
  );
}

function FriendCard({ friend, onRemoved, onChallenge }) {
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Ukloniti ${friend.handle}?`)) return;
    setBusy(true);
    try {
      await api.removeFriend(friend.user_id);
      onRemoved?.();
    } catch (e) {
      alert(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  const summary = friend.summary;
  const top = summary ? topWeekStat(summary) : null;
  const seen = relativeTime(friend.last_seen_at);
  const synced = summary?.builtAt ? relativeTime(summary.builtAt) : null;

  return (
    <div className="tile" style={{ padding: '14px 14px 12px', background: '#fff', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{friend.handle}</div>
          <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: 1, marginTop: 1 }}>
            {friend.friend_code}
          </div>
        </div>
        <button onClick={remove} disabled={busy} style={{ ...smallBtn, padding: 6, opacity: busy ? 0.5 : 1 }} aria-label="Ukloni">
          <IcoX size={14} />
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => onChallenge?.(friend)} style={{ ...smallBtn, padding: '6px 12px', fontSize: 11.5, background: 'var(--violet)', color: '#fff', borderColor: 'var(--line)' }}>
          Izazovi
        </button>
      </div>

      {summary ? (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px dashed rgba(31,26,20,0.12)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontWeight: 800, fontSize: 13 }}>
              Lv {summary.maxLevel}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700 }}>
              · {summary.totalXp.toLocaleString('sr-Latn-RS')} XP ukupno
            </span>
          </div>
          {top && top.weekXp > 0 && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 100, background: STAT_COLORS[top.stat], border: '1.5px solid var(--line)' }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                Lider ove nedelje: {STAT_LABELS[top.stat]} <span className="mono" style={{ fontWeight: 800 }}>+{top.weekXp}</span>
              </span>
            </div>
          )}
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700, marginTop: 6 }}>
            Ažurirano {synced} {seen && `· aktivan ${seen}`}
          </div>

          {Array.isArray(summary.recentCompletions) && summary.recentCompletions.length > 0 && (
            <RecentFeed items={summary.recentCompletions} />
          )}
        </div>
      ) : (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px dashed rgba(31,26,20,0.12)', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700 }}>
          Još nije sinhronizovao podatke.
        </div>
      )}
    </div>
  );
}

function RecentFeed({ items }) {
  const [open, setOpen] = useState(false);
  const visible = open ? items : items.slice(0, 3);
  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px dashed rgba(31,26,20,0.12)' }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Poslednje aktivnosti</div>
      {visible.map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <span style={{ width: 6, height: 6, borderRadius: 100, background: STAT_COLORS[c.stat] ?? 'var(--ink-3)', border: '1.5px solid var(--line)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.name}
          </span>
          <span className="mono" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-3)' }}>
            +{c.amount}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0 }}>
            {relativeTime(c.timestamp)}
          </span>
        </div>
      ))}
      {items.length > 3 && (
        <button
          onClick={() => setOpen(!open)}
          style={{ marginTop: 6, background: 'none', border: 'none', color: 'var(--violet)', fontWeight: 800, fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
        >
          {open ? 'Sakri' : `Prikaži još ${items.length - 3}`}
        </button>
      )}
    </div>
  );
}

function ChallengesList({ challenges, friends, identity, onChanged }) {
  const completions = useLiveQuery(() => db.completions.toArray(), []) ?? [];
  if (!challenges || challenges.length === 0) return null;

  const sow = startOfWeek();
  const sorted = [...challenges].sort((a, b) => order(a, identity) - order(b, identity));

  return (
    <div style={{ padding: '0 20px 14px' }}>
      <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>
        Izazovi <span className="mono" style={{ fontSize: 13, color: 'var(--violet)' }}>({challenges.length})</span>
      </h2>
      {sorted.map((c) => (
        <ChallengeCard
          key={c.id}
          challenge={c}
          identity={identity}
          friends={friends}
          completions={completions}
          sow={sow}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

function order(c, identity) {
  const isMine = c.from_id === identity.userId;
  if (c.status === 'pending' && !isMine) return 0;
  if (c.status === 'accepted')           return 1;
  if (c.status === 'pending' && isMine)  return 2;
  return 3;
}

function ChallengeCard({ challenge: c, identity, friends, completions, sow, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const isMine = c.from_id === identity.userId;
  const opponentId = isMine ? c.to_id : c.from_id;
  const opponentHandle = isMine ? c.to_handle : c.from_handle;
  const opponent = friends.find((f) => f.user_id === opponentId);

  const myWeekXp = completions
    .filter((co) => co.stat === c.stat && co.timestamp >= sow)
    .reduce((sum, co) => sum + co.amount, 0);
  const oppWeekXp = opponent?.summary?.perStat?.[c.stat]?.weekXp ?? 0;

  const deadlineMs = new Date(c.deadline).getTime();
  const expired = deadlineMs < Date.now();
  const daysLeft = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 86_400_000));

  const tint = STAT_COLORS[c.stat] ?? 'var(--violet)';

  async function respond(accept) {
    setBusy(true);
    setErr(null);
    try {
      await api.respondToChallenge(c.id, accept);
      onChanged?.();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!confirm('Otkazati izazov?')) return;
    setBusy(true);
    setErr(null);
    try {
      await api.cancelChallenge(c.id);
      onChanged?.();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function removeResolved() {
    if (!confirm('Ukloniti ovaj izazov?')) return;
    setBusy(true);
    setErr(null);
    try {
      await api.cancelChallenge(c.id);
      onChanged?.();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  const isResolved = c.status === 'declined' || expired;

  return (
    <div className="tile" style={{ padding: '14px 14px 12px', background: '#fff', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: tint, border: '2px solid var(--line)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>
            {STAT_LABELS[c.stat]} · cilj <span className="mono">{c.goal}</span> XP
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', marginTop: 1 }}>
            {isMine ? `Ti vs ${opponentHandle}` : `${opponentHandle} te izazvao`}
            {' · '}
            {expired ? 'isteklo' : `${daysLeft} ${daysLeft === 1 ? 'dan' : 'dana'} ostalo`}
          </div>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {(c.status === 'accepted' || (c.status === 'pending' && isMine)) && (
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <ProgressRow label={isMine ? 'Ti' : identity.handle} value={myWeekXp} goal={c.goal} tint={tint} />
          <ProgressRow label={opponentHandle} value={oppWeekXp} goal={c.goal} tint={tint} muted />
        </div>
      )}

      {c.status === 'pending' && !isMine && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => respond(false)} disabled={busy} style={{ ...smallBtn, flex: 1, padding: '10px 12px', fontSize: 13 }}>
            Odbaci
          </button>
          <button onClick={() => respond(true)} disabled={busy} className="chunk-btn" style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}>
            {busy ? '...' : 'Prihvati'}
          </button>
        </div>
      )}

      {c.status === 'pending' && isMine && (
        <div style={{ marginTop: 10 }}>
          <button onClick={cancel} disabled={busy} style={{ ...smallBtn, padding: '7px 11px', fontSize: 11.5 }}>
            Otkaži
          </button>
        </div>
      )}

      {isResolved && c.status !== 'pending' && (
        <div style={{ marginTop: 10 }}>
          <button onClick={removeResolved} disabled={busy} style={{ ...smallBtn, padding: '7px 11px', fontSize: 11.5 }}>
            Ukloni
          </button>
        </div>
      )}

      {err && <ErrorRow text={err} />}
    </div>
  );
}

function ProgressRow({ label, value, goal, tint, muted }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 3 }}>
        <span style={{ opacity: muted ? 0.85 : 1 }}>{label}</span>
        <span className="mono">{value} / {goal}</span>
      </div>
      <div style={{ height: 8, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: tint, opacity: muted ? 0.7 : 1 }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    pending:   { label: 'na čekanju', bg: 'var(--coin-soft)', color: 'var(--ink)' },
    accepted:  { label: 'aktivno',    bg: 'var(--violet)',    color: '#fff' },
    declined:  { label: 'odbijeno',   bg: '#eee',             color: 'var(--ink-3)' },
    completed: { label: 'završeno',   bg: 'var(--leaf)',      color: '#fff' },
    expired:   { label: 'isteklo',    bg: '#eee',             color: 'var(--ink-3)' },
  }[status] ?? { label: status, bg: '#eee', color: 'var(--ink)' };

  return (
    <span className="mono" style={{
      fontSize: 9.5, fontWeight: 900, letterSpacing: 0.5,
      padding: '3px 8px', borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      border: '1.5px solid var(--line)',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {cfg.label.toUpperCase()}
    </span>
  );
}

function Inbox({ items, onChanged }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ padding: '0 20px 14px' }}>
      <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>
        Predlozi za tebe <span className="mono" style={{ fontSize: 13, color: 'var(--violet)' }}>({items.length})</span>
      </h2>
      {items.map((item) => (
        <InboxItem key={item.id} item={item} onChanged={onChanged} />
      ))}
    </div>
  );
}

function InboxItem({ item, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const m = moduleRegistry.get(item.quest?.moduleId);

  async function accept() {
    setBusy(true);
    setErr(null);
    try {
      await db.quests.add({
        moduleId: item.quest.moduleId,
        name: item.quest.name,
        difficulty: item.quest.difficulty ?? 'medium',
        schedule: item.quest.schedule ?? 'daily',
        active: 1,
        createdAt: Date.now(),
        source: 'recommendation',
        fromHandle: item.from_handle,
      });
      await api.respondToRec(item.id, true);
      onChanged?.();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    setBusy(true);
    setErr(null);
    try {
      await api.respondToRec(item.id, false);
      onChanged?.();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tile" style={{ padding: '12px 14px', background: '#fff', marginBottom: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{item.quest?.name}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', marginTop: 2 }}>
        od <span style={{ color: 'var(--ink)' }}>{item.from_handle}</span>
        {m && ` · ${m.name}`}
        {item.quest?.difficulty && ` · ${DIFF_LABEL[item.quest.difficulty] ?? item.quest.difficulty}`}
      </div>
      {item.note && (
        <div style={{ fontSize: 12.5, fontStyle: 'italic', marginTop: 8, color: 'var(--ink-3)', borderLeft: '3px solid var(--violet)', paddingLeft: 10 }}>
          „{item.note}"
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={decline} disabled={busy} style={{ ...smallBtn, flex: 1, padding: '10px 12px', fontSize: 13 }}>
          Odbaci
        </button>
        <button onClick={accept} disabled={busy} className="chunk-btn" style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}>
          {busy ? '...' : 'Prihvati'}
        </button>
      </div>
      {err && <ErrorRow text={err} />}
    </div>
  );
}

function ErrorRow({ text }) {
  return (
    <div style={{ color: 'var(--fire)', marginTop: 10, fontSize: 12, fontWeight: 800 }}>
      Greška: {text}
    </div>
  );
}

function topWeekStat(summary) {
  let best = null;
  for (const [stat, v] of Object.entries(summary.perStat ?? {})) {
    if (!best || v.weekXp > best.weekXp) best = { stat, weekXp: v.weekXp };
  }
  return best;
}

function relativeTime(ts) {
  if (!ts) return null;
  const ms = Date.now() - new Date(ts).getTime();
  if (ms < 60_000) return 'upravo';
  if (ms < 3_600_000) return `pre ${Math.floor(ms / 60_000)} min`;
  if (ms < 86_400_000) return `pre ${Math.floor(ms / 3_600_000)} h`;
  return `pre ${Math.floor(ms / 86_400_000)} dana`;
}

const ERR_MSG = {
  not_found: 'Kod ne postoji',
  cannot_add_self: 'Ne možeš dodati sebe',
  invalid_friend_code: 'Pogrešan format koda',
  no_identity: 'Postavi profil prvo',
  unauthorized: 'Sesija je istekla',
  not_friends: 'Niste prijatelji',
};

function friendlyError(e) {
  const msg = String(e?.message ?? e);
  return ERR_MSG[msg] ?? msg;
}

const textInputStyle = {
  width: '100%', fontSize: 18, fontWeight: 800, marginTop: 6,
  padding: '0 0 10px', border: 'none', outline: 'none',
  borderBottom: '2px dashed rgba(31,26,20,0.15)',
  background: 'transparent', fontFamily: 'inherit', color: 'var(--ink)',
};

const smallBtn = {
  padding: '7px 11px',
  border: '2px solid var(--line)',
  borderRadius: 10,
  background: '#fff',
  fontWeight: 800,
  fontSize: 12,
  fontFamily: 'inherit',
  color: 'var(--ink)',
  boxShadow: '2px 2px 0 var(--line)',
  cursor: 'pointer',
};
