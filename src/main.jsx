import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

import { ensureSeeded } from './core/db.js';
import { moduleRegistry } from './core/module-registry.js';
import { startAchievementsWatcher } from './core/achievements.js';
import { startSync } from './core/sync.js';

async function boot() {
  await ensureSeeded(moduleRegistry.list());
  startAchievementsWatcher();
  startSync();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>,
  );
}

boot();
