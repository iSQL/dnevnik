// Shared UI primitives for Dnevnik screens

const StatusBar = ({ dark = false }) => (
  <div className="statusbar" style={{ color: dark ? '#fff' : 'var(--ink)' }}>
    <span className="mono">9:41</span>
    <div className="statusbar-right">
      <svg width="16" height="11" viewBox="0 0 16 11" fill={dark ? '#fff' : '#1F1A14'}><path d="M1 7 a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1z M6 5 a1 1 0 011-1h1a1 1 0 011 1v5a1 1 0 01-1 1H7a1 1 0 01-1-1z M11 2 a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1h-1a1 1 0 01-1-1z"/></svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke={dark ? '#fff' : '#1F1A14'} strokeWidth="1.2"><path d="M7.5 2 C5 2, 3 3, 1.5 4.5 M7.5 5 C6 5, 4.5 5.8, 3.5 6.8 M7.5 8 L7.5 9"/></svg>
      <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" fill="none" stroke={dark ? '#fff' : '#1F1A14'}/><rect x="2" y="2" width="16" height="7" rx="1" fill={dark ? '#fff' : '#1F1A14'}/><rect x="22.5" y="3.5" width="1.5" height="4" rx="0.5" fill={dark ? '#fff' : '#1F1A14'}/></svg>
    </div>
  </div>
);

const TabBar = ({ active = 'home' }) => (
  <div className="tabbar">
    <div className={`tab ${active==='home'?'active':''}`}><TabHome active={active==='home'}/><span>Home</span><div className="tab-dot"/></div>
    <div className={`tab ${active==='quests'?'active':''}`}><TabQuests active={active==='quests'}/><span>Quests</span><div className="tab-dot"/></div>
    <div className={`tab ${active==='stats'?'active':''}`}><TabStats active={active==='stats'}/><span>Stats</span><div className="tab-dot"/></div>
    <div className={`tab ${active==='ach'?'active':''}`}><TabAch active={active==='ach'}/><span>Trophies</span><div className="tab-dot"/></div>
    <div className={`tab ${active==='me'?'active':''}`}><TabMe active={active==='me'}/><span>Me</span><div className="tab-dot"/></div>
  </div>
);

const Pill = ({ children, bg = '#fff', color = 'var(--ink)', style = {} }) => (
  <span className="pill" style={{ background: bg, color, ...style }}>{children}</span>
);

// Chunky progress/XP bar
const XPBar = ({ pct = 50, tint = 'green' }) => {
  const fill = {
    green: 'linear-gradient(180deg,#4BE893,#2AD17A 55%,#1FA960)',
    violet: 'linear-gradient(180deg,#A890FF,#7C5CFF 55%,#5A3FE0)',
    fire: 'linear-gradient(180deg,#FFB07A,#FF7A3D 55%,#E55A1F)',
    coin: 'linear-gradient(180deg,#FFE07A,#FFC83D 55%,#E0A820)',
    pink: 'linear-gradient(180deg,#FF92C8,#FF5CA8 55%,#E0408C)',
    sky:  'linear-gradient(180deg,#8EE0FF,#3DC9FF 55%,#1AA5E0)',
    leaf: 'linear-gradient(180deg,#B5E88A,#8BD94C 55%,#6BB930)',
    mint: 'linear-gradient(180deg,#8FEED0,#5CE0B8 55%,#3AC895)',
  }[tint] || 'linear-gradient(180deg,#4BE893,#2AD17A)';
  return (
    <div className="xpbar">
      <div className="xpbar-fill" style={{ width: `${pct}%`, background: fill, borderRight: pct>5 && pct<100 ? '2px solid var(--line)' : 'none' }}/>
    </div>
  );
};

// Chunky check button with done state
const Check = ({ done = false, tint = '#2AD17A', size = 28 }) => (
  <div className="check" style={{ width: size, height: size, background: done ? tint : '#fff' }}>
    {done && <IcoCheck size={size*0.62}/>}
  </div>
);

Object.assign(window, { StatusBar, TabBar, Pill, XPBar, Check });
