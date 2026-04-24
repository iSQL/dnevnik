// Category Detail — Fitness page
const FitnessScreen = () => (
  <div className="screen">
    <StatusBar dark/>
    <div className="screen-body">
      <div className="scroll">
        {/* Orange header band */}
        <div style={{ background: '#FF7A3D', padding: '8px 20px 24px', borderBottom: '2.5px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(#1F1A14 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' }}/>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
              <IcoChev dir="left" size={18}/>
            </div>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Back</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, position: 'relative' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#fff', border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 0 var(--line)' }}>
              <IcoWorkout size={46}/>
            </div>
            <div style={{ color: '#fff' }}>
              <div className="eyebrow" style={{ color: '#FFE1D0' }}>Fitness Branch</div>
              <h1 className="title" style={{ color: '#fff', marginTop: 2 }}>Level 8</h1>
              <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 700, marginTop: 2 }}>The Moderately Swole</div>
            </div>
          </div>
          <div style={{ marginTop: 14, background: '#1F1A14', padding: '10px 12px', borderRadius: 12, border: '2.5px solid var(--line)', boxShadow: '3px 3px 0 rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              <span className="mono">1,240 XP</span>
              <span className="mono" style={{ opacity: 0.7 }}>760 to Lv 9</span>
            </div>
            <XPBar pct={62} tint="fire"/>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '16px 20px 8px' }}>
          <MiniStat label="Streak" val="12" unit="days" tint="#FF7A3D"/>
          <MiniStat label="This week" val="4" unit="workouts" tint="#7C5CFF"/>
          <MiniStat label="Best" val="23" unit="day run" tint="#FFC83D"/>
        </div>

        {/* Today's tasks */}
        <div style={{ padding: '12px 20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 className="title" style={{ fontSize: 17 }}>Today</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: 'var(--ink-3)' }}>
              <IcoPlus size={14}/> Add
            </div>
          </div>
          <div className="tile" style={{ padding: '12px 14px' }}>
            <WorkoutRow done Icon={IcoWorkout} label="Morning pushups" sub="3 sets × 12 · done" xp="+30"/>
            <WorkoutRow done Icon={IcoWorkout} label="20 min run" sub="2.4 km · 11:32 pace" xp="+50"/>
            <WorkoutRow Icon={IcoWorkout} label="Evening stretch" sub="15 min · pending" xp="+20"/>
            <WorkoutRow Icon={IcoWorkout} label="Plank challenge" sub="2 min hold, if you dare" xp="+40" last/>
          </div>
        </div>

        {/* Heatmap */}
        <div style={{ padding: '14px 20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <h2 className="title" style={{ fontSize: 17 }}>Consistency</h2>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)' }}>LAST 12 WEEKS</span>
          </div>
          <div className="tile" style={{ padding: 14 }}>
            <Heatmap tint="#FF7A3D"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>
              <span>Less</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0.15, 0.35, 0.6, 0.85, 1].map((o,i) => <div key={i} style={{ width: 11, height: 11, background: `rgba(255,122,61,${o})`, border: '1.2px solid var(--line)', borderRadius: 3 }}/>)}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Achievements preview */}
        <div style={{ padding: '14px 20px 20px' }}>
          <h2 className="title" style={{ fontSize: 17, marginBottom: 8 }}>Branch Trophies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <TrophyMini label="First rep" earned tint="#FFC83D"/>
            <TrophyMini label="7-day run" earned tint="#FF7A3D"/>
            <TrophyMini label="Marathon" earned tint="#5CE0B8"/>
            <TrophyMini label="???" tint="#B58CFF"/>
          </div>
        </div>
      </div>
      <TabBar active="home"/>
    </div>
  </div>
);

const MiniStat = ({ label, val, unit, tint }) => (
  <div className="chunk" style={{ padding: '10px 8px 10px', textAlign: 'center', borderRadius: 14, boxShadow: '3px 3px 0 var(--line)' }}>
    <div className="eyebrow" style={{ fontSize: 9.5, color: tint }}>{label}</div>
    <div className="mono" style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{val}</div>
    <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 700 }}>{unit}</div>
  </div>
);

const WorkoutRow = ({ done, Icon, label, sub, xp, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 2px', borderBottom: last ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
    <Check done={done} tint="#FF7A3D"/>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 800, fontSize: 13.5, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>{sub}</div>
    </div>
    <div className="mono" style={{ fontWeight: 800, fontSize: 12.5, color: done ? 'var(--ink-3)' : '#E55A1F' }}>{xp}</div>
  </div>
);

const Heatmap = ({ tint }) => {
  // 12 weeks × 7 days
  const weeks = 12;
  const seed = (w, d) => ((w * 7 + d) * 9301 + 49297) % 233280 / 233280;
  return (
    <div style={{ display: 'flex', gap: 3, justifyContent: 'space-between' }}>
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Array.from({ length: 7 }).map((_, d) => {
            const v = seed(w, d);
            const op = w < 2 ? 0.1 : v < 0.3 ? 0.1 : v < 0.55 ? 0.4 : v < 0.8 ? 0.7 : 1;
            return <div key={d} style={{ width: 17, height: 17, background: op < 0.2 ? '#fff' : tint, opacity: op < 0.2 ? 1 : op, border: '1.2px solid var(--line)', borderRadius: 4 }}/>;
          })}
        </div>
      ))}
    </div>
  );
};

const TrophyMini = ({ label, earned, tint }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ width: '100%', aspectRatio: '1', background: earned ? tint : '#ECE6DB', border: '2.5px solid var(--line)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2.5px 2.5px 0 var(--line)', opacity: earned ? 1 : 0.5 }}>
      <IcoStar size={28} fill={earned ? '#FFD93D' : '#ccc'}/>
    </div>
    <div style={{ fontSize: 10, fontWeight: 800, marginTop: 5, color: earned ? 'var(--ink)' : 'var(--ink-3)' }}>{label}</div>
  </div>
);

Object.assign(window, { FitnessScreen });
