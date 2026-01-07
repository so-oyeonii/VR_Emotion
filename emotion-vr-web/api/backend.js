/**
 * backend.js
 * 백엔드 연결 준비 (미구현)
 */

/**
 * 백엔드 API 클래스
 * 추후 서버와의 통신을 위한 준비
 */
class BackendAPI {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }
    
    /**
     * 감정 데이터 전송
     * @param {Object} data - 감정, 강도, 타임스탬프 등의 데이터
     * @returns {Promise}
     */
    async sendEmotionData(data) {
        try {
            const response = await fetch(`${this.baseURL}/emotion-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('감정 데이터 전송 실패:', error);
            throw error;
        }
    }
    
    /**
     * 게임 결과 전송
     * @param {Object} gameData - 점수, 레벨, 플레이 시간 등
     * @returns {Promise}
     */
    async sendGameResults(gameData) {
        try {
            const response = await fetch(`${this.baseURL}/game-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('게임 결과 전송 실패:', error);
            throw error;
        }
    }
    
    /**
     * 사용자 세션 시작
     * @returns {Promise}
     */
    async startSession() {
        try {
            const response = await fetch(`${this.baseURL}/session/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('세션 시작 실패:', error);
            throw error;
        }
    }
    
    /**
     * 사용자 세션 종료
     * @param {string} sessionId - 세션 ID
     * @returns {Promise}
     */
    async endSession(sessionId) {
        try {
            const response = await fetch(`${this.baseURL}/session/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('세션 종료 실패:', error);
            throw error;
        }
    }
    
    /**
     * 통계 데이터 가져오기
     * @returns {Promise}
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseURL}/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('통계 데이터 가져오기 실패:', error);
            throw error;
        }
    }
}

// 사용 예시 (주석 처리)
/*
const api = new BackendAPI();

// 감정 데이터 전송
api.sendEmotionData({
    emotion: '기쁨',
    intensity: 8,
    timestamp: new Date().toISOString()
})
.then(result => console.log('Success:', result))
.catch(error => console.error('Error:', error));

// 게임 결과 전송
api.sendGameResults({
    emotion: '기쁨',
    intensity: 8,
    score: 1500,
    level: 5,
    lines: 25,
    playTime: 180,
    timestamp: new Date().toISOString()
})
.then(result => console.log('Success:', result))
.catch(error => console.error('Error:', error));
*/

// 모듈 내보내기 (필요 시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackendAPI;
}
