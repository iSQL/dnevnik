import { useEffect, useState } from 'react';
import { api } from '../core/api.js';
import { moduleRegistry } from '../core/module-registry.js';
import { DIFFICULTIES } from '../core/stats.js';
import { resolveIcon, IcoX, IcoSend } from './icons.jsx';

const DIFF_LABEL = { easy: 'Lako', medium: 'Srednje', hard: 'Teško', epic: 'Epsko' };
const SCHED_LABEL = { daily: 'dnevno', weekly: 'nedeljno', epic: 'epsko' };

const SCHEDULES = [
  { id: 'daily',  label: 'Dnevno' },
  { id: 'weekly', label: 'Nedeljno' },
  { id: 'epic',   label: 'Epsko' },
];

const ERR_MSG = {
  no_identity: 'Postavi profil prvo',
  not_friends: 'Niste više prijatelji',
  cannot_recommend_to_self: 'Ne možeš predložiti sebi',
  invalid_quest: 'Zadatak je neispravan',
  unauthorized: 'Sesija je istekla',
};

// Two modes:
//   - readonly: pass `quest` (existing quest object). Recipient sees it as-is.
//   - compose:  omit `quest`. User fills the form. Optionally pass
//     `preselectedFriend` to pre-fill the picker.
export default function SendQuestModal({ quest, preselectedFriend, onClose }) {
  const isCompose = !quest;
  const modules = moduleRegistry.list();

  const [friends, setFriends] = useState(null);
  const [pickedId, setPickedId] = useState(preselectedFriend?.user_id ?? null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    name: '',
    moduleId: modules[0]?.id ?? null,
    difficulty: 'medium',
    schedule: 'daily',
  });

  useEffect(() => {
    let alive = true;
    api.listFriends()
      .then((list) => alive && setFriends(list))
      .catch((e) => alive && setErr(friendly(e)));
    return () => { alive = false; };
  }, []);

  const composeReady = Boolean(form.name.trim() && form.moduleId);
  const canSend = pickedId && !busy && friends?.length && (isCompose ? composeReady : true);

  async function send() {
    if (!canSend) return;
    setBusy(true);
    setErr(null);
    try {
      const payload = isCompose
        ? {
            name: form.name.trim(),
            moduleId: form.moduleId,
            difficulty: form.difficulty,
            schedule: form.schedule,
          }
        : {
            name: quest.name,
            moduleId: quest.moduleId,
            difficulty: quest.difficulty,
            schedule: quest.schedule,
          };
      await api.recommend({
        to: pickedId,
        quest: payload,
        note: note.trim() || undefined,
      });
      setSent(true);
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
          <div style={{ fontWeight: 900, fontSize: 14 }}>
            {isCompose ? 'Predloži novi zadatak' : 'Pošalji prijatelju'}
          </div>
          <button onClick={onClose} aria-label="Zatvori" style={iconBtn}>
            <IcoX size={14} />
          </button>
        </div>

        {isCompose
          ? <ComposeForm form={form} setForm={setForm} modules={modules} />
          : <QuestSummary quest={quest} />
        }

        {sent ? (
          <div style={{ padding: '24px 16px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--leaf)' }}>Poslato!</div>
          </div>
        ) : (
          <>
            <div style={{ padding: '0 16px 8px' }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Kome šalješ</div>
              {friends === null && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, padding: '8px 0' }}>Učitavam...</div>
              )}
              {friends && friends.length === 0 && (
                <div className="tile" style={{ padding: '12px 14px', background: 'var(--cream)', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                  Nemaš prijatelje. Otvori Prijatelje i dodaj nekoga preko koda.
                </div>
              )}
              {friends && friends.length > 0 && (
                <div className="tile" style={{ padding: 8, maxHeight: 200, overflowY: 'auto' }}>
                  {friends.map((f) => {
                    const picked = pickedId === f.user_id;
                    return (
                      <button
                        key={f.user_id}
                        onClick={() => setPickedId(f.user_id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: 10,
                          border: picked ? '2.5px solid var(--line)' : '2px dashed transparent',
                          background: picked ? 'var(--violet)' : 'transparent',
                          color: picked ? '#fff' : 'var(--ink)',
                          marginBottom: 4, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{f.handle}</span>
                        <span className="mono" style={{ fontSize: 10, fontWeight: 700, opacity: 0.75 }}>{f.friend_code}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '8px 16px 14px' }}>
              <label className="eyebrow">Poruka (po želji)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={280}
                placeholder="ovo bi ti prijalo"
                style={{
                  width: '100%', fontSize: 14, fontWeight: 600, marginTop: 6,
                  padding: '6px 0 8px', border: 'none', outline: 'none',
                  borderBottom: '2px dashed rgba(31,26,20,0.15)',
                  background: 'transparent', fontFamily: 'inherit', color: 'var(--ink)',
                }}
              />
            </div>

            {err && (
              <div style={{ padding: '0 16px 12px', color: 'var(--fire)', fontSize: 12, fontWeight: 800 }}>
                Greška: {err}
              </div>
            )}

            <div style={{ padding: '0 16px 18px' }}>
              <button
                onClick={send}
                className="chunk-btn"
                disabled={!canSend}
                style={{
                  width: '100%', padding: 13, fontSize: 14,
                  opacity: canSend ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <IcoSend size={16} stroke="#fff" />
                {busy ? 'Šaljem...' : 'Pošalji'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuestSummary({ quest }) {
  const m = moduleRegistry.get(quest.moduleId);
  return (
    <div style={{ padding: '14px 16px' }}>
      <div className="eyebrow">Predlažeš zadatak</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{quest.name}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 2 }}>
        {m?.name ?? quest.moduleId}
        {quest.difficulty && ` · ${DIFF_LABEL[quest.difficulty] ?? quest.difficulty}`}
        {quest.schedule && ` · ${SCHED_LABEL[quest.schedule] ?? quest.schedule}`}
      </div>
    </div>
  );
}

function ComposeForm({ form, setForm, modules }) {
  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <>
      <div style={{ padding: '14px 16px 8px' }}>
        <div className="tile" style={{ padding: '12px 14px 10px', background: '#fff' }}>
          <label className="eyebrow" style={{ fontSize: 10, display: 'block' }}>Ime zadatka</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            maxLength={100}
            autoFocus
            placeholder="npr. Pročitaj 10 strana"
            style={{
              width: '100%', fontSize: 16, fontWeight: 800, marginTop: 4,
              padding: '0 0 8px', border: 'none', outline: 'none',
              borderBottom: '2px dashed rgba(31,26,20,0.15)',
              background: 'transparent', fontFamily: 'inherit', color: 'var(--ink)',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '0 16px 10px' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Grana</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {modules.map((m) => {
            const Icon = resolveIcon(m.icon);
            const selected = m.id === form.moduleId;
            return (
              <button
                key={m.id}
                onClick={() => set('moduleId', m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px 6px 6px',
                  background: selected ? m.color : '#fff',
                  border: '2px solid var(--line)',
                  borderRadius: 100,
                  fontWeight: 800, fontSize: 12,
                  boxShadow: selected ? '2px 2px 0 var(--line)' : '1.5px 1.5px 0 var(--line)',
                  cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 6, background: selected ? '#fff' : m.color, border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={12} />
                </div>
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '6px 16px 6px' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Težina</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DIFFICULTIES.map((d) => {
            const selected = d.id === form.difficulty;
            return (
              <button
                key={d.id}
                onClick={() => set('difficulty', d.id)}
                style={{
                  flex: 1, padding: '7px 4px',
                  background: selected ? d.tint : 'transparent',
                  border: selected ? '2px solid var(--line)' : '2px dashed rgba(31,26,20,0.2)',
                  borderRadius: 10,
                  boxShadow: selected ? '2px 2px 0 var(--line)' : 'none',
                  cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 11 }}>{d.label}</div>
                <div className="mono" style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }}>+{d.xp}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '6px 16px 14px' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Raspored</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {SCHEDULES.map((s) => {
            const selected = s.id === form.schedule;
            return (
              <button
                key={s.id}
                onClick={() => set('schedule', s.id)}
                style={{
                  flex: 1, padding: '7px 4px',
                  background: selected ? 'var(--ink)' : 'transparent',
                  color: selected ? '#fff' : 'var(--ink)',
                  border: selected ? '2px solid var(--line)' : '2px dashed rgba(31,26,20,0.2)',
                  borderRadius: 10,
                  boxShadow: selected ? '2px 2px 0 var(--line)' : 'none',
                  fontWeight: 900, fontSize: 11,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
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
