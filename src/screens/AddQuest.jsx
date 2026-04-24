import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../core/db.js';
import { DIFFICULTIES, xpForDifficulty } from '../core/stats.js';
import { moduleRegistry } from '../core/module-registry.js';
import { resolveIcon, IcoPlus, IcoCoin, IcoX } from '../ui/icons.jsx';

const SCHEDULES = [
  { id: 'daily',  label: 'Dnevno' },
  { id: 'weekly', label: 'Nedeljno' },
  { id: 'epic',   label: 'Epsko' },
];

export default function AddQuest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const modules = moduleRegistry.list();
  const initialModuleId = params.get('module') ?? modules[0]?.id;

  const [name, setName] = useState('');
  const [moduleId, setModuleId] = useState(initialModuleId);
  const [difficulty, setDifficulty] = useState('medium');
  const [schedule, setSchedule] = useState('daily');

  const module = moduleRegistry.get(moduleId);
  const xp = xpForDifficulty(difficulty);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed || !module) return;
    await db.quests.add({
      moduleId: module.id,
      name: trimmed,
      difficulty,
      schedule,
      active: 1,
      createdAt: Date.now(),
    });
    navigate(-1);
  }

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="scroll" style={{ paddingBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px' }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Zatvori"
              style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 var(--line)', cursor: 'pointer' }}
            >
              <IcoX size={16} />
            </button>
            <div style={{ fontWeight: 900, fontSize: 14 }}>Novi zadatak</div>
            <div style={{ width: 34 }} />
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <h1 className="title" style={{ fontSize: 24 }}>Šta ćeš<br />osvojiti danas?</h1>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div className="tile" style={{ padding: '14px 14px 12px', background: '#fff' }}>
              <label className="eyebrow" style={{ fontSize: 10, display: 'block' }}>Ime zadatka</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="npr. Pročitaj 10 strana"
                autoFocus
                style={{
                  width: '100%',
                  fontSize: 18,
                  fontWeight: 800,
                  marginTop: 6,
                  padding: '0 0 10px',
                  border: 'none',
                  borderBottom: '2px dashed rgba(31,26,20,0.15)',
                  background: 'transparent',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: 'var(--ink)',
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 8 }}>
                Kratko i jasno. Budi ti zahvalan.
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Dodeli grani</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {modules.map((m) => {
                const Icon = resolveIcon(m.icon);
                const selected = m.id === moduleId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModuleId(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px 7px 8px',
                      background: selected ? m.color : '#fff', border: '2.5px solid var(--line)',
                      borderRadius: 100, fontWeight: 800, fontSize: 13,
                      boxShadow: selected ? '3px 3px 0 var(--line)' : '2px 2px 0 var(--line)',
                      cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 7, background: selected ? '#fff' : m.color, border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} />
                    </div>
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Težina</div>
            <div className="tile" style={{ padding: '10px 12px', background: '#fff' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {DIFFICULTIES.map((d) => {
                  const selected = d.id === difficulty;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      style={{
                        flex: 1, textAlign: 'center', padding: '8px 4px',
                        background: selected ? d.tint : 'transparent',
                        border: selected ? '2.5px solid var(--line)' : '2px dashed rgba(31,26,20,0.2)',
                        borderRadius: 10,
                        boxShadow: selected ? '2px 2px 0 var(--line)' : 'none',
                        cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: 12 }}>{d.label}</div>
                      <div className="mono" style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, marginTop: 1 }}>+{d.xp}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Raspored</div>
            <div className="tile" style={{ padding: '10px 12px', background: '#fff', display: 'flex', gap: 8 }}>
              {SCHEDULES.map((s) => {
                const selected = s.id === schedule;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSchedule(s.id)}
                    style={{
                      flex: 1, padding: '8px 4px',
                      background: selected ? 'var(--ink)' : 'transparent',
                      color: selected ? '#fff' : 'var(--ink)',
                      border: selected ? '2.5px solid var(--line)' : '2px dashed rgba(31,26,20,0.2)',
                      borderRadius: 10,
                      boxShadow: selected ? '2px 2px 0 var(--line)' : 'none',
                      fontWeight: 900, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div className="tile" style={{ background: 'var(--coin-soft)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--coin)', border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcoCoin size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="eyebrow" style={{ color: 'var(--coin-deep)' }}>Nagrada po završetku</div>
                <div style={{ fontWeight: 900, fontSize: 15, marginTop: 1 }}>+{xp} XP · +{Math.floor(xp / 5)} novčića</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>{module?.name} · {module?.flavor}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 20px' }}>
            <button
              className="chunk-btn"
              onClick={save}
              disabled={!name.trim()}
              style={{ width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: name.trim() ? 1 : 0.5 }}
            >
              <IcoPlus size={16} stroke="#fff" /> Potvrdi zadatak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
