import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../core/db.js';
import { STAT_LABELS, STATS } from '../core/stats.js';
import { moduleRegistry } from '../core/module-registry.js';
import { resolveIcon, IcoStar, IcoBolt, IcoFire, IcoChev } from '../ui/icons.jsx';
import TabBar from '../ui/TabBar.jsx';
import FriendsCards from '../ui/FriendsCards.jsx';

const DAY_MS = 86_400_000;
const WEEKDAY_LABEL = ['ned', 'pon', 'uto', 'sre', 'čet', 'pet', 'sub'];

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function Recap() {
  const completions = useLiveQuery(() => db.completions.toArray(), []) ?? [];
  const achievements = useLiveQuery(() => db.achievements.toArray(), []) ?? [];

  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const twoWeeksAgo = now - 14 * DAY_MS;

  const thisWeek = completions.filter((c) => c.timestamp >= weekAgo);
  const lastWeek = completions.filter((c) => c.timestamp >= twoWeeksAgo && c.timestamp < weekAgo);

  const xpThis = thisWeek.reduce((s, c) => s + c.amount, 0);
  const xpLast = lastWeek.reduce((s, c) => s + c.amount, 0);
  const deltaPct = xpLast === 0 ? (xpThis > 0 ? 100 : 0) : Math.round(((xpThis - xpLast) / xpLast) * 100);

  // XP by stat for this week
  const xpByStat = {};
  for (const s of STATS) xpByStat[s] = 0;
  for (const c of thisWeek) xpByStat[c.stat] = (xpByStat[c.stat] ?? 0) + c.amount;
  const maxStatXp = Math.max(1, ...Object.values(xpByStat));
  const statRows = STATS
    .map((s) => ({ stat: s, xp: xpByStat[s], pct: (xpByStat[s] / maxStatXp) * 100 }))
    .filter((r) => r.xp > 0)
    .sort((a, b) => b.xp - a.xp);

  // Per-module modules for icon lookup
  const modulesByStat = {};
  for (const m of moduleRegistry.list()) {
    if (!modulesByStat[m.stat]) modulesByStat[m.stat] = m;
  }

  // Busiest day
  const dayCounts = {};
  for (const c of thisWeek) {
    const k = dayKey(c.timestamp);
    dayCounts[k] = (dayCounts[k] ?? 0) + 1;
  }
  let busyDay = null, busyCount = 0;
  for (const [k, n] of Object.entries(dayCounts)) {
    if (n > busyCount) { busyDay = k; busyCount = n; }
  }
  let busyDayLabel = null;
  if (busyDay) {
    const [y, m, d] = busyDay.split('-').map(Number);
    busyDayLabel = WEEKDAY_LABEL[new Date(y, m, d).getDay()];
  }

  // Streak
  const days = new Set(completions.map((c) => dayKey(c.timestamp)));
  let streak = 0;
  const cur = new Date();
  while (days.has(dayKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }

  const latestAch = achievements.slice().sort((a, b) => b.unlockedAt - a.unlockedAt)[0];

  const weekStart = new Date(now - 6 * DAY_MS);
  const weekLabel = `${weekStart.getDate()}. — ${new Date(now).getDate()}.`;
  const weekNum = Math.ceil(((new Date(now) - new Date(new Date(now).getFullYear(), 0, 1)) / DAY_MS + new Date(new Date(now).getFullYear(), 0, 1).getDay() + 1) / 7);

  return (
    <div className="screen">
      <div className="screen-body">
        <div style={{ background: 'linear-gradient(180deg,#7C5CFF 0%,#5A3FE0 100%)', padding: '8px 20px 30px', color: '#fff', borderBottom: '2.5px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#FFD93D 2px, transparent 2px)', backgroundSize: '22px 22px' }} />
          <div style={{ position: 'absolute', top: 40, right: 30, color: '#FFD93D' }}><IcoStar size={22} /></div>
          <div style={{ position: 'absolute', top: 80, left: 24, color: '#FF7A3D' }}><IcoStar size={14} /></div>
          <div style={{ position: 'absolute', top: 20, left: 60, color: '#5CE0B8' }}><IcoBolt size={18} /></div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
              <IcoChev dir="left" size={18} />
            </Link>
            <span style={{ fontWeight: 800, fontSize: 13 }}>Nazad na početnu</span>
          </div>
          <div style={{ position: 'relative', marginTop: 22 }}>
            <div className="eyebrow" style={{ color: '#FFD93D' }}>Nedelja {weekNum} · {weekLabel}</div>
            <h1 className="title" style={{ color: '#fff', fontSize: 28, marginTop: 4 }}>
              {xpThis === 0 ? 'Mirna nedelja.' : deltaPct >= 0 ? 'Solidna nedelja,\nsve u svemu.' : 'Ima mesta\nza bolje.'}
            </h1>
          </div>
        </div>

        <div className="scroll" style={{ marginTop: -20 }}>
          <div style={{ padding: '0 20px 14px' }}>
            <div className="tile" style={{ padding: '14px 16px', background: 'var(--sun)' }}>
              <div className="eyebrow">XP osvojeno</div>
              <div className="mono" style={{ fontSize: 34, fontWeight: 800, marginTop: 2 }}>+{xpThis.toLocaleString('sr-Latn-RS')}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', marginTop: 2 }}>
                {xpLast === 0
                  ? 'Prva nedelja — sve što uradiš je rekord.'
                  : `${deltaPct >= 0 ? '↑' : '↓'} ${Math.abs(deltaPct)}% u odnosu na prošlu nedelju.`}
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <MiniStat label="Zadaci" val={thisWeek.length} unit="obavljeno" tint="var(--violet)" />
            <MiniStat label="Niz" val={streak} unit="dana" tint="var(--fire)" />
            <MiniStat label="Aktivni dani" val={Object.keys(dayCounts).length} unit="od 7" tint="var(--green)" />
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <h2 className="title" style={{ fontSize: 17, marginBottom: 10 }}>XP po granama</h2>
            <div className="tile" style={{ padding: '14px 14px 12px' }}>
              {statRows.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700, padding: '4px 0' }}>
                  Nema podataka ove nedelje.
                </div>
              ) : statRows.map((r, i) => {
                const m = modulesByStat[r.stat];
                const Icon = resolveIcon(m?.icon);
                const color = m?.color ?? 'var(--violet)';
                return (
                  <div key={r.stat} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i === statRows.length - 1 ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: color, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 13, width: 80 }}>{STAT_LABELS[r.stat]}</span>
                    <div style={{ flex: 1, height: 14, background: '#fff', border: '2px solid var(--line)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: color, borderRight: r.pct < 100 ? '2px solid var(--line)' : 'none' }} />
                    </div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 800, width: 48, textAlign: 'right' }}>+{r.xp}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Istaknuto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {latestAch && (
                <HL color="var(--pink)" Icon={IcoStar} title={`Novi trofej`} sub="Vidi trofejnu sobu za detalje." />
              )}
              {busyDayLabel && (
                <HL color="var(--mint)" Icon={IcoBolt} title={`Najaktivniji dan: ${busyDayLabel}.`} sub={`${busyCount} obavljenih zadataka. Bravo.`} />
              )}
              {streak >= 3 && (
                <HL color="var(--fire)" Icon={IcoFire} title={`Niz od ${streak} dana`} sub="Nastavi tako, ritam radi za tebe." />
              )}
              {!latestAch && !busyDayLabel && streak < 3 && (
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700, padding: '4px 0' }}>
                  Još uvek gradimo istoriju. Još malo pa ima šta da se istakne.
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '0 20px 18px' }}>
            <div className="tile" style={{ padding: '14px 14px', background: '#1F1A14', color: '#fff' }}>
              <div className="eyebrow" style={{ color: 'var(--coin)' }}>Naredna nedelja</div>
              <div style={{ fontWeight: 900, fontSize: 16, marginTop: 4 }}>Zadaj sebi izazov</div>
              <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 700, marginTop: 2 }}>
                Dodaj jedan epski zadatak i povećaj nedeljnu težinu.
              </div>
              <Link
                to="/add"
                style={{
                  display: 'inline-block',
                  marginTop: 10, background: 'var(--coin)', color: '#1F1A14',
                  border: '2.5px solid var(--line)', borderRadius: 12, padding: '10px 14px',
                  fontWeight: 900, fontSize: 13, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                }}
              >
                Prihvatam izazov →
              </Link>
            </div>
          </div>

          <div style={{ height: 2, background: 'var(--line)', margin: '6px 20px 18px', opacity: 0.15 }} />

          <div style={{ padding: '0 20px 8px' }}>
            <h2 className="title" style={{ fontSize: 20 }}>Prijatelji</h2>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, marginTop: 2, marginBottom: 14 }}>
              Profil, predlozi, izazovi i lista prijatelja.
            </div>
          </div>

          <FriendsCards />
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

function HL({ color, Icon, title, sub }) {
  return (
    <div className="chunk" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 11, borderRadius: 14, boxShadow: '3px 3px 0 var(--line)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 13.5 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}
