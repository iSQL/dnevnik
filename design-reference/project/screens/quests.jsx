// Quests page — full list of active quests grouped by type
const QuestsScreen = () => (
  <div className="screen">
    <StatusBar/>
    <div className="screen-body">
      <div className="scroll">
        {/* Header */}
        <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow">Quest Log</div>
            <h1 className="title" style={{ marginTop: 2 }}>Quests</h1>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#7C5CFF', border: '2.5px solid var(--line)', boxShadow: '3px 3px 0 var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoPlus size={20} stroke="#fff"/>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <QSum n="2/5" label="Daily" tint="#FFC83D"/>
          <QSum n="1/3" label="Weekly" tint="#FF7A3D"/>
          <QSum n="0/1" label="Epic" tint="#7C5CFF"/>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6 }}>
          {['Active 8', 'Done 2', 'All'].map((t, i) => (
            <div key={t} style={{ padding: '7px 14px', border: '2.5px solid var(--line)', borderRadius: 100,
              background: i === 0 ? '#1F1A14' : '#fff', color: i === 0 ? '#fff' : 'var(--ink)',
              fontWeight: 800, fontSize: 12,
              boxShadow: i === 0 ? '2px 2px 0 var(--line)' : 'none' }}>{t}</div>
          ))}
        </div>

        {/* DAILY */}
        <QGroup title="Daily" sub="Resets at midnight" icon={<IcoFire size={18}/>} tint="#FFC83D">
          <QItem done tint="#FF7A3D" Icon={IcoWorkout} label="20 min workout" branch="Fitness" xp="+50" timer="done"/>
          <QItem done tint="#7C5CFF" Icon={IcoEducation} label="Finish Spanish lesson" branch="Intellect" xp="+40" timer="done"/>
          <QItem tint="#FFC83D" Icon={IcoRoutines} label="Drink 8 glasses of water" branch="Routines" xp="+20" prog={5} total={8}/>
          <QItem tint="#5CE0B8" Icon={IcoCreativity} label="Sketch something, anything" branch="Craft" xp="+60" timer="9h left"/>
          <QItem last tint="#FF5CA8" Icon={IcoNutrition} label="Eat one (1) vegetable" branch="Nutrition" xp="+30" timer="9h left"/>
        </QGroup>

        {/* WEEKLY */}
        <QGroup title="Weekly" sub="3 days remaining" icon={<IcoStar size={16} fill="#FF7A3D"/>} tint="#FF7A3D">
          <QItem done tint="#8BD94C" Icon={IcoCareer} label="Ship the thing at work" branch="Hustle" xp="+150" timer="done"/>
          <QItem tint="#B58CFF" Icon={IcoMeditation} label="Meditate 5 times" branch="Wisdom" xp="+120" prog={2} total={5}/>
          <QItem last tint="#E8C794" Icon={IcoReading} label="Finish chapter 4" branch="Lore" xp="+100" prog={6} total={24} sub="pages"/>
        </QGroup>

        {/* EPIC */}
        <QGroup title="Epic" sub="Long-running. Bring snacks." icon={<IcoBolt size={16} fill="#7C5CFF"/>} tint="#7C5CFF" last>
          <QItem last tint="#7C5CFF" Icon={IcoEducation} label="Finish A2 Spanish course" branch="Intellect" xp="+800" prog={42} total={60} sub="lessons" epic/>
        </QGroup>
      </div>
      <TabBar active="quests"/>
    </div>
  </div>
);

const QSum = ({ n, label, tint }) => (
  <div className="chunk" style={{ padding: '10px 8px', textAlign: 'center', borderRadius: 14, boxShadow: '3px 3px 0 var(--line)' }}>
    <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: tint }}>{n}</div>
    <div className="eyebrow" style={{ fontSize: 10, marginTop: 1 }}>{label}</div>
  </div>
);

const QGroup = ({ title, sub, icon, tint, children, last }) => (
  <div style={{ padding: `0 20px ${last ? 20 : 14}px` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, background: tint, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h2 className="title" style={{ fontSize: 16 }}>{title}</h2>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' }}>{sub}</span>
    </div>
    <div className="tile" style={{ padding: '10px 12px' }}>
      {children}
    </div>
  </div>
);

const QItem = ({ done, tint, Icon, label, branch, xp, timer, prog, total, sub, last, epic }) => {
  const pct = prog && total ? (prog / total) * 100 : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 2px', borderBottom: last ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
      <Check done={done} tint={tint}/>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: tint, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 13.5, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
          {epic && <span className="mono" style={{ fontSize: 9, fontWeight: 900, background: '#7C5CFF', color: '#fff', padding: '1px 5px', borderRadius: 4, letterSpacing: 0.5 }}>EPIC</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>{branch}</span>
          {(pct !== null) && (
            <>
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>·</span>
              <span className="mono" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-3)' }}>{prog}/{total}{sub ? ` ${sub}` : ''}</span>
            </>
          )}
          {timer && !pct && (
            <>
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>·</span>
              <span className="mono" style={{ fontSize: 10.5, fontWeight: 800, color: timer === 'done' ? 'var(--ink-3)' : 'var(--fire-deep)' }}>{timer}</span>
            </>
          )}
        </div>
        {pct !== null && (
          <div style={{ height: 5, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 100, overflow: 'hidden', marginTop: 5 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: tint }}/>
          </div>
        )}
      </div>
      <div className="mono" style={{ fontWeight: 800, fontSize: 12.5, color: done ? 'var(--ink-3)' : 'var(--green-deep)', flexShrink: 0 }}>{xp}</div>
    </div>
  );
};

Object.assign(window, { QuestsScreen });
