import { IcoCheck } from './icons.jsx';

export const Pill = ({ children, bg = '#fff', color = 'var(--ink)', style = {} }) => (
  <span className="pill" style={{ background: bg, color, ...style }}>{children}</span>
);

const FILLS = {
  green:  'linear-gradient(180deg,#4BE893,#2AD17A 55%,#1FA960)',
  violet: 'linear-gradient(180deg,#A890FF,#7C5CFF 55%,#5A3FE0)',
  fire:   'linear-gradient(180deg,#FFB07A,#FF7A3D 55%,#E55A1F)',
  coin:   'linear-gradient(180deg,#FFE07A,#FFC83D 55%,#E0A820)',
  pink:   'linear-gradient(180deg,#FF92C8,#FF5CA8 55%,#E0408C)',
  sky:    'linear-gradient(180deg,#8EE0FF,#3DC9FF 55%,#1AA5E0)',
  leaf:   'linear-gradient(180deg,#B5E88A,#8BD94C 55%,#6BB930)',
  mint:   'linear-gradient(180deg,#8FEED0,#5CE0B8 55%,#3AC895)',
};

export const XPBar = ({ pct = 50, tint = 'green' }) => {
  const fill = FILLS[tint] || FILLS.green;
  const capped = Math.max(0, Math.min(100, pct));
  return (
    <div className="xpbar">
      <div
        className="xpbar-fill"
        style={{
          width: `${capped}%`,
          background: fill,
          borderRight: capped > 5 && capped < 100 ? '2px solid var(--line)' : 'none',
        }}
      />
    </div>
  );
};

export const Check = ({ done = false, tint = '#2AD17A', size = 28, onClick, disabled }) => (
  <button
    type="button"
    className={`check ${done ? 'done' : ''}`}
    style={{ width: size, height: size, background: done ? tint : '#fff' }}
    onClick={onClick}
    disabled={disabled}
    aria-pressed={done}
  >
    {done && <IcoCheck size={size * 0.62} />}
  </button>
);

export const ChunkCard = ({ children, style = {}, ...rest }) => (
  <div className="tile" style={style} {...rest}>{children}</div>
);
