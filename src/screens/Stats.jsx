import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/db.js';
import { STAT_LABELS, xpProgress } from '../core/stats.js';
import { moduleRegistry } from '../core/module-registry.js';
import { resolveIcon, IcoFire, IcoCoin } from '../ui/icons.jsx';
import { Pill, XPBar } from '../ui/primitives.jsx';
import HexRadar from '../ui/HexRadar.jsx';
import StatusBar from '../ui/StatusBar.jsx';
import TabBar from '../ui/TabBar.jsx';

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function Stats() {
  const statsRows = useLiveQuery(() => db.stats.toArray(), []) ?? [];
  const completions = useLiveQuery(() => db.completions.toArray(), []) ?? [];
  const achievements = useLiveQuery(() => db.achievements.toArray(), []) ?? [];

  const modules = moduleRegistry.list();
  const totalXp = statsRows.reduce((s, r) => s + r.xp, 0);
  const totalProgress = xpProgress(totalXp);

  const days = new Set(completions.map((c) => dayKey(c.timestamp)));
  let streak = 0;
  const cur = new Date();
  while (days.has(dayKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }

  const hoursTracked = Math.round(completions.length * 0.25); // rough: 15min per completion avg
  const maxXp = Math.max(200, ...statsRows.map((s) => s.xp));
  const radarValues = Object.fromEntries(statsRows.map((s) => [s.id, s.xp / maxXp]));

  // Stats per module, sorted by level desc
  const moduleStats = modules.map((m) => {
    const row = statsRows.find((s) => s.id === m.stat);
    const prog = xpProgress(row?.xp ?? 0);
    return { module: m, prog };
  }).sort((a, b) => b.prog.level - a.prog.level || b.prog.pct - a.prog.pct);

  return (
    <div className="screen">
      <StatusBar />
      <div className="screen-body">
        <div className="scroll">
          <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--sun)', border: '2.5px solid var(--line)', boxShadow: '4px 4px 0 var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="52" height="52" viewBox="0 0 60 60">
                <circle cx="30" cy="26" r="16" fill="#FFE1D0" stroke="#1F1A14" strokeWidth="2.5" />
                <circle cx="24" cy="25" r="2" fill="#1F1A14" />
                <circle cx="36" cy="25" r="2" fill="#1F1A14" />
                <path d="M24 32 Q30 36 36 32" stroke="#1F1A14" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M16 18 Q20 10 30 10 Q40 10 44 18" fill="#5A3FE0" stroke="#1F1A14" strokeWidth="2.5" />
              </svg>
              <div className="mono" style={{ position: 'absolute', bottom: -6, right: -6, background: '#1F1A14', color: '#FFC83D', fontWeight: 900, fontSize: 11, padding: '3px 7px', borderRadius: 8, border: '2px solid var(--line)' }}>Lv {totalProgress.level}</div>
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="title" style={{ fontSize: 22 }}>Junak</h1>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, marginTop: 2 }}>"Umereno dosledni"</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Pill bg="var(--fire-soft)"><IcoFire size={14} />{streak}d</Pill>
                <Pill bg="var(--coin-soft)"><IcoCoin size={14} />{Math.floor(totalXp / 10).toLocaleString('sr-Latn-RS')}</Pill>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div className="tile" style={{ padding: '14px 16px', background: '#1F1A14', color: '#fff' }}>
              <div className="eyebrow" style={{ color: 'var(--coin)' }}>Ukupan XP</div>
              <div className="mono" style={{ fontSize: 30, fontWeight: 800, marginTop: 2 }}>{totalXp.toLocaleString('sr-Latn-RS')}</div>
              <XPBar pct={totalProgress.pct} tint="coin" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, opacity: 0.7, fontWeight: 700 }}>
                <span className="mono">Lv {totalProgress.level}</span>
                <span className="mono">{totalProgress.intoLevel} / {totalProgress.span}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Heksagon veština</h2>
            <div className="tile" style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
              <HexRadar values={radarValues} size={280} />
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h2 className="title" style={{ fontSize: 17 }}>Grane</h2>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)' }}>PO NIVOU</span>
            </div>
            <div className="tile" style={{ padding: '12px 14px' }}>
              {moduleStats.map(({ module: m, prog }, i, arr) => {
                const Icon = resolveIcon(m.icon);
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0', borderBottom: i === arr.length - 1 ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: m.color, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 13.5 }}>{m.name}</span>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 800 }}>Lv {prog.level}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ width: `${prog.pct}%`, height: '100%', background: m.color }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 700 }}>{STAT_LABELS[m.stat]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '0 20px 24px' }}>
            <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Statistika</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <MiniStat label="Obavljeno" val={completions.length.toLocaleString('sr-Latn-RS')} unit="zadataka" tint="var(--violet)" />
              <MiniStat label="Sati praćeni" val={hoursTracked} unit="≈ sati" tint="var(--fire)" />
              <MiniStat label="Trofeji" val={achievements.length} unit="otkljucani" tint="var(--coin)" />
              <MiniStat label="Dana aktivno" val={days.size} unit="sveukupno" tint="var(--mint)" />
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
    <div className="chunk" style={{ padding: '10px 12px', borderRadius: 14, boxShadow: '3px 3px 0 var(--line)' }}>
      <div className="eyebrow" style={{ fontSize: 9.5, color: tint }}>{label}</div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{val}</div>
      <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 700 }}>{unit}</div>
    </div>
  );
}
