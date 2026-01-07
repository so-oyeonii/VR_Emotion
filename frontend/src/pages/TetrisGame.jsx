import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './TetrisGame.css';

function TetrisGame() {
  const navigate = useNavigate();
  const { userData, setScreen } = useStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  useEffect(() => {
    // 사용자 데이터가 없으면 첫 화면으로
    if (!userData.userId) {
      navigate('/');
      return;
    }
    
    // 자동으로 게임 시작
    const startTimer = setTimeout(() => {
      setGameStarted(true);
    }, 1000);
    
    return () => clearTimeout(startTimer);
  }, [userData.userId, navigate]);
  
  useEffect(() => {
    if (!gameStarted) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // 60초 후 시스템 에러 발생
          setShowError(true);
          setTimeout(() => {
            setScreen(2);
            navigate('/emotion');
          }, 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, navigate, setScreen]);
  
  const handleSkip = () => {
    setScreen(2);
    navigate('/emotion');
  };
  
  return (
    <div className="tetris-container">
      <div className="tetris-panel">
        <h1 className="tetris-title">테트리스 게임</h1>
        
        {!gameStarted ? (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>게임 로딩중...</p>
          </div>
        ) : (
          <>
            <div className="game-info">
              <div className="timer">시간: {countdown}초</div>
              <div className="instruction">
                게임을 즐겨보세요!<br />
                (60초 후 자동으로 다음 단계로 이동합니다)
              </div>
            </div>
            
            <div className="game-board">
              <div className="fake-tetris">
                <div className="tetris-block"></div>
                <div className="tetris-block"></div>
                <div className="tetris-block"></div>
                <div className="tetris-block"></div>
                <div className="tetris-row">
                  <div className="tetris-cell filled"></div>
                  <div className="tetris-cell"></div>
                  <div className="tetris-cell filled"></div>
                  <div className="tetris-cell filled"></div>
                </div>
              </div>
              <p className="game-notice">
                🎮 실제 게임 구현은 이후 단계에서 완성됩니다
              </p>
            </div>
            
            <button 
              onClick={handleSkip}
              className="skip-button"
            >
              다음으로 →
            </button>
          </>
        )}
        
        <div className="progress-indicator">
          <div className="progress-dot"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
      
      {showError && (
        <div className="error-modal">
          <div className="error-content glitch">
            <h2>⚠️ 시스템 오류</h2>
            <p>게임을 그만하고 조금 쉬세요!</p>
            <p className="error-code">ERROR_CODE: 0x8007045D</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TetrisGame;
