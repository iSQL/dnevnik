// Weekly Recap screen
const RecapScreen = () => (
  <div className="screen">
    <StatusBar dark/>
    <div className="screen-body">
      <div style={{ background: 'linear-gradient(180deg,#7C5CFF 0%,#5A3FE0 100%)', padding: '8px 20px 30px', color: '#fff', borderBottom: '2.5px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#FFD93D 2px, transparent 2px)', backgroundSize: '22px 22px' }}/>
        {/* Confetti-ish shapes */}
        <div style={{ position: 'absolute', top: 40, right: 30, color: '#FFD93D' }}><IcoStar size={22}/></div>
        <div style={{ position: 'absolute', top: 80, left: 24, color: '#FF7A3D' }}><IcoStar size={14}/></div>
        <div style={{ position: 'absolute', top: 20, left: 60, color: '#5CE0B8' }}><IcoBolt size={18}/></div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
            <IcoChev dir="left" size={18}/>
          </div>
          <span style={{ fontWeight: 800, fontSize: 13 }}>Back to home</span>
        </div>
        <div style={{ position: 'relative', marginTop: 22 }}>
          <div className="eyebrow" style={{ color: '#FFD93D' }}>Week 16 · Apr 14 — 20</div>
          <h1 className="title" style={{ color: '#fff', fontSize: 30, marginTop: 4 }}>A decent week,<br/>all things considered.</h1>
        </div>
      </div>

      <div className="scroll" style={{ marginTop: -20 }}>
        {/* Big hero stat */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="tile" style={{ padding: '14px 16px', background: '#FFD93D' }}>
            <div className="eyebrow">XP earned</div>
            <div className="mono" style={{ fontSize: 34, fontWeight: 800, marginTop: 2 }}>+1,240</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', marginTop: 2 }}>↑ 22% vs last week. Nice.</div>
          </div>
        </div>

        {/* Comparison row */}
        <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <MiniStat label="Quests" val="34" unit="completed" tint="#7C5CFF"/>
          <MiniStat label="Streak" val="+7" unit="days added" tint="#FF7A3D"/>
          <MiniStat label="Boss" val="✓" unit="defeated" tint="#2AD17A"/>
        </div>

        {/* XP by branch — bar chart */}
        <div style={{ padding: '0 20px 14px' }}>
          <h2 className="title" style={{ fontSize: 17, marginBottom: 10 }}>XP by Branch</h2>
          <div className="tile" style={{ padding: '14px 14px 12px' }}>
            {[
              { n: 'Intellect', xp: 340, pct: 100, c: '#7C5CFF', Icon: IcoEducation },
              { n: 'Fitness',   xp: 280, pct: 82,  c: '#FF7A3D', Icon: IcoWorkout },
              { n: 'Routines',  xp: 210, pct: 62,  c: '#FFC83D', Icon: IcoRoutines },
              { n: 'Wisdom',    xp: 170, pct: 50,  c: '#B58CFF', Icon: IcoMeditation },
              { n: 'Lore',      xp: 140, pct: 41,  c: '#E8C794', Icon: IcoReading },
              { n: 'Craft',     xp: 100, pct: 29,  c: '#5CE0B8', Icon: IcoCreativity },
            ].map((s,i,a) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i===a.length-1 ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: s.c, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.Icon size={16}/>
                </div>
                <span style={{ fontWeight: 800, fontSize: 13, width: 66 }}>{s.n}</span>
                <div style={{ flex: 1, height: 14, background: '#fff', border: '2px solid var(--line)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: s.c, borderRight: s.pct<100 ? '2px solid var(--line)' : 'none' }}/>
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 800, width: 42, textAlign: 'right' }}>+{s.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div style={{ padding: '0 20px 14px' }}>
          <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Highlights</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <HL color="#FF5CA8" Icon={IcoStar} title="Earned 'Streak 30'" sub="A whole month. Respect."/>
            <HL color="#FF7A3D" Icon={IcoFire} title="Couch Goblin defeated" sub="Weekly boss. 1,240 HP demolished."/>
            <HL color="#5CE0B8" Icon={IcoBolt} title="Busiest day: Wednesday" sub="9 quests completed. Show-off."/>
          </div>
        </div>

        {/* Next week */}
        <div style={{ padding: '0 20px 20px' }}>
          <div className="tile" style={{ padding: '14px 14px', background: '#1F1A14', color: '#fff' }}>
            <div className="eyebrow" style={{ color: '#FFC83D' }}>Next Week's Boss</div>
            <div style={{ fontWeight: 900, fontSize: 16, marginTop: 4 }}>The Procrastinatrix</div>
            <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 700, marginTop: 2 }}>1,800 HP · Beats you if you skip 3+ days</div>
            <button style={{ marginTop: 10, background: '#FFC83D', color: '#1F1A14', border: '2.5px solid var(--line)', borderRadius: 12, padding: '10px 14px', fontWeight: 900, fontSize: 13, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)', fontFamily: 'inherit' }}>Challenge accepted →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HL = ({ color, Icon, title, sub }) => (
  <div className="chunk" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 11, borderRadius: 14, boxShadow: '3px 3px 0 var(--line)' }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: color, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22}/>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 900, fontSize: 13.5 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>{sub}</div>
    </div>
  </div>
);

Object.assign(window, { RecapScreen });
