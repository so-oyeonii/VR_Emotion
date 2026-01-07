import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './Completion.css';

function Completion() {
  const navigate = useNavigate();
  const { userData, emotionIntensities, resetStore } = useStore();
  
  useEffect(() => {
    // 사용자 데이터가 없으면 첫 화면으로
    if (!userData.userId) {
      navigate('/');
    }
  }, [userData.userId, navigate]);
  
  const handleReset = () => {
    resetStore();
    navigate('/');
  };
  
  return (
    <div className="completion-container">
      <div className="completion-panel">
        <div className="success-icon">✓</div>
        <h1 className="completion-title">완료!</h1>
        <p className="completion-subtitle">
          감정 데이터가 성공적으로 저장되었습니다
        </p>
        
        <div className="completion-summary">
          <h3>저장된 정보</h3>
          <div className="summary-item">
            <span className="label">이름:</span>
            <span className="value">{userData.name}</span>
          </div>
          <div className="summary-item">
            <span className="label">선택한 감정:</span>
            <div className="emotion-badges">
              {emotionIntensities.map((item, index) => (
                <div 
                  key={index}
                  className="emotion-summary-badge"
                  style={{ backgroundColor: item.color }}
                >
                  {item.emotion} (강도: {item.intensity})
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="completion-message">
          <p>
            🎉 참여해 주셔서 감사합니다!
          </p>
          <p>
            수집된 데이터는 연구 목적으로만 사용됩니다.
          </p>
        </div>
        
        <button 
          onClick={handleReset}
          className="restart-button"
        >
          처음으로 돌아가기
        </button>
        
        <div className="progress-indicator">
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
        </div>
      </div>
    </div>
  );
}

export default Completion;
