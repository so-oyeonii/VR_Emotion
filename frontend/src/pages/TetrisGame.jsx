import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import useTetris from '../hooks/useTetris';
import './TetrisGame.css';

function TetrisGame() {
  const navigate = useNavigate();
  const { userData, setScreen } = useStore();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const { score, level, lines, gameOver, isPaused, startGame, togglePause } = useTetris(canvasRef);
  
  useEffect(() => {
    // 사용자 데이터가 없으면 첫 화면으로
    if (!userData.userId) {
      navigate('/');
      return;
    }
    
    // 자동으로 게임 시작
    const startTimer = setTimeout(() => {
      setGameStarted(true);
      startGame();
    }, 1000);
    
    return () => clearTimeout(startTimer);
  }, [userData.userId, navigate, startGame]);
  
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
              <div className="game-stats">
                <div>점수: {score}</div>
                <div>레벨: {level}</div>
                <div>라인: {lines}</div>
              </div>
              <div className="instruction">
                방향키: 이동/회전 | 스페이스: 즉시낙하
              </div>
            </div>
            
            <div className="game-board">
              <canvas ref={canvasRef} className="tetris-canvas" />
              {gameOver && (
                <div className="game-over-overlay">
                  <button onClick={startGame} className="restart-btn">
                    다시 시작
                  </button>
                </div>
              )}
            </div>
            
            <div className="game-controls">
              <button onClick={togglePause} className="control-btn">
                {isPaused ? '계속하기' : '일시정지'}
              </button>
              <button onClick={handleSkip} className="skip-button">
                다음으로 →
              </button>
            </div>
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
