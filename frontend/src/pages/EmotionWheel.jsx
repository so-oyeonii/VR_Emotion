import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './EmotionWheel.css';

const EMOTIONS = [
  { name: '분노', color: '#ff4444', emoji: '😠' },
  { name: '즐거움', color: '#ffeb3b', emoji: '😊' },
  { name: '슬픔', color: '#2196f3', emoji: '😢' },
  { name: '두려움', color: '#9c27b0', emoji: '😨' },
  { name: '혐오', color: '#4caf50', emoji: '🤢' },
  { name: '놀람', color: '#ff9800', emoji: '😲' },
  { name: '신뢰', color: '#00bcd4', emoji: '🤗' },
  { name: '기대', color: '#ff5722', emoji: '🤔' }
];

function EmotionWheel() {
  const navigate = useNavigate();
  const { 
    userData, 
    selectedEmotions, 
    addSelectedEmotion, 
    removeSelectedEmotion, 
    clearSelectedEmotions,
    initializeIntensities,
    setScreen 
  } = useStore();
  
  const [error, setError] = useState('');
  
  const handleEmotionClick = (emotion) => {
    setError('');
    
    // 이미 선택된 감정인지 확인
    const index = selectedEmotions.findIndex(e => e.emotion === emotion.name);
    
    if (index !== -1) {
      // 선택 해제
      removeSelectedEmotion(index);
    } else {
      // 새로 선택
      if (selectedEmotions.length >= 3) {
        setError('최대 3개까지만 선택할 수 있습니다');
        return;
      }
      addSelectedEmotion(emotion.name, emotion.color);
    }
  };
  
  const handleNext = () => {
    if (selectedEmotions.length === 0) {
      setError('최소 1개 이상의 감정을 선택해주세요');
      return;
    }
    
    initializeIntensities();
    setScreen(3);
    navigate('/intensity');
  };
  
  const isSelected = (emotionName) => {
    return selectedEmotions.some(e => e.emotion === emotionName);
  };
  
  // 사용자 인증 체크
  if (!userData.userId) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="emotion-wheel-container">
      <div className="emotion-panel">
        <h1 className="emotion-title">감정 선택</h1>
        <p className="emotion-subtitle">
          현재 느끼는 감정을 최대 3개까지 선택해주세요
        </p>
        
        <div className="selected-count">
          선택된 감정: {selectedEmotions.length} / 3
        </div>
        
        <div className="emotion-wheel">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.name}
              className={`emotion-item ${isSelected(emotion.name) ? 'selected' : ''}`}
              style={{
                '--emotion-color': emotion.color,
                borderColor: isSelected(emotion.name) ? emotion.color : 'rgba(255,255,255,0.3)'
              }}
              onClick={() => handleEmotionClick(emotion)}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-name">{emotion.name}</span>
            </button>
          ))}
        </div>
        
        <div className="selected-emotions">
          {selectedEmotions.map((emotion, index) => (
            <div 
              key={index} 
              className="selected-emotion-badge"
              style={{ backgroundColor: emotion.color }}
            >
              {emotion.emotion}
              <button
                className="remove-btn"
                onClick={() => removeSelectedEmotion(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="button-group">
          <button 
            onClick={clearSelectedEmotions}
            className="clear-button"
            disabled={selectedEmotions.length === 0}
          >
            초기화
          </button>
          <button 
            onClick={handleNext}
            className="next-button"
            disabled={selectedEmotions.length === 0}
          >
            다음 단계 →
          </button>
        </div>
        
        <div className="progress-indicator">
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default EmotionWheel;
