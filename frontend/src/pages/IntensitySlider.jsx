import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { createEmotionsBatch } from '../services/api';
import './IntensitySlider.css';

function IntensitySlider() {
  const navigate = useNavigate();
  const canvasRefs = useRef([]);
  const { 
    userData, 
    emotionIntensities, 
    setIntensity, 
    setScreen 
  } = useStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 3D 구형 렌더링
  const drawSphere = (canvas, color, intensity) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 강도에 따른 반지름 (10~80px)
    const baseRadius = 30;
    const maxRadius = 80;
    const radius = baseRadius + ((intensity - 1) / 9) * (maxRadius - baseRadius);
    
    // Canvas 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 그림자 효과
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    
    // Gradient로 3D 효과
    const gradient = ctx.createRadialGradient(
      centerX - radius * 0.3, 
      centerY - radius * 0.3, 
      radius * 0.1,
      centerX, 
      centerY, 
      radius
    );
    
    gradient.addColorStop(0, lightenColor(color, 0.6));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, darkenColor(color, 0.3));
    
    // 구 그리기
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 반사광 효과
    const highlightGradient = ctx.createRadialGradient(
      centerX - radius * 0.4,
      centerY - radius * 0.4,
      0,
      centerX - radius * 0.4,
      centerY - radius * 0.4,
      radius * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };
  
  // 색상 밝게
  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };
  
  // 색상 어둡게
  const darkenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };
  
  // 강도 변경 시 구 다시 그리기
  useEffect(() => {
    emotionIntensities.forEach((item, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        drawSphere(canvas, item.color, item.intensity);
      }
    });
  }, [emotionIntensities]);
  
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
          구의 크기를 조절하여 각 감정의 강도를 설정해주세요
        </p>
        
        <div className="intensity-list">
          {emotionIntensities.map((item, index) => (
            <div key={index} className="intensity-item">
              <div className="intensity-visual">
                <canvas 
                  ref={el => canvasRefs.current[index] = el}
                  width="200"
                  height="200"
                  className="sphere-canvas"
                />
                <div className="emotion-label-overlay">
                  <span className="emotion-name">{item.emotion}</span>
                  <span className="intensity-value">{item.intensity} / 10</span>
                </div>
              </div>
              
              <div className="slider-container">
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
                  <span>약함 (1)</span>
                  <span>강함 (10)</span>
                </div>
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
