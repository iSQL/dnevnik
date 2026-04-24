import { useEffect, useState } from 'react';
import { bus } from '../core/event-bus.js';
import { STAT_LABELS } from '../core/stats.js';
import { IcoStar, IcoCoin } from './icons.jsx';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    let nextId = 1;
    const push = (toast) => {
      const id = nextId++;
      setToasts((t) => [...t, { ...toast, id }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
    };
    const offLvl = bus.on('level-up', ({ stat, level }) => {
      push({ kind: 'level', icon: <IcoStar size={18}/>, text: `Nivo ${level} — ${STAT_LABELS[stat]}!` });
    });
    const offAch = bus.on('achievement-unlocked', (a) => {
      push({ kind: 'ach', icon: <IcoStar size={18}/>, text: `Trofej: ${a.name}` });
    });
    const offXp = bus.on('xp-gained', ({ amount }) => {
      push({ kind: 'xp', icon: <IcoCoin size={18}/>, text: `+${amount} XP` });
    });
    return () => { offLvl(); offAch(); offXp(); };
  }, []);

  if (toasts.length === 0) return null;
  return (
    <>
      {toasts.map((t, i) => (
        <div key={t.id} className="toast" style={{ bottom: 110 + i * 50 }}>
          {t.icon}
          <span>{t.text}</span>
        </div>
      ))}
    </>
  );
}
