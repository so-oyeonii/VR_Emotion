import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 감정 룰렛 Hook
 * 회전하는 감정 휠을 관리하고 자동으로 감정을 선택
 */
const useEmotionWheel = (canvasRef, excludedEmotions = []) => {
  const allEmotions = [
    { name: '기쁨', color: '#FFD700', emoji: '😊' },
    { name: '슬픔', color: '#4169E1', emoji: '😢' },
    { name: '분노', color: '#DC143C', emoji: '😠' },
    { name: '두려움', color: '#8B008B', emoji: '😨' },
    { name: '놀람', color: '#FF69B4', emoji: '😲' },
    { name: '혐오', color: '#228B22', emoji: '🤢' },
    { name: '평온', color: '#87CEEB', emoji: '😌' },
    { name: '흥분', color: '#FF4500', emoji: '🤩' }
  ];
  
  // 제외된 감정을 제외한 감정 목록
  const emotions = allEmotions.filter(e => !excludedEmotions.includes(e.name));

  const [currentAngle, setCurrentAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  
  const animationRef = useRef(null);
  const spinDataRef = useRef({ targetAngle: 0, startTime: 0, duration: 0 });

  // Canvas 그리기
  const draw = useCallback((angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.45;
    const anglePerSection = (Math.PI * 2) / emotions.length;

    // Canvas 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 각 섹션 그리기
    emotions.forEach((emotion, index) => {
      const startAngle = anglePerSection * index + angle;
      const endAngle = startAngle + anglePerSection;

      // 섹션 배경
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = emotion.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 텍스트 (감정 이름 + 이모지)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSection / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 이모지
      ctx.font = 'bold 24px Arial';
      ctx.fillText(emotion.emoji, radius * 0.65, -10);
      
      // 감정 이름
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(emotion.name, radius * 0.65, 15);
      ctx.restore();
    });

    // 중앙 원
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 중앙 텍스트
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', centerX, centerY + 5);

    // 포인터 (위쪽 고정)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 15, centerY - radius + 5);
    ctx.lineTo(centerX + 15, centerY - radius + 5);
    ctx.closePath();
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [emotions]);

  // 선택된 감정 결정 (포인터는 위쪽 고정, 휠이 회전)
  const selectEmotion = useCallback((finalAngle) => {
    const normalizedAngle = ((finalAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    const anglePerSection = (Math.PI * 2) / emotions.length;
    
    // 포인터가 위쪽(12시 방향)을 가리킴
    // 휠이 시계방향으로 회전하므로 각도를 반대로 계산
    const pointerAngle = (Math.PI * 1.5); // 12시 방향
    let relativeAngle = (pointerAngle - normalizedAngle) % (Math.PI * 2);
    if (relativeAngle < 0) relativeAngle += Math.PI * 2;
    
    const selectedIndex = Math.floor(relativeAngle / anglePerSection) % emotions.length;
    const selected = emotions[selectedIndex];
    
    console.log('=== 룰렛 선택 계산 ===');
    console.log('최종 각도:', finalAngle);
    console.log('정규화 각도:', normalizedAngle);
    console.log('상대 각도:', relativeAngle);
    console.log('선택된 인덱스:', selectedIndex);
    console.log('선택된 감정:', selected);
    
    setSelectedEmotion(selected);
    return selected;
  }, [emotions]);

  // 룰렛 회전
  const spin = useCallback(() => {
    if (spinning) return;
    if (emotions.length === 0) {
      console.log('선택 가능한 감정이 없습니다.');
      return;
    }

    console.log('=== 룰렛 시작 ===');
    console.log('현재 감정 목록:', emotions.map(e => e.name));
    
    setSpinning(true);
    setSelectedEmotion(null);
    
    // 랜덤 회전 각도 (최소 5바퀴 + 랜덤)
    const randomSpins = 5 + Math.random() * 3; // 5~8바퀴
    const targetAngle = currentAngle + (Math.PI * 2 * randomSpins) + (Math.random() * Math.PI * 2);
    const duration = 3000; // 3초
    const startTime = Date.now();

    spinDataRef.current = { targetAngle, startTime, duration };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic 효과
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newAngle = currentAngle + (targetAngle - currentAngle) * easeOut;

      setCurrentAngle(newAngle);
      draw(newAngle);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setSpinCount(prev => prev + 1);
        const selected = selectEmotion(newAngle);
        console.log('=== 룰렛 종료 ===');
        console.log('최종 선택:', selected?.name);
      }
    };

    animate();
  }, [spinning, emotions, currentAngle, draw, selectEmotion]);

  // 초기화
  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCurrentAngle(0);
    setSpinning(false);
    setSelectedEmotion(null);
    setSpinCount(0);
    draw(0);
  }, [draw]);

  // Canvas 초기 그리기
  useEffect(() => {
    if (canvasRef.current && emotions.length > 0) {
      const canvas = canvasRef.current;
      canvas.width = 400;
      canvas.height = 400;
      draw(currentAngle);
    }
  }, [canvasRef, currentAngle, draw, emotions.length, excludedEmotions.length]); // excludedEmotions.length 추가

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    emotions,
    spinning,
    selectedEmotion,
    spinCount,
    spin,
    reset
  };
};

export default useEmotionWheel;
