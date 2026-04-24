// Home Dashboard — the hero screen.
// Hero XP card at top, daily quest strip, then the 12-category icon grid.

const CATS = [
  { key: 'routines',   name: 'Routines',   Icon: IcoRoutines,   color: '#FFC83D', soft: '#FFF0C2', lvl: 12, pct: 62 },
  { key: 'workout',    name: 'Fitness',    Icon: IcoWorkout,    color: '#FF7A3D', soft: '#FFE1D0', lvl: 8,  pct: 30 },
  { key: 'education',  name: 'Intellect',  Icon: IcoEducation,  color: '#7C5CFF', soft: '#E8E0FF', lvl: 14, pct: 85 },
  { key: 'notes',      name: 'Tasks',      Icon: IcoNotes,      color: '#3DC9FF', soft: '#D5F1FF', lvl: 10, pct: 40 },
  { key: 'nutrition',  name: 'Nutrition',  Icon: IcoNutrition,  color: '#FF5CA8', soft: '#FFD6E8', lvl: 6,  pct: 75 },
  { key: 'meditation', name: 'Wisdom',     Icon: IcoMeditation, color: '#B58CFF', soft: '#EADDFF', lvl: 5,  pct: 22 },
  { key: 'sleep',      name: 'Sleep',      Icon: IcoSleep,      color: '#5A3FE0', soft: '#DDD4FF', lvl: 7,  pct: 58 },
  { key: 'reading',    name: 'Lore',       Icon: IcoReading,    color: '#E8C794', soft: '#FFF1D9', lvl: 9,  pct: 12 },
  { key: 'social',     name: 'Charisma',   Icon: IcoSocial,     color: '#FF7B9C', soft: '#FFD8E1', lvl: 4,  pct: 50 },
  { key: 'finance',    name: 'Wealth',     Icon: IcoFinance,    color: '#FFD93D', soft: '#FFF3B8', lvl: 11, pct: 68 },
  { key: 'creativity', name: 'Craft',      Icon: IcoCreativity, color: '#5CE0B8', soft: '#D0F5E8', lvl: 3,  pct: 8 },
  { key: 'career',     name: 'Hustle',     Icon: IcoCareer,     color: '#8BD94C', soft: '#E0F5C5', lvl: 13, pct: 44 },
];

