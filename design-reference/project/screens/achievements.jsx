// Achievements gallery
const AchievementsScreen = () => {
  const trophies = [
    { n: 'First Step', d: 'Complete any quest', tint: '#FFC83D', earned: true, rarity: 'Common' },
    { n: 'Early Bird', d: 'Finish before 9am', tint: '#FFD93D', earned: true, rarity: 'Common' },
    { n: 'Streak 7', d: '7 days in a row', tint: '#FF7A3D', earned: true, rarity: 'Common' },
    { n: 'Streak 30', d: '30 days. Respect.', tint: '#FF5CA8', earned: true, rarity: 'Rare' },
    { n: 'Iron Mind', d: 'Finish 50 edu quests', tint: '#7C5CFF', earned: true, rarity: 'Rare' },
    { n: 'Couch → Sofa', d: 'First workout', tint: '#8BD94C', earned: true, rarity: 'Common' },
    { n: 'Zen Novice', d: '10 meditations', tint: '#B58CFF', earned: true, rarity: 'Common' },
    { n: 'Bibliophile', d: 'Read 500 pages', tint: '#E8C794', earned: true, rarity: 'Rare' },
    { n: 'Marathon', d: '100 km total', tint: '#5CE0B8', earned: false, rarity: 'Epic' },
    { n: 'Polyglot', d: 'Lv 10 Intellect', tint: '#3DC9FF', earned: false, rarity: 'Rare' },
    { n: 'Boss Slayer', d: 'Beat weekly ×10', tint: '#FF7A3D', earned: false, rarity: 'Epic' },
    { n: '???', d: 'Hidden trophy', tint: '#1F1A14', earned: false, rarity: 'Legendary' },
  ];

  return (
    <div className="screen">
      <StatusBar/>
      <div className="screen-body">
        <div className="scroll">
          <div style={{ padding: '12px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="title">Trophy Room</h1>
            <Pill bg="#FFF0C2"><IcoStar size={14}/>27/84</Pill>
          </div>
          <div style={{ padding: '0 20px 14px', fontSize: 13, color: 'var(--ink-3)', fontWeight: 700 }}>
            Shiny things for doing things. Some harder than others.
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto' }}>
            {['All 84', 'Earned 27', 'Common', 'Rare', 'Epic', 'Legendary'].map((t, i) => (
              <div key={t} style={{ padding: '6px 12px', border: '2px solid var(--line)', borderRadius: 100,
                background: i === 0 ? '#1F1A14' : '#fff', color: i === 0 ? '#fff' : 'var(--ink)',
                fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap',
                boxShadow: i === 0 ? '2px 2px 0 var(--line)' : 'none' }}>{t}</div>
            ))}
          </div>

          {/* Featured */}
          <div style={{ padding: '0 20px 14px' }}>
            <div className="tile" style={{ padding: '16px 14px', background: '#1F1A14', color: '#fff', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: '#FF5CA8', border: '2.5px solid #1F1A14', boxShadow: '3px 3px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcoStar size={42}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="eyebrow" style={{ color: '#FF92C8' }}>Latest · RARE</div>
                <div style={{ fontWeight: 900, fontSize: 16, marginTop: 2 }}>Streak 30</div>
                <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 700, marginTop: 2 }}>You did a thing for 30 days. A whole month. Wild.</div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {trophies.map((t, i) => <Trophy key={i} {...t}/>)}
            </div>
          </div>
        </div>
        <TabBar active="ach"/>
      </div>
    </div>
  );
};

const Trophy = ({ n, d, tint, earned, rarity }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      aspectRatio: '1', background: earned ? tint : '#ECE6DB',
      border: '2.5px solid var(--line)', borderRadius: 16,
      boxShadow: '3px 3px 0 var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: earned ? 1 : 0.55, position: 'relative', overflow: 'hidden'
    }}>
      {earned ? <IcoStar size={38} fill="#FFD93D"/> : (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8C8174" strokeWidth="2.5" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="10" rx="2"/>
          <path d="M8 11 V8 C8 5.5, 10 4, 12 4 C14 4, 16 5.5, 16 8 V11"/>
        </svg>
      )}
      {rarity === 'Legendary' && (
        <div style={{ position: 'absolute', top: 4, right: 4, background: '#FFC83D', border: '1.5px solid var(--line)', fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 5 }}>✦</div>
      )}
    </div>
    <div style={{ fontWeight: 900, fontSize: 12, marginTop: 6, color: earned ? 'var(--ink)' : 'var(--ink-3)' }}>{n}</div>
    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', marginTop: 1, lineHeight: 1.2 }}>{d}</div>
  </div>
);

Object.assign(window, { AchievementsScreen });
