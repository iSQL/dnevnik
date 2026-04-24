// Add / check-off task flow screen
const AddTaskScreen = () => (
  <div className="screen">
    <StatusBar/>
    <div className="screen-body">
      <div className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 var(--line)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A14" strokeWidth="3" strokeLinecap="round"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
          </div>
          <div style={{ fontWeight: 900, fontSize: 14 }}>New Quest</div>
          <div style={{ width: 34 }}/>
        </div>

        <div style={{ padding: '0 20px 14px' }}>
          <h1 className="title" style={{ fontSize: 24 }}>What will you<br/>conquer today?</h1>
        </div>

        {/* Task input */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="tile" style={{ padding: '14px 14px 12px', background: '#fff' }}>
            <div className="eyebrow" style={{ fontSize: 10 }}>Quest name</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6, paddingBottom: 10, borderBottom: '2px dashed rgba(31,26,20,0.15)' }}>
              Read 10 pages of Meditations<span style={{ opacity: 0.3, animation: 'blink 1s infinite' }}>|</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 8 }}>Marcus is waiting.</div>
          </div>
        </div>

        {/* Category pick */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Assign to branch</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <CatChip Icon={IcoReading}    color="#E8C794" label="Lore" selected/>
            <CatChip Icon={IcoEducation}  color="#7C5CFF" label="Intellect"/>
            <CatChip Icon={IcoMeditation} color="#B58CFF" label="Wisdom"/>
            <CatChip Icon={IcoCreativity} color="#5CE0B8" label="Craft"/>
          </div>
        </div>

        {/* Difficulty / XP */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Difficulty</div>
          <div className="tile" style={{ padding: '10px 12px', background: '#fff' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Diff label="Easy" xp="+20" tint="#8BD94C"/>
              <Diff label="Medium" xp="+40" tint="#FFC83D" selected/>
              <Diff label="Hard" xp="+70" tint="#FF7A3D"/>
              <Diff label="Epic" xp="+120" tint="#7C5CFF"/>
            </div>
          </div>
        </div>

        {/* Repeat */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Repeat</div>
          <div className="tile" style={{ padding: '4px 6px', background: '#fff', display: 'flex', gap: 4 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ flex: 1, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, borderRadius: 10,
                background: [0,1,2,4].includes(i) ? '#7C5CFF' : 'transparent',
                color: [0,1,2,4].includes(i) ? '#fff' : 'var(--ink-3)',
                border: '2px solid',
                borderColor: [0,1,2,4].includes(i) ? 'var(--line)' : 'transparent' }}>{d}</div>
            ))}
          </div>
        </div>

        {/* Reward preview */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="tile" style={{ background: '#FFF0C2', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFC83D', border: '2.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcoCoin size={26}/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ color: '#E0A820' }}>Reward on completion</div>
              <div style={{ fontWeight: 900, fontSize: 15, marginTop: 1 }}>+40 XP · +8 coins</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>Bonus if streak ≥ 7 days</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 20px 20px' }}>
          <button className="chunk-btn" style={{ width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IcoPlus size={16} stroke="#fff"/> Commence quest
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CatChip = ({ Icon, color, label, selected }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px 7px 8px',
    background: selected ? color : '#fff', border: '2.5px solid var(--line)',
    borderRadius: 100, fontWeight: 800, fontSize: 13,
    boxShadow: selected ? '3px 3px 0 var(--line)' : '2px 2px 0 var(--line)' }}>
    <div style={{ width: 22, height: 22, borderRadius: 7, background: selected ? '#fff' : color, border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={14}/>
    </div>
    {label}
  </div>
);

const Diff = ({ label, xp, tint, selected }) => (
  <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px',
    background: selected ? tint : 'transparent',
    border: selected ? '2.5px solid var(--line)' : '2px dashed rgba(31,26,20,0.2)',
    borderRadius: 10, boxShadow: selected ? '2px 2px 0 var(--line)' : 'none' }}>
    <div style={{ fontWeight: 900, fontSize: 12 }}>{label}</div>
    <div className="mono" style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, marginTop: 1 }}>{xp}</div>
  </div>
);

Object.assign(window, { AddTaskScreen });
