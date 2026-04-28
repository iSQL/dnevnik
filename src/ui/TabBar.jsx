import { NavLink } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/db.js';
import { TabHome, TabQuests, TabStats, TabAch, TabMe } from './icons.jsx';

const TABS = [
  { to: '/',            key: 'home',    label: 'Početna',  Icon: TabHome   },
  { to: '/quests',      key: 'quests',  label: 'Zadaci',   Icon: TabQuests },
  { to: '/stats',       key: 'stats',   label: 'Veštine',  Icon: TabStats  },
  { to: '/achievements',key: 'ach',     label: 'Trofeji',  Icon: TabAch    },
  { to: '/recap',       key: 'me',      label: 'Osvrt',    Icon: TabMe     },
];

export default function TabBar() {
  const pendingCount = useLiveQuery(() => db.settings.get('pendingCount'), [])?.value ?? 0;

  return (
    <nav className="tabbar">
      {TABS.map(({ to, key, label, Icon }) => {
        const showBadge = key === 'me' && pendingCount > 0;
        return (
          <NavLink key={key} to={to} end={to === '/'} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{label}</span>
                <div className="tab-dot" />
                {showBadge && (
                  <span className="tab-badge" aria-label={`${pendingCount} novih`}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
