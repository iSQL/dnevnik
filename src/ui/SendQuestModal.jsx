import { useEffect, useState } from 'react';
import { api } from '../core/api.js';
import { moduleRegistry } from '../core/module-registry.js';
import { IcoX, IcoSend } from './icons.jsx';

const DIFF_LABEL = { easy: 'Lako', medium: 'Srednje', hard: 'Teško', epic: 'Epsko' };
const SCHED_LABEL = { daily: 'dnevno', weekly: 'nedeljno', epic: 'epsko' };

const ERR_MSG = {
  no_identity: 'Postavi profil prvo',
  not_friends: 'Niste više prijatelji',
  cannot_recommend_to_self: 'Ne možeš predložiti sebi',
  invalid_quest: 'Zadatak je neispravan',
  unauthorized: 'Sesija je istekla',
};

export default function SendQuestModal({ quest, onClose }) {
  const [friends, setFriends] = useState(null);
  const [pickedId, setPickedId] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let alive = true;
    api.listFriends()
      .then((list) => alive && setFriends(list))
      .catch((e) => alive && setErr(friendly(e)));
    return () => { alive = false; };
  }, []);

  async function send() {
    if (!pickedId) return;
    setBusy(true);
    setErr(null);
    try {
      await api.recommend({
        to: pickedId,
        quest: {
          name: quest.name,
          moduleId: quest.moduleId,
          difficulty: quest.difficulty,
          schedule: quest.schedule,
        },
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

  const m = moduleRegistry.get(quest.moduleId);

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 10px', borderBottom: '2px solid var(--line)' }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>Pošalji prijatelju</div>
          <button onClick={onClose} aria-label="Zatvori" style={iconBtn}>
            <IcoX size={14} />
          </button>
        </div>

        <div style={{ padding: '14px 16px' }}>
          <div className="eyebrow">Predlažeš zadatak</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{quest.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 2 }}>
            {m?.name ?? quest.moduleId}
            {quest.difficulty && ` · ${DIFF_LABEL[quest.difficulty] ?? quest.difficulty}`}
            {quest.schedule && ` · ${SCHED_LABEL[quest.schedule] ?? quest.schedule}`}
          </div>
        </div>

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
                <div className="tile" style={{ padding: 8, maxHeight: 240, overflowY: 'auto' }}>
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
                disabled={!pickedId || busy || !friends?.length}
                style={{
                  width: '100%', padding: 13, fontSize: 14,
                  opacity: pickedId && !busy && friends?.length ? 1 : 0.5,
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
  maxHeight: '85vh', overflow: 'auto',
  borderTopLeftRadius: 20, borderTopRightRadius: 20,
  border: '2.5px solid var(--line)', borderBottom: 'none',
};

const iconBtn = {
  width: 32, height: 32, borderRadius: 8,
  border: '2px solid var(--line)', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', boxShadow: '2px 2px 0 var(--line)',
};
