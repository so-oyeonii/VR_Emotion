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
  const [gameOverTimer, setGameOverTimer] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  
  const { score, level, lines, gameOver, isPaused, startGame, togglePause } = useTetris(canvasRef, difficulty);
  
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
          // 60초 후 무조건 오류 화면 표시
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
  
  // 게임오버 시 난이도 선택 화면 즉시 표시
  useEffect(() => {
    if (gameOver) {
      setShowDifficultySelect(true);
    } else {
      setShowDifficultySelect(false);
      setGameOverTimer(10);
    }
  }, [gameOver]);
  
  const handleSkip = () => {
    setScreen(2);
    navigate('/emotion');
  };
  
  const handleRestartWithDifficulty = (newDifficulty) => {
    console.log(`🎯 난이도 변경: ${difficulty} -> ${newDifficulty}`);
    setDifficulty(newDifficulty);
    setShowDifficultySelect(false);
    setGameOverTimer(10);
    // 난이도 변경 후 즉시 게임 재시작
    setTimeout(() => {
      startGame();
    }, 50);
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
              {/* 타이머는 숨김 처리 - 실험 참가자에게 시간 압박감 제거 */}
              {/* <div className="timer">시간: {countdown}초</div> */}
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
                  <div className="game-over-content">
                    <h2>게임 종료!</h2>
                    <p className="final-score">최종 점수: {score}</p>
                    <p className="difficulty-prompt">난이도를 선택하고 다시 도전하세요!</p>
                    <div className="difficulty-buttons">
                      <button 
                        onClick={() => handleRestartWithDifficulty('easy')} 
                        className="difficulty-btn easy-btn"
                      >
                        🟢 쉬움
                      </button>
                      <button 
                        onClick={() => handleRestartWithDifficulty('hard')} 
                        className="difficulty-btn hard-btn"
                      >
                        🔴 어려움
                      </button>
                    </div>
                  </div>
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
