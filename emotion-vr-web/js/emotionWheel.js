/**
 * emotionWheel.js
 * 감정 룰렛 관리 모듈
 */

class EmotionWheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // 감정 목록 (한국어)
        this.emotions = [
            { name: '기쁨', color: '#FFD700' },
            { name: '슬픔', color: '#4169E1' },
            { name: '분노', color: '#DC143C' },
            { name: '두려움', color: '#8B008B' },
            { name: '놀람', color: '#FF69B4' },
            { name: '혐오', color: '#228B22' },
            { name: '평온', color: '#87CEEB' },
            { name: '흥분', color: '#FF4500' }
        ];
        
        this.currentAngle = 0;
        this.spinAngle = 0;
        this.spinning = false;
        this.selectedEmotion = null;
        
        this.draw();
    }
    
    /**
     * 룰렛 그리기
     */
    draw() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;
        const anglePerSection = (Math.PI * 2) / this.emotions.length;
        
        // 각 섹션 그리기
        this.emotions.forEach((emotion, index) => {
            const startAngle = anglePerSection * index + this.currentAngle;
            const endAngle = startAngle + anglePerSection;
            
            // 섹션 배경
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = emotion.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // 텍스트
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + anglePerSection / 2);
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(emotion.name, radius * 0.65, 5);
            this.ctx.restore();
        });
        
        // 중앙 원
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 포인터 (위쪽)
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 10);
        this.ctx.lineTo(centerX - 15, 40);
        this.ctx.lineTo(centerX + 15, 40);
        this.ctx.closePath();
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * 룰렛 회전
     */
    spin() {
        if (this.spinning) return;
        
        this.spinning = true;
        this.spinAngle = Math.random() * Math.PI * 4 + Math.PI * 10; // 최소 5바퀴
        const duration = 3000; // 3초
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out 효과
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.currentAngle = this.spinAngle * easeOut;
            
            this.draw();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.spinning = false;
                this.selectEmotion();
            }
        };
        
        animate();
    }
    
    /**
     * 선택된 감정 결정
     */
    selectEmotion() {
        const normalizedAngle = this.currentAngle % (Math.PI * 2);
        const anglePerSection = (Math.PI * 2) / this.emotions.length;
        
        // 포인터가 위쪽을 가리키므로, 각도 조정
        let adjustedAngle = (Math.PI * 2.5 - normalizedAngle) % (Math.PI * 2);
        if (adjustedAngle < 0) adjustedAngle += Math.PI * 2;
        
        const selectedIndex = Math.floor(adjustedAngle / anglePerSection) % this.emotions.length;
        this.selectedEmotion = this.emotions[selectedIndex];
        
        // 이벤트 발생
        const event = new CustomEvent('emotionSelected', {
            detail: { emotion: this.selectedEmotion.name }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 선택된 감정 반환
     */
    getSelectedEmotion() {
        return this.selectedEmotion ? this.selectedEmotion.name : null;
    }
    
    /**
     * 초기화
     */
    reset() {
        this.currentAngle = 0;
        this.spinAngle = 0;
        this.spinning = false;
        this.selectedEmotion = null;
        this.draw();
    }
}

// 전역 인스턴스 생성은 main.js에서 처리