const HomeScreen = () => (
  <div className="screen">
    <StatusBar/>
    <div className="screen-body">
      <div className="scroll">
        {/* Header */}
        <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>Tuesday · Apr 23</div>
            <h1 className="title" style={{ marginTop: 2 }}>Hey, Milos.</h1>
          </div>
          <div className="chunk" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 100, boxShadow: '2px 2px 0 var(--line)' }}>
            <IcoFire size={18}/><span className="mono" style={{ fontWeight: 800 }}>47</span>
          </div>
        </div>

        {/* HERO XP CARD */}
        <div style={{ padding: '0 20px 16px' }}>
          <div className="tile" style={{ background: '#1F1A14', color: '#fff', padding: '18px 18px 16px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15,
              backgroundImage: 'radial-gradient(#FFC83D 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px' }}/>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="eyebrow" style={{ color: '#FFC83D' }}>Overall · Lv 23</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span className="mono" style={{ fontSize: 32, fontWeight: 800 }}>14,820</span>
                  <span style={{ fontSize: 13, opacity: 0.7, fontWeight: 700 }}>XP</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <IcoCoin size={20}/><span className="mono" style={{ fontSize: 17, fontWeight: 800 }}>2,340</span>
                </div>
                <div style={{ fontSize: 10.5, opacity: 0.6, fontWeight: 700, marginTop: 2, letterSpacing: 0.5 }}>COINS</div>
              </div>
            </div>
            <div style={{ marginTop: 14, position: 'relative' }}>
              <XPBar pct={68} tint="coin"/>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, opacity: 0.7, fontWeight: 700 }}>
                <span className="mono">Lv 23</span>
                <span className="mono">680 / 1,000 to Lv 24</span>
              </div>
            </div>
          </div>
        </div>

        {/* DAILY QUEST STRIP */}
        <div style={{ padding: '0 20px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 className="title" style={{ fontSize: 17 }}>Today's Quests</h2>
            <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)' }}>2 / 5</span>
          </div>
          <div className="tile" style={{ background: '#fff', padding: '14px 14px 12px' }}>
            <QuestRow done tint="#FF7A3D" Icon={IcoWorkout} label="20 min workout" xp="+50" />
            <QuestRow done tint="#7C5CFF" Icon={IcoEducation} label="Finish Spanish lesson" xp="+40" />
            <QuestRow tint="#FFC83D" Icon={IcoRoutines} label="Drink 8 glasses of water" xp="+20" prog="5/8"/>
            <QuestRow tint="#5CE0B8" Icon={IcoCreativity} label="Sketch something, anything" xp="+60"/>
            <QuestRow tint="#FF5CA8" Icon={IcoNutrition} label="Eat one (1) vegetable" xp="+30" last/>
          </div>
        </div>

        {/* WEEKLY BOSS BANNER */}
        <div style={{ padding: '0 20px 18px' }}>
          <div className="tile" style={{ background: '#FFE1D0', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FF7A3D', border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFD93D" stroke="#1F1A14" strokeWidth="2" strokeLinejoin="round">
                <path d="M4 8 L8 5 L12 7 L16 5 L20 8 V16 L16 19 L12 17 L8 19 L4 16 Z"/>
                <circle cx="9" cy="11" r="1.3" fill="#1F1A14"/>
                <circle cx="15" cy="11" r="1.3" fill="#1F1A14"/>
                <path d="M9 15 L12 14 L15 15" stroke="#1F1A14" fill="none"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ color: '#E55A1F' }}>Weekly Boss · 3d left</div>
              <div style={{ fontWeight: 900, fontSize: 15, marginTop: 1 }}>Couch Goblin</div>
              <div style={{ marginTop: 6 }}><XPBar pct={58} tint="fire"/></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 14, fontWeight: 800 }}>58%</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 800, marginTop: 1 }}>HP LEFT</div>
            </div>
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <h2 className="title" style={{ fontSize: 17 }}>Your Skills</h2>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>12 branches</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {CATS.map((c) => <CatTile key={c.key} {...c}/>)}
          </div>
        </div>
      </div>
      <TabBar active="home"/>
    </div>
  </div>
);

const QuestRow = ({ done, tint, Icon, label, xp, prog, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 2px', borderBottom: last ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
    <Check done={done} tint={tint}/>
    <div style={{ width: 30, height: 30, borderRadius: 9, background: tint, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18}/>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 800, fontSize: 13.5, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1 }}>{label}</div>
      {prog && <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>{prog}</div>}
    </div>
    <div className="mono" style={{ fontWeight: 800, fontSize: 12.5, color: done ? 'var(--ink-3)' : 'var(--green-deep)' }}>{xp} XP</div>
  </div>
);

const CatTile = ({ name, Icon, color, soft, lvl, pct }) => (
  <div className="tile" style={{ background: soft, padding: 11, height: 118, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: color, border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24}/>
      </div>
      <div style={{ background: '#1F1A14', color: '#fff', fontWeight: 900, fontSize: 10.5, padding: '2.5px 6px', borderRadius: 6 }} className="mono">Lv{lvl}</div>
    </div>
    <div style={{ fontWeight: 900, fontSize: 13.5, marginTop: 'auto', marginBottom: 5 }}>{name}</div>
    <div style={{ height: 6, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRight: pct>5&&pct<100 ? '1.5px solid var(--line)' : 'none' }}/>
    </div>
  </div>
);

Object.assign(window, { HomeScreen, CATS });
