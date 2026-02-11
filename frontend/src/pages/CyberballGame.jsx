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
  const [showLoading, setShowLoading] = useState(false);
  const [readyToStart, setReadyToStart] = useState(false);

  const {
    gameStarted,
    gameOver,
    waitingForPlayer,
    lastMessage,
    timeLeft,
    phase,
    catchStreak,
    waitingSince,
    throwTimer,
    playerReceiveCount,
    startGame,
    throwTo,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  } = useCyberball(canvasRef);

  // 사용자 데이터 체크
  useEffect(() => {
    if (!userData.userId) {
      navigate('/');
    }
  }, [userData.userId, navigate]);

  // 캔버스가 보이고 readyToStart가 되면 게임 시작 (useEffect로 DOM 커밋 보장)
  useEffect(() => {
    if (readyToStart && !showCoverStory && !showLoading) {
      startGame();
      setReadyToStart(false);
    }
  }, [readyToStart, showCoverStory, showLoading, startGame]);

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
    setShowLoading(true);

    setTimeout(() => {
      setShowLoading(false);
      setReadyToStart(true);
    }, 2000);
  };

  const canvasVisible = !showCoverStory && !showLoading;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // 배제 대기 메시지
  const getWaitMessage = () => {
    if (waitingForPlayer) return null;
    if (phase !== 'exclusion') return '다른 참가자가 공을 던지고 있습니다...';
    if (waitingSince > 30) return '공이 한동안 오지 않고 있습니다...';
    if (waitingSince > 15) return '다른 참가자들끼리 공을 주고받고 있습니다...';
    return '다른 참가자가 공을 던지고 있습니다...';
  };

  return (
    <div className={`cyberball-container ${phase === 'exclusion' ? 'exclusion-phase' : ''}`}>
      <div className="cyberball-panel">
        {showCoverStory && (
          <div className="cover-story">
            <h1 className="cover-title">공 던지기 게임</h1>
            <div className="cover-content">
              <p className="cover-desc">
                이것은 사회적 상호작용 연습입니다.
              </p>
              <p className="cover-desc">
                다른 두 명의 참가자와 함께 공 던지기 게임을 합니다.
                공이 당신에게 오면, 아래 버튼을 눌러 공을 던져주세요.
              </p>
              <div className="cover-rules">
                <div className="rule-item">
                  <span className="rule-icon">1</span>
                  <span>공이 오면 던질 상대를 선택</span>
                </div>
                <div className="rule-item">
                  <span className="rule-icon">2</span>
                  <span>게임은 약 3분간 진행됩니다</span>
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
        )}

        {showLoading && (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>다른 참가자를 연결하는 중...</p>
          </div>
        )}

        {/* 캔버스는 항상 DOM에 존재하지만, 게임 화면이 아닐 때는 숨김 */}
        <div style={{ display: canvasVisible ? 'block' : 'none' }}>
          {/* 상단 정보바 */}
          <div className="game-header">
            <div className="timer-display">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="catch-counter">
              받은 횟수: <strong>{playerReceiveCount}</strong>
            </div>
            {catchStreak >= 2 && phase === 'inclusion' && (
              <div className="streak-badge">
                {catchStreak}연속!
              </div>
            )}
          </div>

          {/* 상태 메시지 */}
          {lastMessage && (
            <div className={`game-message-bar ${waitingForPlayer ? 'highlight' : ''}`}>
              {lastMessage}
            </div>
          )}

          <div className="game-board">
            <canvas
              ref={canvasRef}
              className="cyberball-canvas"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                width: '100%',
                maxWidth: `${CANVAS_WIDTH}px`,
                height: 'auto',
                aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
              }}
            />
          </div>

          {/* 던지기 버튼 영역 */}
          <div className={`throw-buttons ${waitingForPlayer ? 'active' : ''}`}>
            {waitingForPlayer ? (
              <>
                <div className="throw-prompt-row">
                  <p className="throw-prompt">공을 던질 상대를 선택하세요!</p>
                  {throwTimer > 0 && (
                    <div className={`throw-countdown ${throwTimer <= 2 ? 'urgent' : ''}`}>
                      {throwTimer}초
                    </div>
                  )}
                </div>
                <div className="throw-btn-group">
                  <button
                    className="throw-btn throw-btn-b"
                    onClick={() => throwTo('agent1')}
                  >
                    <span className="throw-btn-emoji">😊</span>
                    <span className="throw-btn-name">참가자 B</span>
                  </button>
                  <button
                    className="throw-btn throw-btn-c"
                    onClick={() => throwTo('agent2')}
                  >
                    <span className="throw-btn-emoji">😊</span>
                    <span className="throw-btn-name">참가자 C</span>
                  </button>
                </div>
              </>
            ) : (
              <p className={`throw-wait ${phase === 'exclusion' && waitingSince > 15 ? 'dimmed' : ''}`}>
                {getWaitMessage()}
              </p>
            )}
          </div>
        </div>

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
