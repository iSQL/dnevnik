import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/db.js';
import { xpEngine } from '../core/xp-engine.js';
import {
  STATS, STAT_LABELS, xpForDifficulty, xpForLevel, xpProgress,
} from '../core/stats.js';
import { moduleRegistry } from '../core/module-registry.js';
import { resolveIcon, IcoFire, IcoCoin, IcoPlus } from '../ui/icons.jsx';
import { Check, XPBar } from '../ui/primitives.jsx';
import HexRadar from '../ui/HexRadar.jsx';
import TabBar from '../ui/TabBar.jsx';

const WEEKDAY = ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'];
const MONTH = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'];

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function Home() {
  const statsRows = useLiveQuery(() => db.stats.toArray(), []) ?? [];
  const quests = useLiveQuery(() => db.quests.where({ active: 1 }).toArray(), []) ?? [];
  const completions = useLiveQuery(() => db.completions.toArray(), []) ?? [];

  const modules = moduleRegistry.list();
  const statsById = Object.fromEntries(statsRows.map((s) => [s.id, s]));

  // Radar: normalize each stat's XP by max in this user's set, with a 200 floor for early UX.
  const maxXp = Math.max(200, ...statsRows.map((s) => s.xp));
  const radarValues = Object.fromEntries(statsRows.map((s) => [s.id, s.xp / maxXp]));

  // Overall XP + level
  const totalXp = statsRows.reduce((sum, s) => sum + s.xp, 0);
  const totalProgress = xpProgress(totalXp);

  // Streak across all completions
  const days = new Set(completions.map((c) => dayKey(c.timestamp)));
  let streak = 0;
  const cur = new Date();
  while (days.has(dayKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }

  // Today's quests (daily quests; a quest counts as "done today" if a completion exists with that questId today)
  const todayKey = dayKey(Date.now());
  const doneToday = new Set(
    completions.filter((c) => dayKey(c.timestamp) === todayKey).map((c) => c.questId),
  );
  const todayQuests = quests
    .filter((q) => q.schedule === 'daily')
    .slice(0, 5);
  const todayDone = todayQuests.filter((q) => doneToday.has(q.id)).length;

  const today = new Date();
  const dateStr = `${WEEKDAY[today.getDay()]} · ${today.getDate()}. ${MONTH[today.getMonth()]}`;

  async function checkOff(q) {
    if (doneToday.has(q.id)) return;
    await xpEngine.award(q.stat ?? moduleRegistry.get(q.moduleId)?.stat, xpForDifficulty(q.difficulty), {
      source: 'quest', questId: q.id,
    });
  }

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="scroll">
          <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="eyebrow">{dateStr}</div>
              <h1 className="title" style={{ marginTop: 2 }}>Zdravo.</h1>
            </div>
            <div className="chunk" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 100, boxShadow: '2px 2px 0 var(--line)' }}>
              <IcoFire size={18} />
              <span className="mono" style={{ fontWeight: 800 }}>{streak}</span>
            </div>
          </div>

          {/* HERO XP CARD */}
          <div style={{ padding: '0 20px 16px' }}>
            <div className="tile" style={{ background: '#1F1A14', color: '#fff', padding: '18px 18px 16px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#FFC83D 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="eyebrow" style={{ color: '#FFC83D' }}>Ukupno · Lv {totalProgress.level}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span className="mono" style={{ fontSize: 32, fontWeight: 800 }}>{totalXp.toLocaleString('sr-Latn-RS')}</span>
                    <span style={{ fontSize: 13, opacity: 0.7, fontWeight: 700 }}>XP</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <IcoCoin size={20} />
                    <span className="mono" style={{ fontSize: 17, fontWeight: 800 }}>{Math.floor(totalXp / 10).toLocaleString('sr-Latn-RS')}</span>
                  </div>
                  <div style={{ fontSize: 10.5, opacity: 0.6, fontWeight: 700, marginTop: 2, letterSpacing: 0.5 }}>NOVČIĆI</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <XPBar pct={totalProgress.pct} tint="coin" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, opacity: 0.7, fontWeight: 700 }}>
                  <span className="mono">Lv {totalProgress.level}</span>
                  <span className="mono">{totalProgress.intoLevel} / {totalProgress.span} do Lv {totalProgress.level + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* HEX RADAR */}
          <div style={{ padding: '0 20px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h2 className="title" style={{ fontSize: 17 }}>Profil veština</h2>
              <Link to="/stats" style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)' }}>vidi sve →</Link>
            </div>
            <div className="tile" style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
              <HexRadar values={radarValues} size={260} />
            </div>
          </div>

          {/* TODAY'S QUESTS */}
          <div style={{ padding: '0 20px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 className="title" style={{ fontSize: 17 }}>Današnji zadaci</h2>
              <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)' }}>{todayDone} / {todayQuests.length}</span>
            </div>
            <div className="tile" style={{ background: '#fff', padding: '14px 14px 12px' }}>
              {todayQuests.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700, padding: '8px 0' }}>
                  Nema aktivnih zadataka. <Link to="/add" style={{ color: 'var(--violet-deep)', fontWeight: 800 }}>Dodaj prvi →</Link>
                </div>
              ) : todayQuests.map((q, i) => {
                const m = moduleRegistry.get(q.moduleId);
                const Icon = resolveIcon(m?.icon);
                const tint = m?.color || 'var(--violet)';
                const done = doneToday.has(q.id);
                return (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 2px', borderBottom: i === todayQuests.length - 1 ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
                    <Check done={done} tint={tint} onClick={() => checkOff(q)} />
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: tint, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>{m?.name}</div>
                    </div>
                    <div className="mono" style={{ fontWeight: 800, fontSize: 12.5, color: done ? 'var(--ink-3)' : 'var(--green-deep)' }}>
                      +{xpForDifficulty(q.difficulty)} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CATEGORY GRID */}
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h2 className="title" style={{ fontSize: 17 }}>Tvoje veštine</h2>
              <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>{modules.length} granа</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {modules.map((m) => (
                <CategoryTile key={m.id} module={m} stat={statsById[m.stat]} />
              ))}
              <Link to="/add" className="tile" style={{
                height: 128, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'transparent', border: '2.5px dashed rgba(31,26,20,0.3)',
                boxShadow: 'none', color: 'var(--ink-3)',
              }}>
                <IcoPlus size={24} />
                <div style={{ fontWeight: 800, fontSize: 13 }}>Novi zadatak</div>
              </Link>
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    </div>
  );
}

function CategoryTile({ module: m, stat }) {
  const Icon = resolveIcon(m.icon);
  const xp = stat?.xp ?? 0;
  const prog = xpProgress(xp);
  return (
    <Link to={`/c/${m.id}`} className="tile" style={{ background: m.soft || '#fff', padding: 12, height: 128, display: 'flex', flexDirection: 'column', color: 'var(--ink)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: m.color, border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={26} />
        </div>
        <div className="mono" style={{ background: '#1F1A14', color: '#fff', fontWeight: 900, fontSize: 10.5, padding: '2.5px 7px', borderRadius: 6 }}>Lv {prog.level}</div>
      </div>
      <div style={{ fontWeight: 900, fontSize: 14, marginTop: 'auto', marginBottom: 2 }}>{m.name}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 800, marginBottom: 5 }}>{STAT_LABELS[m.stat]}</div>
      <div style={{ height: 6, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${prog.pct}%`, height: '100%', background: m.color, borderRight: prog.pct > 5 && prog.pct < 100 ? '1.5px solid var(--line)' : 'none' }} />
      </div>
    </Link>
  );
}
