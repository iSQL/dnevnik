import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

import { db, ensureCoreSeed, seedQuestsForChoice } from './core/db.js';
import { moduleRegistry } from './core/module-registry.js';
import { startAchievementsWatcher } from './core/achievements.js';
import { startSync } from './core/sync.js';

async function boot() {
  await ensureCoreSeed();
  const choice = (await db.settings.get('onboardingChoice'))?.value;
  if (choice) await seedQuestsForChoice(moduleRegistry.list(), choice);
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
