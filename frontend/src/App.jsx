import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserInfo from './pages/UserInfo';
import AAQ from './pages/AAQ';
import PANAS from './pages/PANAS';
import CyberballGame from './pages/CyberballGame';
import EmotionSelect from './pages/EmotionSelect';
import Completion from './pages/Completion';
import './App.css';

// Flow:
// Phase 1: / (UserInfo) → /aaq (AAQ-II) → /panas (PANAS)
// Phase 2: /game (Cyberball)
// Phase 3: /emotion (EmotionSelect + Intensity)
// Complete: /complete

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserInfo />} />
        <Route path="/aaq" element={<AAQ />} />
        <Route path="/panas" element={<PANAS />} />
        <Route path="/game" element={<CyberballGame />} />
        <Route path="/emotion" element={<EmotionSelect />} />
        <Route path="/complete" element={<Completion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
