/**
 * main.js
 * 애플리케이션 전체 관리 및 흐름 제어
 */

class App {
    constructor() {
        this.emotionWheel = null;
        this.intensitySlider = null;
        this.tetris = null;
        
        this.currentEmotion = null;
        this.currentIntensity = null;
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        // 모듈 인스턴스 생성
        this.emotionWheel = new EmotionWheel('emotion-wheel');
        this.intensitySlider = new IntensitySlider('intensity-slider', 'intensity-value');
        this.tetris = new Tetris('tetris-canvas');
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 초기 화면 표시
        this.showSection('emotion-section');
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 감정 룰렛 관련
        document.getElementById('spin-button').addEventListener('click', () => {
            this.emotionWheel.spin();
        });
        
        document.addEventListener('emotionSelected', (e) => {
            this.onEmotionSelected(e.detail.emotion);
        });
        
        document.getElementById('confirm-emotion').addEventListener('click', () => {
            this.confirmEmotion();
        });
        
        // 강도 조절 관련
        document.getElementById('confirm-intensity').addEventListener('click', () => {
            this.confirmIntensity();
        });
        
        // 게임 컨트롤 관련
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-game').addEventListener('click', () => {
            this.tetris.pause();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartApp();
        });
    }
    
    /**
     * 섹션 표시
     */
    showSection(sectionId) {
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden');
        });
        
        // 선택된 섹션 표시
        const selectedSection = document.getElementById(sectionId);
        selectedSection.classList.remove('hidden');
        selectedSection.classList.add('active');
    }
    
    /**
     * 감정 선택 이벤트 처리
     */
    onEmotionSelected(emotion) {
        this.currentEmotion = emotion;
        
        // 선택된 감정 표시
        document.getElementById('emotion-name').textContent = emotion;
        document.getElementById('selected-emotion').classList.remove('hidden');
        document.getElementById('spin-button').disabled = true;
    }
    
    /**
     * 감정 확인
     */
    confirmEmotion() {
        if (!this.currentEmotion) {
            alert('감정을 선택해주세요.');
            return;
        }
        
        console.log(`선택된 감정: ${this.currentEmotion}`);
        
        // 강도 조절 섹션으로 이동
        this.showSection('intensity-section');
    }
    
    /**
     * 강도 확인
     */
    confirmIntensity() {
        this.currentIntensity = this.intensitySlider.getIntensity();
        
        console.log(`감정 강도: ${this.currentIntensity} (${this.intensitySlider.getIntensityLevel()})`);
        
        // 게임 섹션으로 이동 및 정보 표시
        document.getElementById('game-emotion').textContent = this.currentEmotion;
        document.getElementById('game-intensity').textContent = this.currentIntensity;
        
        this.showSection('game-section');
        
        // 게임 캔버스 그리기
        this.tetris.draw();
    }
    
    /**
     * 게임 시작
     */
    startGame() {
        console.log(`게임 시작 - 감정: ${this.currentEmotion}, 강도: ${this.currentIntensity}`);
        
        this.tetris.start();
        
        // 버튼 상태 변경
        document.getElementById('start-game').disabled = true;
        document.getElementById('pause-game').disabled = false;
        
        // 백엔드로 데이터 전송 (추후 구현)
        this.sendDataToBackend({
            emotion: this.currentEmotion,
            intensity: this.currentIntensity,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * 앱 재시작
     */
    restartApp() {
        // 확인 대화상자
        if (!confirm('처음부터 다시 시작하시겠습니까?')) {
            return;
        }
        
        // 상태 초기화
        this.currentEmotion = null;
        this.currentIntensity = null;
        
        // 모듈 초기화
        this.emotionWheel.reset();
        this.intensitySlider.reset();
        
        // UI 초기화
        document.getElementById('selected-emotion').classList.add('hidden');
        document.getElementById('spin-button').disabled = false;
        document.getElementById('start-game').disabled = false;
        document.getElementById('pause-game').disabled = true;
        
        // 첫 화면으로 이동
        this.showSection('emotion-section');
        
        console.log('앱 재시작됨');
    }
    
    /**
     * 백엔드로 데이터 전송 (placeholder)
     */
    sendDataToBackend(data) {
        console.log('백엔드로 전송할 데이터:', data);
        
        // TODO: api/backend.js 연동
        // 실제 구현 시 fetch API나 axios를 사용하여 서버로 전송
        /*
        fetch('/api/emotion-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        */
    }
    
    /**
     * 감정 및 강도 데이터 가져오기
     */
    getCurrentData() {
        return {
            emotion: this.currentEmotion,
            intensity: this.currentIntensity,
            intensityLevel: this.intensitySlider.getIntensityLevel(),
            intensityColor: this.intensitySlider.getIntensityColor()
        };
    }
}

// DOM이 로드되면 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    
    // 디버깅을 위해 전역으로 노출
    window.app = app;
    
    console.log('감정 VR 애플리케이션이 시작되었습니다.');
});
