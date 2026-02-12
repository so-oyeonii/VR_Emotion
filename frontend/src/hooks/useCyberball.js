import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const BALL_RADIUS = 12;
const PLAYER_RADIUS = 35;
const BALL_SPEED = 7;

// Phase 2 timing: 포함 1분(60s) + 배제 2분(120s) = 총 3분(180s)
const INCLUSION_DURATION = 60;
const EXCLUSION_DURATION = 120;
const GAME_DURATION = INCLUSION_DURATION + EXCLUSION_DURATION;

const POSITIONS = {
  player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, label: '나', color: '#4A90D9' },
  agent1: { x: 90, y: 130, label: '참가자 B', color: '#E67E22' },
  agent2: { x: CANVAS_WIDTH - 90, y: 130, label: '참가자 C', color: '#2ECC71' },
};

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
  const b = Math.min(255, (num & 0xFF) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function drawBallShape(ctx, x, y) {
  ctx.beginPath();
  ctx.ellipse(x, y + BALL_RADIUS + 5, BALL_RADIUS * 0.7, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, BALL_RADIUS);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.4, '#FFE066');
  grad.addColorStop(1, '#FF8C00');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#B86E00';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function useCyberball(canvasRef) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [possession, setPossession] = useState('agent1');
  const [throwCount, setThrowCount] = useState(0);
  const [playerReceiveCount, setPlayerReceiveCount] = useState(0);
  const [totalThrows, setTotalThrows] = useState(0);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [phase, setPhase] = useState('inclusion');
  const [throwTimer, setThrowTimer] = useState(0); // 5초 카운트다운

  // 모든 뮤터블 게임 상태를 ref에 보관 (리렌더링 없이 접근)
  const stateRef = useRef({
    ballX: POSITIONS.agent1.x,
    ballY: POSITIONS.agent1.y,
    isAnimating: false,
    possession: 'agent1',
    phase: 'inclusion',
    throwCount: 0,
    playerReceiveCount: 0,
    totalThrows: 0,
    gameStarted: false,
    gameOver: false,
    timeLeft: GAME_DURATION,
    elapsedTime: 0,
    waitingForPlayer: false,
    highlightedAgent: null,
  });

  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const throwTimerRef = useRef(null); // 5초 자동던지기 타이머
  const throwCountdownRef = useRef(null); // 카운트다운 interval

  // AI throw를 ref로 저장 (순환 의존 방지)
  const aiThrowRef = useRef(null);
  // playerThrow도 ref로 저장 (이벤트 핸들러에서 최신 참조)
  const playerThrowRef = useRef(null);

  // === 캔버스 그리기 (원래 Cyberball과 동일: 배제 시 시각 변화 없음) ===
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;

    // 배경 (항상 동일)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#0f1923');
    bgGrad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 경기장 원 (항상 동일)
    ctx.beginPath();
    ctx.ellipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, 195, 175, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 181, 246, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 연결선 (점선, 항상 동일)
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    const posArr = [POSITIONS.player, POSITIONS.agent1, POSITIONS.agent2];
    for (let i = 0; i < posArr.length; i++) {
      for (let j = i + 1; j < posArr.length; j++) {
        ctx.beginPath();
        ctx.moveTo(posArr[i].x, posArr[i].y);
        ctx.lineTo(posArr[j].x, posArr[j].y);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // 플레이어 3명 그리기 (배제 시에도 동일하게 표시)
    Object.entries(POSITIONS).forEach(([key, pos]) => {
      const isCurrent = s.possession === key;
      const isHover = s.highlightedAgent === key;
      const isMe = key === 'player';

      // 소유자 글로우
      if (isCurrent && !s.waitingForPlayer) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, PLAYER_RADIUS + 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
        ctx.fill();
      }

      // 호버 링
      if (isHover && s.waitingForPlayer && !isMe) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, PLAYER_RADIUS + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // 아바타 원
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(pos.x - 10, pos.y - 10, 4, pos.x, pos.y, PLAYER_RADIUS);
      grad.addColorStop(0, lightenColor(pos.color, 50));
      grad.addColorStop(1, pos.color);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = isCurrent ? '#FFD700' : 'rgba(255,255,255,0.25)';
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      ctx.stroke();

      // 아이콘 (모든 플레이어 항상 동일)
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isMe ? '🙂' : '😊', pos.x, pos.y - 1);

      // 이름
      ctx.fillStyle = '#ccc';
      ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(pos.label, pos.x, pos.y + PLAYER_RADIUS + 18);

      if (isMe) {
        ctx.fillStyle = 'rgba(74, 144, 217, 0.7)';
        ctx.font = '10px "Segoe UI", Arial, sans-serif';
        ctx.fillText('(나)', pos.x, pos.y + PLAYER_RADIUS + 32);
      }
    });

    // 공
    if (s.waitingForPlayer && !s.isAnimating) {
      // 플레이어 머리 위에 공 표시
      const py = POSITIONS.player.y - PLAYER_RADIUS - 24;
      drawBallShape(ctx, POSITIONS.player.x, py);

      // 안내 텍스트
      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('공을 던질 상대를 클릭하세요!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);
    } else {
      drawBallShape(ctx, s.ballX, s.ballY);
    }

    // 게임 오버
    if (s.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('게임이 종료되었습니다', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('잠시 후 다음 단계로 이동합니다...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
  }, [canvasRef]);

  // === 공 애니메이션 ===
  const animateBall = useCallback((fromKey, toKey, onComplete) => {
    const s = stateRef.current;
    const from = POSITIONS[fromKey];
    const to = POSITIONS[toKey];

    s.isAnimating = true;
    s.ballX = from.x;
    s.ballY = from.y;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / BALL_SPEED);
    let step = 0;

    const animate = () => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 2.5);
      const arc = Math.sin(progress * Math.PI) * -50;

      s.ballX = from.x + dx * eased;
      s.ballY = from.y + dy * eased + arc;
      draw();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        s.isAnimating = false;
        s.ballX = to.x;
        s.ballY = to.y;
        draw();
        if (onComplete) onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [draw]);

  // === AI throw (ref에 저장) ===
  useEffect(() => {
    aiThrowRef.current = () => {
      const s = stateRef.current;
      if (s.gameOver || !s.gameStarted || s.isAnimating) return;
      if (s.possession === 'player') return;

      const currentPossessor = s.possession;
      const otherAgent = currentPossessor === 'agent1' ? 'agent2' : 'agent1';

      let target;
      if (s.phase === 'inclusion') {
        // 포함: ~35% 확률로 플레이어에게
        target = Math.random() < 0.35 ? 'player' : otherAgent;
      } else {
        // 배제: 절대 플레이어에게 보내지 않음 (0%)
        target = otherAgent;
      }

      s.totalThrows++;
      setTotalThrows(s.totalThrows);

      animateBall(currentPossessor, target, () => {
        s.possession = target;
        setPossession(target);

        if (target === 'player') {
          s.playerReceiveCount++;
          s.waitingForPlayer = true;
          setPlayerReceiveCount(s.playerReceiveCount);
          setWaitingForPlayer(true);
          setLastMessage('공이 당신에게 왔습니다!');

          // 5초 카운트다운 시작
          s.throwTimeLeft = 5;
          setThrowTimer(5);
          clearInterval(throwCountdownRef.current);
          clearTimeout(throwTimerRef.current);

          throwCountdownRef.current = setInterval(() => {
            s.throwTimeLeft--;
            setThrowTimer(s.throwTimeLeft);
            if (s.throwTimeLeft <= 0) {
              clearInterval(throwCountdownRef.current);
            }
          }, 1000);

          // 5초 후 자동 던지기
          throwTimerRef.current = setTimeout(() => {
            clearInterval(throwCountdownRef.current);
            if (s.waitingForPlayer && !s.isAnimating && !s.gameOver) {
              const autoTarget = Math.random() < 0.5 ? 'agent1' : 'agent2';
              playerThrowRef.current?.(autoTarget);
            }
          }, 5000);
        } else {
          // AI 간 패스 속도 (항상 동일)
          const delay = 600 + Math.random() * 900;
          aiTimerRef.current = setTimeout(() => aiThrowRef.current?.(), delay);
        }
      });
    };
  }, [animateBall]);

  // === 플레이어 던지기 (ref에 저장) ===
  useEffect(() => {
    playerThrowRef.current = (targetKey) => {
      const s = stateRef.current;
      if (!s.waitingForPlayer || s.isAnimating || s.gameOver) return;
      if (targetKey === 'player') return;

      // 5초 타이머 정리
      clearTimeout(throwTimerRef.current);
      clearInterval(throwCountdownRef.current);
      setThrowTimer(0);

      s.waitingForPlayer = false;
      s.throwCount++;
      s.totalThrows++;
      setWaitingForPlayer(false);
      setThrowCount(s.throwCount);
      setTotalThrows(s.totalThrows);
      setLastMessage(`${POSITIONS[targetKey].label}에게 공을 던졌습니다`);

      animateBall('player', targetKey, () => {
        s.possession = targetKey;
        setPossession(targetKey);

        const delay = 500 + Math.random() * 700;
        aiTimerRef.current = setTimeout(() => aiThrowRef.current?.(), delay);
      });
    };
  }, [animateBall]);

  // === 캔버스 이벤트 핸들러 (직접 등록) ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      const s = stateRef.current;
      if (!s.waitingForPlayer || s.isAnimating || s.gameOver) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      for (const [key, pos] of Object.entries(POSITIONS)) {
        if (key === 'player') continue;
        const dx = x - pos.x;
        const dy = y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < PLAYER_RADIUS + 20) {
          playerThrowRef.current?.(key);
          return;
        }
      }
    };

    const handleMouseMove = (e) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      let found = null;
      for (const [key, pos] of Object.entries(POSITIONS)) {
        if (key === 'player') continue;
        const dx = x - pos.x;
        const dy = y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < PLAYER_RADIUS + 20) {
          found = key;
          break;
        }
      }

      if (s.highlightedAgent !== found) {
        s.highlightedAgent = found;
        canvas.style.cursor = (found && s.waitingForPlayer) ? 'pointer' : 'default';
        draw();
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    // 초기 그리기
    draw();

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(timerRef.current);
      clearTimeout(aiTimerRef.current);
      clearTimeout(throwTimerRef.current);
      clearInterval(throwCountdownRef.current);
    };
  }, [canvasRef, draw]);

  // === 게임 시작 ===
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas not available yet');
      return;
    }

    const s = stateRef.current;

    // 이전 게임 정리
    clearInterval(timerRef.current);
    clearTimeout(aiTimerRef.current);
    cancelAnimationFrame(animFrameRef.current);

    // 상태 초기화
    s.gameStarted = true;
    s.gameOver = false;
    s.possession = 'agent1';
    s.phase = 'inclusion';
    s.throwCount = 0;
    s.playerReceiveCount = 0;
    s.totalThrows = 0;
    s.timeLeft = GAME_DURATION;
    s.elapsedTime = 0;
    s.waitingForPlayer = false;
    s.ballX = POSITIONS.agent1.x;
    s.ballY = POSITIONS.agent1.y;
    s.isAnimating = false;

    setGameStarted(true);
    setGameOver(false);
    setPossession('agent1');
    setPhase('inclusion');
    setThrowCount(0);
    setPlayerReceiveCount(0);
    setTotalThrows(0);
    setTimeLeft(GAME_DURATION);
    setWaitingForPlayer(false);
    setThrowTimer(0);
    setLastMessage('게임이 시작되었습니다!');

    // 타이머
    timerRef.current = setInterval(() => {
      s.elapsedTime++;
      s.timeLeft = GAME_DURATION - s.elapsedTime;
      setTimeLeft(s.timeLeft);

      // 포함 시간 경과 후 배제 단계 전환 (시각 변화 없이 공 분배만 변경)
      if (s.elapsedTime >= INCLUSION_DURATION && s.phase === 'inclusion') {
        s.phase = 'exclusion';
        setPhase('exclusion');
      }

      if (s.timeLeft <= 0) {
        s.gameOver = true;
        s.gameStarted = false;
        setGameOver(true);
        setGameStarted(false);
        clearInterval(timerRef.current);
        clearTimeout(aiTimerRef.current);
        draw();
      }
    }, 1000);

    // 초기 그리기
    draw();

    // 첫 AI 던지기
    const delay = 800 + Math.random() * 500;
    aiTimerRef.current = setTimeout(() => aiThrowRef.current?.(), delay);
  }, [canvasRef, draw]);

  // 외부에서 호출 가능한 던지기 함수
  const throwTo = useCallback((targetKey) => {
    playerThrowRef.current?.(targetKey);
  }, []);

  return {
    gameStarted,
    gameOver,
    timeLeft,
    possession,
    throwCount,
    playerReceiveCount,
    totalThrows,
    waitingForPlayer,
    lastMessage,
    phase,
    throwTimer,
    startGame,
    throwTo,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GAME_DURATION,
  };
}
