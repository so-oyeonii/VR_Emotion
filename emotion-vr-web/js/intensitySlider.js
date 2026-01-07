/**
 * intensitySlider.js
 * 감정 강도 조절 모듈
 */

class IntensitySlider {
    constructor(sliderId, displayId) {
        this.slider = document.getElementById(sliderId);
        this.display = document.getElementById(displayId);
        this.intensity = 5; // 기본값
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        // 슬라이더 이벤트 리스너
        this.slider.addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value);
            this.updateDisplay();
            this.updateSliderColor();
        });
        
        this.updateDisplay();
        this.updateSliderColor();
    }
    
    /**
     * 디스플레이 업데이트
     */
    updateDisplay() {
        this.display.textContent = this.intensity;
    }
    
    /**
     * 슬라이더 색상 업데이트 (강도에 따라)
     */
    updateSliderColor() {
        const percentage = ((this.intensity - 1) / 9) * 100;
        
        // 색상 그라데이션 계산 (약함: 연한 파랑 -> 강함: 진한 보라)
        const hue = 240 - (percentage * 0.6); // 240 (파랑) -> 180 (청록)
        const saturation = 50 + (percentage * 0.5); // 50% -> 100%
        const lightness = 70 - (percentage * 0.3); // 70% -> 40%
        
        this.slider.style.background = `linear-gradient(to right, 
            hsl(240, 60%, 80%) 0%, 
            hsl(${hue}, ${saturation}%, ${lightness}%) ${percentage}%, 
            #ddd ${percentage}%, 
            #ddd 100%)`;
    }
    
    /**
     * 현재 강도 반환
     */
    getIntensity() {
        return this.intensity;
    }
    
    /**
     * 강도 설정
     */
    setIntensity(value) {
        if (value >= 1 && value <= 10) {
            this.intensity = value;
            this.slider.value = value;
            this.updateDisplay();
            this.updateSliderColor();
        }
    }
    
    /**
     * 초기화
     */
    reset() {
        this.setIntensity(5);
    }
    
    /**
     * 강도 레벨 텍스트 반환
     */
    getIntensityLevel() {
        if (this.intensity <= 3) return '약함';
        if (this.intensity <= 7) return '중간';
        return '강함';
    }
    
    /**
     * 강도에 따른 색상 반환
     */
    getIntensityColor() {
        if (this.intensity <= 3) return '#87CEEB'; // 연한 파랑
        if (this.intensity <= 7) return '#667eea'; // 중간 보라
        return '#764ba2'; // 진한 보라
    }
}

// 전역 인스턴스 생성은 main.js에서 처리
