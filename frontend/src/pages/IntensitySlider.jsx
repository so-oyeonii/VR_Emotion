import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { createEmotionsBatch } from '../services/api';
import './IntensitySlider.css';

function IntensitySlider() {
  const navigate = useNavigate();
  const { 
    userData, 
    emotionIntensities, 
    setIntensity, 
    setScreen 
  } = useStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSliderChange = (index, value) => {
    setIntensity(index, parseInt(value));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // API 요청 데이터 형식 맞추기
      const emotionsData = emotionIntensities.map((item) => ({
        user_id: userData.userId,
        emotion_name: item.emotion,
        intensity: item.intensity,
        color: item.color,
        sequence_order: item.sequence_order
      }));
      
      console.log('Submitting emotions:', emotionsData);
      
      const response = await createEmotionsBatch(userData.userId, emotionsData);
      console.log('Emotions saved:', response);
      
      setScreen(4);
      navigate('/complete');
    } catch (err) {
      console.error('Error saving emotions:', err);
      setError(err.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };
  
  // 사용자 인증 체크
  if (!userData.userId) {
    navigate('/');
    return null;
  }
  
  if (emotionIntensities.length === 0) {
    navigate('/emotion');
    return null;
  }
  
  return (
    <div className="intensity-container">
      <div className="intensity-panel">
        <h1 className="intensity-title">감정 강도 조절</h1>
        <p className="intensity-subtitle">
          각 감정의 강도를 설정해주세요 (1 = 약함, 10 = 강함)
        </p>
        
        <div className="intensity-list">
          {emotionIntensities.map((item, index) => (
            <div key={index} className="intensity-item">
              <div className="intensity-header">
                <span 
                  className="emotion-badge"
                  style={{ backgroundColor: item.color }}
                >
                  {item.emotion}
                </span>
                <span className="intensity-value">
                  {item.intensity}
                </span>
              </div>
              
              <input
                type="range"
                min="1"
                max="10"
                value={item.intensity}
                onChange={(e) => handleSliderChange(index, e.target.value)}
                className="intensity-slider"
                style={{
                  '--slider-color': item.color
                }}
              />
              
              <div className="intensity-labels">
                <span>약함</span>
                <span>강함</span>
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleSubmit}
          className="submit-button"
          disabled={loading}
        >
          {loading ? '저장 중...' : '제출하기'}
        </button>
        
        <div className="progress-indicator">
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot active"></div>
        </div>
      </div>
    </div>
  );
}

export default IntensitySlider;
