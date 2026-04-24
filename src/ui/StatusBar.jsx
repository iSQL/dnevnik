export default function StatusBar({ dark = false }) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return (
    <div className="statusbar" style={{ color: dark ? '#fff' : 'var(--ink)' }}>
      <span className="mono">{hh}:{mm}</span>
      <div className="statusbar-right">
        <svg width="16" height="11" viewBox="0 0 16 11" fill={dark ? '#fff' : '#1F1A14'}>
          <path d="M1 7 a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1z M6 5 a1 1 0 011-1h1a1 1 0 011 1v5a1 1 0 01-1 1H7a1 1 0 01-1-1z M11 2 a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1h-1a1 1 0 01-1-1z"/>
        </svg>
        <svg width="25" height="11" viewBox="0 0 25 11">
          <rect x="0.5" y="0.5" width="21" height="10" rx="2.5" fill="none" stroke={dark ? '#fff' : '#1F1A14'}/>
          <rect x="2" y="2" width="16" height="7" rx="1" fill={dark ? '#fff' : '#1F1A14'}/>
          <rect x="22.5" y="3.5" width="1.5" height="4" rx="0.5" fill={dark ? '#fff' : '#1F1A14'}/>
        </svg>
      </div>
    </div>
  );
}
