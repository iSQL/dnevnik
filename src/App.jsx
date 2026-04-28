import { Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './core/db.js';
import Home from './screens/Home.jsx';
import Quests from './screens/Quests.jsx';
import CategoryDetail from './screens/CategoryDetail.jsx';
import AddQuest from './screens/AddQuest.jsx';
import Stats from './screens/Stats.jsx';
import Achievements from './screens/Achievements.jsx';
import Recap from './screens/Recap.jsx';
import Toast from './ui/Toast.jsx';
import Onboarding from './ui/Onboarding.jsx';

export default function App() {
  // useLiveQuery returns its third arg while resolving, then the query result.
  // We need to distinguish "still loading" from "row doesn't exist", so we
  // normalise missing rows to null and use 'loading' as the in-flight sentinel.
  const choiceRow = useLiveQuery(
    () => db.settings.get('onboardingChoice').then((r) => r ?? null),
    [],
    'loading',
  );
  const needsOnboarding = choiceRow === null;

  return (
    <div className="app-frame">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="/friends" element={<Navigate to="/recap" replace />} />
        <Route path="/add" element={<AddQuest />} />
        <Route path="/c/:moduleId" element={<CategoryDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
      {needsOnboarding && <Onboarding />}
    </div>
  );
}
