import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/db.js';
import { ACHIEVEMENTS } from '../core/achievements.js';
import { IcoStar } from '../ui/icons.jsx';
import { Pill } from '../ui/primitives.jsx';
import StatusBar from '../ui/StatusBar.jsx';
import TabBar from '../ui/TabBar.jsx';

const RARITIES = ['Sve', 'Otključani', 'Common', 'Rare', 'Epic', 'Legendary'];
const RARITY_SR = { Common: 'Česti', Rare: 'Retki', Epic: 'Epski', Legendary: 'Legendarni' };

export default function Achievements() {
  const [filter, setFilter] = useState('Sve');
  const unlockedRows = useLiveQuery(() => db.achievements.toArray(), []) ?? [];
  const unlockedMap = new Map(unlockedRows.map((r) => [r.id, r]));

  let items = ACHIEVEMENTS.map((a) => ({ ...a, earned: unlockedMap.has(a.id), unlockedAt: unlockedMap.get(a.id)?.unlockedAt }));
  if (filter === 'Otključani') items = items.filter((a) => a.earned);
  else if (['Common', 'Rare', 'Epic', 'Legendary'].includes(filter)) items = items.filter((a) => a.rarity === filter);

  const earnedCount = unlockedRows.length;
  const total = ACHIEVEMENTS.length;
  const latest = unlockedRows.slice().sort((a, b) => b.unlockedAt - a.unlockedAt)[0];
  const latestDef = latest ? ACHIEVEMENTS.find((a) => a.id === latest.id) : null;

  return (
    <div className="screen">
      <StatusBar />
      <div className="screen-body">
        <div className="scroll">
          <div style={{ padding: '12px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="title">Trofeji</h1>
            <Pill bg="var(--coin-soft)"><IcoStar size={14} />{earnedCount}/{total}</Pill>
          </div>
          <div style={{ padding: '0 20px 14px', fontSize: 13, color: 'var(--ink-3)', fontWeight: 700 }}>
            Sjajne stvari za obavljene stvari. Neke su teže od drugih.
          </div>

          <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto' }}>
            {RARITIES.map((r) => {
              const active = filter === r;
              const label = r === 'Sve' ? `Sve ${total}` : r === 'Otključani' ? `Otključani ${earnedCount}` : RARITY_SR[r] ?? r;
              return (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  style={{
                    padding: '6px 12px', border: '2px solid var(--line)', borderRadius: 100,
                    background: active ? '#1F1A14' : '#fff', color: active ? '#fff' : 'var(--ink)',
                    fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap',
                    boxShadow: active ? '2px 2px 0 var(--line)' : 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {latestDef && (
            <div style={{ padding: '0 20px 14px' }}>
              <div className="tile" style={{ padding: '16px 14px', background: '#1F1A14', color: '#fff', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, background: latestDef.tint, border: '2.5px solid #1F1A14', boxShadow: '3px 3px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IcoStar size={42} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="eyebrow" style={{ color: 'var(--coin)' }}>Najnoviji · {RARITY_SR[latestDef.rarity] ?? latestDef.rarity}</div>
                  <div style={{ fontWeight: 900, fontSize: 16, marginTop: 2 }}>{latestDef.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 700, marginTop: 2 }}>{latestDef.description}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '0 20px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {items.map((a) => (
                <div key={a.id} style={{ textAlign: 'center' }}>
                  <div style={{
                    aspectRatio: '1', background: a.earned ? a.tint : '#ECE6DB',
                    border: '2.5px solid var(--line)', borderRadius: 16,
                    boxShadow: '3px 3px 0 var(--line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: a.earned ? 1 : 0.55, position: 'relative',
                  }}>
                    {a.earned ? <IcoStar size={38} fill="#FFD93D" /> : (
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8C8174" strokeWidth="2.5" strokeLinejoin="round">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11 V8 C8 5.5, 10 4, 12 4 C14 4, 16 5.5, 16 8 V11" />
                      </svg>
                    )}
                    {a.rarity === 'Legendary' && (
                      <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--coin)', border: '1.5px solid var(--line)', fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 5 }}>✦</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 12, marginTop: 6, color: a.earned ? 'var(--ink)' : 'var(--ink-3)' }}>{a.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', marginTop: 1, lineHeight: 1.2 }}>{a.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    </div>
  );
}
