import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/db.js';
import { xpEngine } from '../../core/xp-engine.js';
import { xpProgress, STAT_TINTS, STAT_LABELS, xpForDifficulty } from '../../core/stats.js';
import { resolveIcon, IcoChev, IcoPlus, IcoStar } from '../../ui/icons.jsx';
import { Check, XPBar } from '../../ui/primitives.jsx';
import StatusBar from '../../ui/StatusBar.jsx';
import TabBar from '../../ui/TabBar.jsx';

const DAY_MS = 86_400_000;

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function weeksAgoDates(weeks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align to most recent Sunday so grid reads left-to-right old→new
  const endSun = new Date(today);
  endSun.setDate(today.getDate() - today.getDay());
  const cols = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(endSun);
      day.setDate(endSun.getDate() - w * 7 + d);
      col.push(day);
    }
    cols.push(col);
  }
  return cols;
}

export default function ModuleDetail({ manifest }) {
  const navigate = useNavigate();
  const Icon = resolveIcon(manifest.icon);
  const stat = manifest.stat;

  const statRow = useLiveQuery(() => db.stats.get(stat), [stat]);
  const quests = useLiveQuery(
    () => db.quests.where({ moduleId: manifest.id, active: 1 }).toArray(),
    [manifest.id],
  ) ?? [];
  const completions = useLiveQuery(
    () => db.completions.where('stat').equals(stat).toArray(),
    [stat],
  ) ?? [];

  const progress = statRow ? xpProgress(statRow.xp) : { level: 0, pct: 0, intoLevel: 0, span: 200 };

  // Today's done quests (completed today)
  const todayKey = dayKey(Date.now());
  const doneToday = new Set(
    completions.filter((c) => dayKey(c.timestamp) === todayKey).map((c) => c.questId),
  );

  // Streak (consecutive days back from today with at least one completion for this stat)
  const days = new Set(completions.map((c) => dayKey(c.timestamp)));
  let streak = 0;
  const cur = new Date();
  while (days.has(dayKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }

  // This week count (last 7 days)
  const weekAgo = Date.now() - 7 * DAY_MS;
  const thisWeek = completions.filter((c) => c.timestamp >= weekAgo).length;

  // Best streak over history
  const sortedDays = [...days].sort();
  let best = 0, run = 0, prev = null;
  for (const k of sortedDays) {
    const [y, m, d] = k.split('-').map(Number);
    const t = new Date(y, m, d).getTime();
    if (prev !== null && t - prev === DAY_MS) run++; else run = 1;
    if (run > best) best = run;
    prev = t;
  }

  const heatCols = weeksAgoDates(12);
  const countsByDay = new Map();
  for (const c of completions) {
    const k = dayKey(c.timestamp);
    countsByDay.set(k, (countsByDay.get(k) ?? 0) + 1);
  }

  async function checkOff(q) {
    if (doneToday.has(q.id)) return;
    const amount = xpForDifficulty(q.difficulty);
    await xpEngine.award(stat, amount, { source: 'quest', questId: q.id });
  }

  async function addQuestHere() {
    navigate(`/add?module=${manifest.id}`);
  }

  const color = manifest.color || 'var(--fire)';
  const tint = STAT_TINTS[stat] ?? 'fire';

  return (
    <div className="screen">
      <StatusBar dark />
      <div className="screen-body">
        <div className="scroll">
          <div style={{ background: color, padding: '8px 20px 24px', borderBottom: '2.5px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(#1F1A14 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
              <button
                onClick={() => navigate(-1)}
                style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', cursor: 'pointer' }}
                aria-label="Nazad"
              >
                <IcoChev dir="left" size={18} />
              </button>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Nazad</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, position: 'relative' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: '#fff', border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 0 var(--line)' }}>
                <Icon size={46} />
              </div>
              <div style={{ color: '#fff' }}>
                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>{manifest.name} · {STAT_LABELS[stat]}</div>
                <h1 className="title" style={{ color: '#fff', marginTop: 2 }}>Nivo {progress.level}</h1>
                <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 700, marginTop: 2 }}>{manifest.flavor ?? 'Kreći napred.'}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, background: '#1F1A14', padding: '10px 12px', borderRadius: 12, border: '2.5px solid var(--line)', boxShadow: '3px 3px 0 rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                <span className="mono">{statRow?.xp ?? 0} XP</span>
                <span className="mono" style={{ opacity: 0.7 }}>{progress.span - progress.intoLevel} do Lv {progress.level + 1}</span>
              </div>
              <XPBar pct={progress.pct} tint={tint} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '16px 20px 8px' }}>
            <MiniStat label="Niz" val={streak} unit="dana" tint={color} />
            <MiniStat label="Ova nedelja" val={thisWeek} unit="obavljeno" tint="var(--violet)" />
            <MiniStat label="Najduži niz" val={best} unit="dana" tint="var(--coin)" />
          </div>

          <div style={{ padding: '12px 20px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 className="title" style={{ fontSize: 17 }}>Danas</h2>
              <button onClick={addQuestHere} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', cursor: 'pointer' }}>
                <IcoPlus size={14} /> Dodaj
              </button>
            </div>
            <div className="tile" style={{ padding: '12px 14px' }}>
              {quests.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700, padding: '8px 0' }}>
                  Nema zadataka još. Dodaj jedan da krene.
                </div>
              ) : quests.map((q, i) => {
                const done = doneToday.has(q.id);
                return (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 2px', borderBottom: i === quests.length - 1 ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
                    <Check done={done} tint={color} onClick={() => checkOff(q)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1, textTransform: 'capitalize' }}>
                        {difficultyLabel(q.difficulty)} · {q.schedule === 'weekly' ? 'nedeljno' : q.schedule === 'epic' ? 'epsko' : 'dnevno'}
                      </div>
                    </div>
                    <div className="mono" style={{ fontWeight: 800, fontSize: 12.5, color: done ? 'var(--ink-3)' : 'var(--green-deep)' }}>
                      +{xpForDifficulty(q.difficulty)} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '14px 20px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h2 className="title" style={{ fontSize: 17 }}>Doslednost</h2>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)' }}>POSLEDNJIH 12 NEDELJA</span>
            </div>
            <div className="tile" style={{ padding: 14 }}>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'space-between' }}>
                {heatCols.map((col, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {col.map((day, j) => {
                      const c = countsByDay.get(dayKey(day.getTime())) ?? 0;
                      const future = day.getTime() > Date.now();
                      const op = future ? 0 : c === 0 ? 0 : c === 1 ? 0.4 : c === 2 ? 0.7 : 1;
                      return (
                        <div
                          key={j}
                          title={`${day.toLocaleDateString('sr-Latn-RS')} · ${c}`}
                          style={{
                            width: 17, height: 17,
                            background: future ? 'transparent' : (op === 0 ? '#fff' : color),
                            opacity: future ? 0.3 : (op === 0 ? 1 : op),
                            border: '1.2px solid var(--line)', borderRadius: 4,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>
                <span>Manje</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 0.4, 0.7, 1].map((o, i) => (
                    <div key={i} style={{ width: 11, height: 11, background: o === 0 ? '#fff' : color, opacity: o === 0 ? 1 : o, border: '1.2px solid var(--line)', borderRadius: 3 }} />
                  ))}
                </div>
                <span>Više</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 20px 28px' }}>
            <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Grana dostignuća</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {BRANCH_TROPHIES(progress.level).map((t, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    aspectRatio: '1', background: t.earned ? color : '#ECE6DB',
                    border: '2.5px solid var(--line)', borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '2.5px 2.5px 0 var(--line)', opacity: t.earned ? 1 : 0.5,
                  }}>
                    <IcoStar size={28} fill={t.earned ? '#FFD93D' : '#ccc'} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, marginTop: 5, color: t.earned ? 'var(--ink)' : 'var(--ink-3)' }}>{t.label}</div>
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

function MiniStat({ label, val, unit, tint }) {
  return (
    <div className="chunk" style={{ padding: '10px 8px', textAlign: 'center', borderRadius: 14, boxShadow: '3px 3px 0 var(--line)' }}>
      <div className="eyebrow" style={{ fontSize: 9.5, color: tint }}>{label}</div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{val}</div>
      <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 700 }}>{unit}</div>
    </div>
  );
}

const BRANCH_TROPHIES = (lvl) => [
  { label: 'Nivo 1', earned: lvl >= 1 },
  { label: 'Nivo 5', earned: lvl >= 5 },
  { label: 'Nivo 10', earned: lvl >= 10 },
  { label: '???', earned: false },
];

function difficultyLabel(id) {
  return { easy: 'Lako', medium: 'Srednje', hard: 'Teško', epic: 'Epsko' }[id] ?? id;
}
