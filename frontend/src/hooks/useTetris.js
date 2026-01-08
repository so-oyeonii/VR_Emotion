import { useEffect, useRef, useState, useCallback } from 'react';

const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;

const PIECES = {
  'I': [[1, 1, 1, 1]],
  'O': [[1, 1], [1, 1]],
  'T': [[0, 1, 0], [1, 1, 1]],
  'S': [[0, 1, 1], [1, 1, 0]],
  'Z': [[1, 1, 0], [0, 1, 1]],
  'J': [[1, 0, 0], [1, 1, 1]],
  'L': [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
  'I': '#00f0f0',
  'O': '#f0f000',
  'T': '#a000f0',
  'S': '#00f000',
  'Z': '#f00000',
  'J': '#0000f0',
  'L': '#f0a000'
};

function useTetris(canvasRef, difficulty = 'hard') {
  const [board, setBoard] = useState(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lineAddCount, setLineAddCount] = useState(0);
  
  const gameLoopRef = useRef(null);
  const lineAddTimerRef = useRef(null);
  
  // 랜덤 피스 생성
  const createRandomPiece = useCallback(() => {
    const pieceKeys = Object.keys(PIECES);
    const randomKey = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
    return {
      shape: PIECES[randomKey],
      type: randomKey,
      color: COLORS[randomKey]
    };
  }, []);
  
  // 이동 가능 여부 확인
  const canMove = useCallback((shape, x, y, currentBoard) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          
          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return false;
          }
          
          if (newY >= 0 && currentBoard[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);
  
  // 피스 고정
  const lockPiece = useCallback((piece, pos, currentBoard) => {
    const newBoard = currentBoard.map(row => [...row]);
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const x = pos.x + col;
          const y = pos.y + row;
          if (y >= 0) {
            newBoard[y][x] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }, []);
  
  // 라인 클리어
  const clearLines = useCallback((currentBoard) => {
    let newBoard = [...currentBoard];
    let linesCleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell !== 0)) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        row++;
      }
    }
    
    return { newBoard, linesCleared };
  }, []);
  
  // 점수 계산
  const calculateScore = useCallback((linesCleared, currentLevel) => {
    const baseScore = [0, 100, 300, 500, 800];
    const scoreIndex = Math.min(linesCleared, baseScore.length - 1);
    return baseScore[scoreIndex] * currentLevel;
  }, []);
  
  // 하단에 랜덤 라인 추가 (난이도 증가)
  const addBottomLine = useCallback(() => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      // 모든 라인을 한 칸씩 위로 이동
      for (let y = 0; y < ROWS - 1; y++) {
        newBoard[y] = [...newBoard[y + 1]];
      }
      // 하단에 새 라인 추가 (7~9개의 랜덤 블록)
      const newLine = Array(COLS).fill(0);
      const filledCount = 7 + Math.floor(Math.random() * 3); // 7~9개
      const positions = [];
      while (positions.length < filledCount) {
        const pos = Math.floor(Math.random() * COLS);
        if (!positions.includes(pos)) {
          positions.push(pos);
          newLine[pos] = '#666'; // 회색 블록
        }
      }
      newBoard[ROWS - 1] = newLine;
      return newBoard;
    });
    setLineAddCount(prev => prev + 1);
  }, []);
  
  // 새 피스 생성
  const spawnPiece = useCallback(() => {
    const piece = createRandomPiece();
    const x = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
    const y = 0;
    
    return { piece, x, y };
  }, [createRandomPiece]);
  
  // 피스 회전
  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (canMove(rotated, position.x, position.y, board)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece, position, board, gameOver, isPaused, canMove]);
  
  // 좌우 이동
  const moveHorizontal = useCallback((dir) => {
    if (!currentPiece || gameOver || isPaused) return;
    
    if (canMove(currentPiece.shape, position.x + dir, position.y, board)) {
      setPosition(prev => ({ ...prev, x: prev.x + dir }));
    }
  }, [currentPiece, position, board, gameOver, isPaused, canMove]);
  
  // 빠른 낙하
  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    if (canMove(currentPiece.shape, position.x, position.y + 1, board)) {
      setPosition(prev => ({ ...prev, y: prev.y + 1 }));
      setScore(prev => prev + 1);
    }
  }, [currentPiece, position, board, gameOver, isPaused, canMove]);
  
  // 즉시 낙하
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    let dropDistance = 0;
    while (canMove(currentPiece.shape, position.x, position.y + dropDistance + 1, board)) {
      dropDistance++;
    }
    
    setPosition(prev => ({ ...prev, y: prev.y + dropDistance }));
    setScore(prev => prev + dropDistance * 2);
    
    // 즉시 고정
    const newBoard = lockPiece(currentPiece, { ...position, y: position.y + dropDistance }, board);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    
    setBoard(clearedBoard);
    
    if (linesCleared > 0) {
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      setLines(newLines);
      setLevel(newLevel);
      setScore(prev => prev + calculateScore(linesCleared, newLevel));
    }
    
    // 새 피스 생성
    const { piece, x, y } = spawnPiece();
    if (!canMove(piece.shape, x, y, clearedBoard)) {
      setGameOver(true);
    } else {
      setCurrentPiece(piece);
      setPosition({ x, y });
    }
  }, [currentPiece, position, board, gameOver, isPaused, lines, canMove, lockPiece, clearLines, calculateScore, spawnPiece]);
  
  // Canvas 그리기
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    
    // 배경
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 보드 그리기
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col]) {
          ctx.fillStyle = board[row][col];
          ctx.fillRect(
            col * BLOCK_SIZE + 1,
            row * BLOCK_SIZE + 1,
            BLOCK_SIZE - 2,
            BLOCK_SIZE - 2
          );
          
          // 하이라이트
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(
            col * BLOCK_SIZE + 1,
            row * BLOCK_SIZE + 1,
            BLOCK_SIZE - 2,
            BLOCK_SIZE / 3
          );
        }
      }
    }
    
    // 현재 피스 그리기
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const x = position.x + col;
            const y = position.y + row;
            
            ctx.fillStyle = currentPiece.color;
            ctx.fillRect(
              x * BLOCK_SIZE + 1,
              y * BLOCK_SIZE + 1,
              BLOCK_SIZE - 2,
              BLOCK_SIZE - 2
            );
            
            // 하이라이트
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(
              x * BLOCK_SIZE + 1,
              y * BLOCK_SIZE + 1,
              BLOCK_SIZE - 2,
              BLOCK_SIZE / 3
            );
          }
        }
      }
    }
    
    // 그리드
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    
    for (let row = 0; row <= ROWS; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * BLOCK_SIZE);
      ctx.lineTo(canvas.width, row * BLOCK_SIZE);
      ctx.stroke();
    }
    
    for (let col = 0; col <= COLS; col++) {
      ctx.beginPath();
      ctx.moveTo(col * BLOCK_SIZE, 0);
      ctx.lineTo(col * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    
    // 게임 오버 메시지
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('게임 오버!', canvas.width / 2, canvas.height / 2);
      ctx.font = '20px Arial';
      ctx.fillText(`점수: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [board, currentPiece, position, gameOver, score, canvasRef]);
  
  // 게임 루프
  useEffect(() => {
    if (gameOver || isPaused || !currentPiece) return;
    
    const speed = Math.max(100, 1000 - (level - 1) * 100);
    
    gameLoopRef.current = setInterval(() => {
      if (canMove(currentPiece.shape, position.x, position.y + 1, board)) {
        setPosition(prev => ({ ...prev, y: prev.y + 1 }));
      } else {
        // 피스 고정
        const newBoard = lockPiece(currentPiece, position, board);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        
        setBoard(clearedBoard);
        
        if (linesCleared > 0) {
          const newLines = lines + linesCleared;
          const newLevel = Math.floor(newLines / 10) + 1;
          setLines(newLines);
          setLevel(newLevel);
          setScore(prev => prev + calculateScore(linesCleared, newLevel));
        }
        
        // 새 피스
        const { piece, x, y } = spawnPiece();
        if (!canMove(piece.shape, x, y, clearedBoard)) {
          setGameOver(true);
        } else {
          setCurrentPiece(piece);
          setPosition({ x, y });
        }
      }
    }, speed);
    
    return () => clearInterval(gameLoopRef.current);
  }, [currentPiece, position, board, gameOver, isPaused, level, lines, canMove, lockPiece, clearLines, calculateScore, spawnPiece]);
  
  // 키보드 컨트롤
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || isPaused || !currentPiece) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          moveHorizontal(-1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          moveHorizontal(1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          moveDown();
          e.preventDefault();
          break;
        case 'ArrowUp':
          rotate();
          e.preventDefault();
          break;
        case ' ':
          hardDrop();
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPiece, gameOver, isPaused, moveHorizontal, moveDown, rotate, hardDrop]);
  
  // 게임 시작
  const startGame = useCallback(() => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setLineAddCount(0);
    
    const { piece, x, y } = spawnPiece();
    setCurrentPiece(piece);
    setPosition({ x, y });
    
    // 자동 라인 추가 타이머 시작
    if (lineAddTimerRef.current) {
      clearTimeout(lineAddTimerRef.current);
    }
    
    const scheduleNextLine = (count) => {
      let delay;
      
      if (difficulty === 'easy') {
        // 쉬움 모드: 10초마다 한 줄씩
        delay = 10000;
      } else if (difficulty === 'medium') {
        // 보통 모드 (처음 시작): 10초 -> 5초 -> 3초 -> 3초...
        if (count === 0) {
          delay = 10000; // 첫 번째: 10초 후
        } else if (count === 1) {
          delay = 5000; // 두 번째: 5초 후
        } else {
          delay = 3000; // 이후: 3초마다
        }
      } else {
        // 어려움 모드: 10초 -> 5초 -> 1초 -> 1초...
        if (count === 0) {
          delay = 10000; // 첫 번째: 10초 후
        } else if (count === 1) {
          delay = 5000; // 두 번째: 5초 후
        } else {
          delay = 1000; // 이후: 1초마다
        }
      }
      
      lineAddTimerRef.current = setTimeout(() => {
        if (!document.hidden) { // 탭이 활성화되어 있을 때만
          addBottomLine();
          scheduleNextLine(count + 1);
        }
      }, delay);
    };
    
    scheduleNextLine(0);
  }, [spawnPiece, addBottomLine, difficulty]);
  
  // 일시정지
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  
  // 게임오버 시 타이머 정리
  useEffect(() => {
    if (gameOver && lineAddTimerRef.current) {
      clearTimeout(lineAddTimerRef.current);
      lineAddTimerRef.current = null;
    }
  }, [gameOver]);
  
  // cleanup
  useEffect(() => {
    return () => {
      if (lineAddTimerRef.current) {
        clearTimeout(lineAddTimerRef.current);
      }
    };
  }, []);
  
  return {
    score,
    level,
    lines,
    gameOver,
    isPaused,
    startGame,
    togglePause
  };
}

export default useTetris;
