// Stats / Profile screen
const StatsScreen = () => (
  <div className="screen">
    <StatusBar/>
    <div className="screen-body">
      <div className="scroll">
        {/* Avatar header */}
        <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: '#FFD93D', border: '2.5px solid var(--line)', boxShadow: '4px 4px 0 var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg width="52" height="52" viewBox="0 0 60 60">
              <circle cx="30" cy="26" r="16" fill="#FFE1D0" stroke="#1F1A14" strokeWidth="2.5"/>
              <circle cx="24" cy="25" r="2" fill="#1F1A14"/>
              <circle cx="36" cy="25" r="2" fill="#1F1A14"/>
              <path d="M24 32 Q30 36 36 32" stroke="#1F1A14" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M16 18 Q20 10 30 10 Q40 10 44 18" fill="#5A3FE0" stroke="#1F1A14" strokeWidth="2.5"/>
            </svg>
            <div style={{ position: 'absolute', bottom: -6, right: -6, background: '#1F1A14', color: '#FFC83D', fontWeight: 900, fontSize: 11, padding: '3px 7px', borderRadius: 8, border: '2px solid var(--line)' }} className="mono">Lv 23</div>
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="title" style={{ fontSize: 22 }}>Milos Petrov</h1>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, marginTop: 2 }}>"The Moderately Consistent"</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <Pill bg="#FFE1D0"><IcoFire size={14}/>47d</Pill>
              <Pill bg="#FFF0C2"><IcoCoin size={14}/>2,340</Pill>
            </div>
          </div>
        </div>

        {/* Top stats */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="tile" style={{ padding: '14px 16px', background: '#1F1A14', color: '#fff' }}>
            <div className="eyebrow" style={{ color: '#FFC83D' }}>Total XP</div>
            <div className="mono" style={{ fontSize: 30, fontWeight: 800, marginTop: 2 }}>14,820</div>
            <XPBar pct={68} tint="coin"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, opacity: 0.7, fontWeight: 700 }}>
              <span className="mono">Lv 23</span>
              <span className="mono">680 / 1,000</span>
            </div>
          </div>
        </div>

        {/* Skill tree */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <h2 className="title" style={{ fontSize: 17 }}>Skill Tree</h2>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)' }}>SORTED BY LEVEL</span>
          </div>
          <div className="tile" style={{ padding: '12px 14px' }}>
            {[
              { n: 'Intellect', lvl: 14, pct: 85, c: '#7C5CFF', Icon: IcoEducation },
              { n: 'Career',    lvl: 13, pct: 44, c: '#8BD94C', Icon: IcoCareer },
              { n: 'Routines',  lvl: 12, pct: 62, c: '#FFC83D', Icon: IcoRoutines },
              { n: 'Finance',   lvl: 11, pct: 68, c: '#FFD93D', Icon: IcoFinance },
              { n: 'Tasks',     lvl: 10, pct: 40, c: '#3DC9FF', Icon: IcoNotes },
              { n: 'Reading',   lvl: 9,  pct: 12, c: '#E8C794', Icon: IcoReading },
              { n: 'Fitness',   lvl: 8,  pct: 30, c: '#FF7A3D', Icon: IcoWorkout },
            ].map((s, i, a) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0', borderBottom: i === a.length-1 ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: s.c, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.Icon size={20}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5 }}>{s.n}</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 800 }}>Lv {s.lvl}</span>
                  </div>
                  <div style={{ height: 6, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: s.c }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime totals */}
        <div style={{ padding: '0 20px 20px' }}>
          <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Lifetime</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniStat label="Quests done" val="1,284" unit="tasks" tint="#7C5CFF"/>
            <MiniStat label="Hours tracked" val="482" unit="hours" tint="#FF7A3D"/>
            <MiniStat label="Bosses slain" val="14" unit="weekly" tint="#FF5CA8"/>
            <MiniStat label="Trophies" val="27" unit="of 84" tint="#FFC83D"/>
          </div>
        </div>
      </div>
      <TabBar active="me"/>
    </div>
  </div>
);

Object.assign(window, { StatsScreen });
