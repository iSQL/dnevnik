import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home.jsx';
import Quests from './screens/Quests.jsx';
import CategoryDetail from './screens/CategoryDetail.jsx';
import AddQuest from './screens/AddQuest.jsx';
import Stats from './screens/Stats.jsx';
import Achievements from './screens/Achievements.jsx';
import Recap from './screens/Recap.jsx';
import Toast from './ui/Toast.jsx';

export default function App() {
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
    </div>
  );
}
