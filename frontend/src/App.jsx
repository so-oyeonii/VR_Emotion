import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserInfo from './pages/UserInfo';
import TetrisGame from './pages/TetrisGame';
import EmotionWheel from './pages/EmotionWheel';
import IntensitySlider from './pages/IntensitySlider';
import Completion from './pages/Completion';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserInfo />} />
        <Route path="/game" element={<TetrisGame />} />
        <Route path="/emotion" element={<EmotionWheel />} />
        <Route path="/intensity" element={<IntensitySlider />} />
        <Route path="/complete" element={<Completion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
