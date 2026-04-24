import { STATS, STAT_LABELS } from '../core/stats.js';

// Hex radar chart — 6 axes, one per character stat.
// values: { fitness: 0.6, intellect: 0.3, ... } in [0, 1].
export default function HexRadar({ values = {}, size = 220, max = 1, labels = true }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - (labels ? 28 : 4);

  const axis = (i) => {
    // Point "up" first, then clockwise
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / STATS.length;
    return { x: Math.cos(a), y: Math.sin(a) };
  };

  const ringPoints = (frac) =>
    STATS.map((_, i) => {
      const { x, y } = axis(i);
      return `${cx + x * radius * frac},${cy + y * radius * frac}`;
    }).join(' ');

  const valuePoints = STATS.map((s, i) => {
    const v = Math.max(0.02, Math.min(1, (values[s] ?? 0) / max));
    const { x, y } = axis(i);
    return `${cx + x * radius * v},${cy + y * radius * v}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background rings */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ringPoints(f)} fill="none" stroke="var(--ink)" strokeOpacity="0.15" strokeWidth="1.5" />
      ))}
      {/* Spokes */}
      {STATS.map((_, i) => {
        const { x, y } = axis(i);
        return <line key={i} x1={cx} y1={cy} x2={cx + x * radius} y2={cy + y * radius} stroke="var(--ink)" strokeOpacity="0.15" strokeWidth="1.5" />;
      })}
      {/* Value polygon */}
      <polygon points={valuePoints} fill="#7C5CFF" fillOpacity="0.35" stroke="#7C5CFF" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Value points */}
      {STATS.map((s, i) => {
        const v = Math.max(0.02, Math.min(1, (values[s] ?? 0) / max));
        const { x, y } = axis(i);
        return <circle key={s} cx={cx + x * radius * v} cy={cy + y * radius * v} r="3.5" fill="#7C5CFF" stroke="var(--line)" strokeWidth="1.5" />;
      })}
      {/* Labels */}
      {labels && STATS.map((s, i) => {
        const { x, y } = axis(i);
        const lx = cx + x * (radius + 18);
        const ly = cy + y * (radius + 18) + 4;
        return (
          <text
            key={s}
            x={lx}
            y={ly}
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill="var(--ink)"
            fontFamily="Nunito"
            style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
          >
            {STAT_LABELS[s]}
          </text>
        );
      })}
    </svg>
  );
}
