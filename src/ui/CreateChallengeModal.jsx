import { useState } from 'react';
import { STATS, STAT_LABELS, STAT_COLORS } from '../core/stats.js';
import { api } from '../core/api.js';
import { IcoX } from './icons.jsx';

const QUICK_GOALS = [50, 100, 200, 500];

const ERR_MSG = {
  no_identity: 'Postavi profil prvo',
  not_friends: 'Niste više prijatelji',
  cannot_challenge_self: 'Ne možeš izazvati sebe',
  invalid_stat: 'Pogrešna grana',
  invalid_goal: 'Cilj mora biti pozitivan broj',
  invalid_deadline: 'Pogrešan rok',
  unauthorized: 'Sesija je istekla',
};

function defaultDays() {
  const now = new Date();
  const dow = now.getDay();
  return dow === 0 ? 7 : 7 - dow; // until next Sunday
}

export default function CreateChallengeModal({ friend, onClose, onCreated }) {
  const [stat, setStat] = useState('fitness');
  const [goal, setGoal] = useState(200);
  const [days, setDays] = useState(defaultDays());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [sent, setSent] = useState(false);

  const deadlines = [
    { label: 'Do nedelje', days: defaultDays() },
    { label: '+3 dana', days: 3 },
    { label: '+7 dana', days: 7 },
    { label: '+14 dana', days: 14 },
  ];

  async function create() {
    const g = parseInt(goal, 10);
    if (!Number.isInteger(g) || g <= 0) {
      setErr('Cilj mora biti pozitivan broj');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const deadline = new Date(Date.now() + days * 86_400_000);
      deadline.setHours(23, 59, 0, 0);
      await api.createChallenge({
        to: friend.user_id,
        stat,
        goal: g,
        deadline: deadline.toISOString(),
      });
      setSent(true);
      onCreated?.();
      setTimeout(onClose, 900);
    } catch (e) {
      setErr(friendly(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 10px', borderBottom: '2px solid var(--line)' }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>Izazovi prijatelja</div>
          <button onClick={onClose} aria-label="Zatvori" style={iconBtn}>
            <IcoX size={14} />
          </button>
        </div>

        <div style={{ padding: '14px 16px 6px' }}>
          <div className="eyebrow">Protivnik</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{friend.handle}</div>
          <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: 1, marginTop: 1 }}>
            {friend.friend_code}
          </div>
        </div>

        {sent ? (
          <div style={{ padding: '24px 16px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--leaf)' }}>Izazov pokrenut!</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginTop: 4 }}>
              {friend.handle} treba da prihvati.
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 16px 6px' }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Grana</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STATS.map((s) => {
                  const picked = stat === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStat(s)}
                      style={{
                        padding: '7px 11px', borderRadius: 100,
                        border: '2.5px solid var(--line)',
                        background: picked ? STAT_COLORS[s] : '#fff',
                        color: 'var(--ink)',
                        boxShadow: picked ? '3px 3px 0 var(--line)' : '2px 2px 0 var(--line)',
                        fontWeight: 800, fontSize: 12.5,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {STAT_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '12px 16px 6px' }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Cilj (XP)</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {QUICK_GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 10,
                      border: '2.5px solid var(--line)',
                      background: goal === g ? 'var(--ink)' : '#fff',
                      color: goal === g ? '#fff' : 'var(--ink)',
                      boxShadow: goal === g ? '2px 2px 0 var(--line)' : 'none',
                      fontWeight: 800, fontSize: 13,
                      fontFamily: 'inherit', cursor: 'pointer',
                    }}
                    className="mono"
                  >
                    {g}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                style={{
                  width: '100%', fontSize: 16, fontWeight: 800,
                  padding: '6px 10px',
                  border: '2px dashed rgba(31,26,20,0.2)', borderRadius: 8,
                  background: '#fff', outline: 'none',
                  fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink)',
                }}
              />
            </div>

            <div style={{ padding: '12px 16px 6px' }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Rok</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {deadlines.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setDays(d.days)}
                    style={{
                      padding: '7px 11px', borderRadius: 100,
                      border: '2.5px solid var(--line)',
                      background: days === d.days ? 'var(--violet)' : '#fff',
                      color: days === d.days ? '#fff' : 'var(--ink)',
                      boxShadow: days === d.days ? '3px 3px 0 var(--line)' : '2px 2px 0 var(--line)',
                      fontWeight: 800, fontSize: 12.5,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 8 }}>
                Ističe {formatDeadline(days)}.
              </div>
            </div>

            {err && (
              <div style={{ padding: '0 16px 12px', color: 'var(--fire)', fontSize: 12, fontWeight: 800 }}>
                Greška: {err}
              </div>
            )}

            <div style={{ padding: '12px 16px 18px' }}>
              <button
                onClick={create}
                className="chunk-btn"
                disabled={busy}
                style={{ width: '100%', padding: 13, fontSize: 14, opacity: busy ? 0.5 : 1 }}
              >
                {busy ? 'Pokrećem...' : 'Pokreni izazov'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatDeadline(days) {
  const d = new Date(Date.now() + days * 86_400_000);
  d.setHours(23, 59, 0, 0);
  return d.toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'short' });
}

function friendly(e) {
  const msg = String(e?.message ?? e);
  return ERR_MSG[msg] ?? msg;
}

const overlay = {
  position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(31,26,20,0.5)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
};

const panel = {
  background: 'var(--cream)',
  width: '100%', maxWidth: 480,
  maxHeight: '90vh', overflow: 'auto',
  borderTopLeftRadius: 20, borderTopRightRadius: 20,
  border: '2.5px solid var(--line)', borderBottom: 'none',
};

const iconBtn = {
  width: 32, height: 32, borderRadius: 8,
  border: '2px solid var(--line)', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', boxShadow: '2px 2px 0 var(--line)',
};
