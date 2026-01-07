import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import useEmotionWheel from '../hooks/useEmotionWheel';
import './EmotionWheel.css';

const EMOTIONS = [
  { name: '기쁨', color: '#FFD700', emoji: '😊' },
  { name: '슬픔', color: '#4169E1', emoji: '😢' },
  { name: '분노', color: '#DC143C', emoji: '😠' },
  { name: '두려움', color: '#8B008B', emoji: '😨' },
  { name: '놀람', color: '#FF69B4', emoji: '😲' },
  { name: '혐오', color: '#228B22', emoji: '🤢' },
  { name: '평온', color: '#87CEEB', emoji: '😌' },
  { name: '흥분', color: '#FF4500', emoji: '🤩' }
];

function EmotionWheel() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
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
  const { spinning, selectedEmotion, spinCount, spin } = useEmotionWheel(
    canvasRef,
    selectedEmotions.map(e => e.emotion) // 제외할 감정 목록
  );
  
  // 룰렛에서 감정이 선택되면 자동으로 추가 (최대 5개, 중복 방지)
  useEffect(() => {
    if (selectedEmotion && spinCount > 0) {
      console.log('룰렛 선택:', selectedEmotion);
      console.log('현재 선택된 감정:', selectedEmotions);
      
      const isAlreadySelected = selectedEmotions.some(e => e.emotion === selectedEmotion.name);
      console.log('중복 여부:', isAlreadySelected);
      
      if (!isAlreadySelected && selectedEmotions.length < 5) {
        console.log('감정 추가:', selectedEmotion.name, selectedEmotion.color);
        addSelectedEmotion(selectedEmotion.name, selectedEmotion.color);
        setError('');
      } else if (selectedEmotions.length >= 5) {
        setError('최대 5개까지만 선택 가능합니다');
      }
    }
  }, [selectedEmotion, spinCount, selectedEmotions, addSelectedEmotion]);
  
  const handleEmotionClick = (emotion) => {
    setError('');
    
    // 이미 선택된 감정인지 확인
    const index = selectedEmotions.findIndex(e => e.emotion === emotion.name);
    
    if (index !== -1) {
      // 선택 해제 (직접 선택한 것만 해제 가능, 인덱스 0~2)
      if (index < 3) {
        removeSelectedEmotion(index);
      }
    } else {
      // 새로 선택 (직접은 3개까지)
      if (selectedEmotions.length >= 3) {
        setError('직접 선택은 3개만 가능합니다. 룰렛을 돌려주세요!');
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
    
    if (selectedEmotions.length < 5) {
      setError(`총 5개의 감정을 선택해주세요 (현재 ${selectedEmotions.length}/5)`);
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
          먼저 3개의 감정을 선택하고, 룰렛을 돌려 추가 2개를 선택하세요 (총 5개)
        </p>
        
        <div className="selected-count">
          직접 선택: {selectedEmotions.length} / 3
        </div>
        
        {/* 감정 버튼 그리드 - 위로 이동 */}
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
              disabled={selectedEmotions.length >= 3 && !isSelected(emotion.name)}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-name">{emotion.name}</span>
            </button>
          ))}
        </div>
        
        {/* 감정 룰렛 - 아래로 이동 */}
        <div className="wheel-section">
          <h3 className="wheel-section-title">룰렛으로 추가 감정 선택</h3>
          <canvas ref={canvasRef} className="emotion-canvas" />
          <button 
            onClick={spin} 
            disabled={spinning || selectedEmotions.length < 3 || spinCount >= 2}
            className={`spin-button ${spinning ? 'spinning' : ''}`}
          >
            {spinning 
              ? '회전 중...' 
              : selectedEmotions.length < 3 
                ? '먼저 위에서 3개 선택하세요' 
                : spinCount >= 2 
                  ? '선택 완료 (5개)' 
                  : `룰렟 돌리기 (${spinCount}/2) 🎰`
            }
          </button>
          
          {selectedEmotion && !spinning && spinCount > 0 && (
            <div className="selected-emotion-display">
              <div 
                className="emotion-result"
                style={{ backgroundColor: selectedEmotion.color }}
              >
                <span className="result-emoji">{selectedEmotion.emoji}</span>
                <span className="result-name">{selectedEmotion.name}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="selected-emotions">
          {selectedEmotions.length > 0 && (
            <h3 className="selected-emotions-title">선택된 감정 ({selectedEmotions.length}/5):</h3>
          )}
          <div className="selected-list">
            {selectedEmotions.map((emotion, index) => {
              const emotionData = EMOTIONS.find(e => e.name === emotion.emotion);
              return (
                <div 
                  key={index} 
                  className="selected-emotion-badge"
                  style={{ backgroundColor: emotion.color }}
                >
                  <span>{emotionData?.emoji || ''} {emotion.emotion}</span>
                  <button
                    className="remove-btn"
                    onClick={() => {
                      if (index < 3) {
                        removeSelectedEmotion(index);
                      }
                    }}
                    disabled={index >= 3}
                    title={index >= 3 ? '룰렛으로 선택된 감정은 삭제할 수 없습니다' : '제거'}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
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
            disabled={selectedEmotions.length < 5}
          >
            {selectedEmotions.length < 5 
              ? `다음 단계 (${selectedEmotions.length}/5 선택됨)` 
              : '다음 단계 →'
            }
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
