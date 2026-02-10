import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { useCyberball } from '../hooks/useCyberball';
import './CyberballGame.css';

function CyberballGame() {
  const navigate = useNavigate();
  const { userData, setScreen } = useStore();
  const canvasRef = useRef(null);
  const [showCoverStory, setShowCoverStory] = useState(true);
  const [autoStarted, setAutoStarted] = useState(false);

  const {
    gameStarted,
    gameOver,
    throwCount,
    playerReceiveCount,
    totalThrows,
    waitingForPlayer,
    lastMessage,
    startGame,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  } = useCyberball(canvasRef);

  // 사용자 데이터 체크
  useEffect(() => {
    if (!userData.userId) {
      navigate('/');
    }
  }, [userData.userId, navigate]);

  // 게임 종료 시 자동 이동
  useEffect(() => {
    if (gameOver && gameStarted === false) {
      const timer = setTimeout(() => {
        setScreen(4);
        navigate('/emotion');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameOver, gameStarted, navigate, setScreen]);

  const handleStartGame = () => {
    setShowCoverStory(false);
    setTimeout(() => {
      setAutoStarted(true);
      startGame();
    }, 2000);
  };

  return (
    <div className="cyberball-container">
      <div className="cyberball-panel">
        {showCoverStory ? (
          <div className="cover-story">
            <h1 className="cover-title">공 던지기 게임</h1>
            <div className="cover-content">
              <p className="cover-desc">
                이것은 사회적 상호작용 연습입니다.
              </p>
              <p className="cover-desc">
                다른 두 명의 참가자와 함께 공 던지기 게임을 합니다.
                공이 당신에게 오면, 다른 참가자를 클릭하여 공을 던져주세요.
              </p>
              <div className="cover-rules">
                <div className="rule-item">
                  <span className="rule-icon">1</span>
                  <span>공이 오면 다른 참가자를 클릭</span>
                </div>
                <div className="rule-item">
                  <span className="rule-icon">2</span>
                  <span>게임은 약 5분간 진행됩니다</span>
                </div>
                <div className="rule-item">
                  <span className="rule-icon">3</span>
                  <span>편하게 참여해 주세요</span>
                </div>
              </div>
            </div>
            <button className="start-btn" onClick={handleStartGame}>
              게임 시작
            </button>
          </div>
        ) : !autoStarted ? (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>다른 참가자를 연결하는 중...</p>
          </div>
        ) : (
          <>
            <div className="game-info">
              {lastMessage && (
                <div className={`game-message ${waitingForPlayer ? 'highlight' : ''}`}>
                  {lastMessage}
                </div>
              )}
            </div>

            <div className="game-board">
              <canvas
                ref={canvasRef}
                className="cyberball-canvas"
                style={{
                  width: '100%',
                  maxWidth: `${CANVAS_WIDTH}px`,
                  height: 'auto',
                  aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                }}
              />
            </div>
          </>
        )}

        <div className="progress-indicator">
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default CyberballGame;
