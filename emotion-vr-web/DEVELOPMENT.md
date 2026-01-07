# 개발 가이드 (DEVELOPMENT.md)

이 문서는 감정 VR 웹 애플리케이션 개발을 위한 가이드입니다.

## 🏗️ 아키텍처

### 모듈 구조

프로젝트는 모듈화된 JavaScript 클래스로 구성되어 있습니다:

```
App (main.js)
├── EmotionWheel (emotionWheel.js)
├── IntensitySlider (intensitySlider.js)
└── Tetris (tetris.js)
```

### 데이터 흐름

1. **감정 선택**
   - EmotionWheel → CustomEvent 'emotionSelected' → App
   - App이 선택된 감정 저장

2. **강도 조절**
   - IntensitySlider → App.confirmIntensity()
   - App이 강도 값 저장

3. **게임 시작**
   - App → Tetris.start()
   - 감정 및 강도 데이터와 함께 게임 시작

4. **백엔드 전송** (준비됨)
   - App → BackendAPI → 서버

## 🔧 개발 환경 설정

### 필수 요구사항

- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 로컬 웹 서버 (선택사항)

### 추천 도구

- **에디터**: VS Code, WebStorm
- **브라우저 개발자 도구**: Chrome DevTools
- **버전 관리**: Git

### 로컬 서버 실행

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

## 📚 코드 스타일 가이드

### JavaScript

- **ES6+ 문법** 사용
- **클래스 기반** 구조
- **camelCase** 변수명
- **명확한 함수명**: 동사 + 명사 형태
- **JSDoc 주석** 사용 권장

```javascript
/**
 * 함수 설명
 * @param {type} paramName - 파라미터 설명
 * @returns {type} 반환값 설명
 */
function exampleFunction(paramName) {
    // 구현
}
```

### CSS

- **모바일 우선** 접근
- **BEM 방법론** 또는 명확한 클래스명
- **CSS 변수** 사용 권장
- **반응형 디자인** 필수

### HTML

- **시맨틱 태그** 사용
- **접근성** 고려 (ARIA 속성)
- **명확한 ID와 클래스명**

## 🧪 테스트

### 수동 테스트 체크리스트

#### 감정 룰렛
- [ ] 룰렛이 정상적으로 회전하는가?
- [ ] 회전 후 감정이 선택되는가?
- [ ] 선택된 감정이 올바르게 표시되는가?
- [ ] 여러 번 회전 가능한가?

#### 강도 슬라이더
- [ ] 슬라이더가 1~10 범위에서 작동하는가?
- [ ] 값이 실시간으로 업데이트되는가?
- [ ] 색상이 강도에 따라 변하는가?

#### 테트리스 게임
- [ ] 게임이 정상적으로 시작되는가?
- [ ] 모든 키 입력이 작동하는가?
- [ ] 블록이 정상적으로 쌓이는가?
- [ ] 라인 클리어가 작동하는가?
- [ ] 점수가 정확하게 계산되는가?
- [ ] 게임 오버가 정상적으로 처리되는가?

#### 전체 흐름
- [ ] 감정 선택 → 강도 조절 → 게임 순서가 올바른가?
- [ ] 다시 시작 기능이 작동하는가?
- [ ] 모든 섹션 전환이 부드러운가?

### 브라우저 호환성

테스트해야 할 브라우저:
- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 🐛 디버깅

### 콘솔 로그 활용

앱 객체가 전역으로 노출되어 있습니다:

```javascript
// 콘솔에서 접근 가능
window.app.getCurrentData();
window.app.emotionWheel.getSelectedEmotion();
window.app.intensitySlider.getIntensity();
```

### 일반적인 문제

1. **캔버스가 표시되지 않음**
   - 브라우저 콘솔에서 오류 확인
   - Canvas API 지원 여부 확인

2. **키보드 입력이 작동하지 않음**
   - 포커스가 올바른 요소에 있는지 확인
   - 이벤트 리스너가 올바르게 설정되었는지 확인

3. **애니메이션이 끊김**
   - requestAnimationFrame 사용 확인
   - 성능 프로파일러로 병목 지점 찾기

## 🔌 백엔드 통합

### API 엔드포인트 (예정)

```
POST /api/emotion-data
- 감정 및 강도 데이터 전송

POST /api/game-results
- 게임 결과 저장

POST /api/session/start
- 세션 시작

POST /api/session/end
- 세션 종료

GET /api/statistics
- 통계 데이터 조회
```

### 데이터 형식

```javascript
// 감정 데이터
{
    emotion: "기쁨",
    intensity: 8,
    timestamp: "2024-01-01T12:00:00.000Z"
}

// 게임 결과
{
    emotion: "기쁨",
    intensity: 8,
    score: 1500,
    level: 5,
    lines: 25,
    playTime: 180,
    timestamp: "2024-01-01T12:03:00.000Z"
}
```

## 📝 Copilot 작업 가이드

### GitHub Copilot 활용 팁

1. **명확한 주석 작성**
   ```javascript
   // 감정 데이터를 백엔드로 전송하는 함수
   async function sendEmotionData(data) {
       // Copilot이 구현 제안
   }
   ```

2. **함수 시그니처 먼저 작성**
   ```javascript
   function calculateScore(linesCleared, level) {
       // Copilot이 로직 제안
   }
   ```

3. **예시 데이터 제공**
   ```javascript
   // 예시: { emotion: "기쁨", intensity: 8 }
   function processEmotionData(data) {
       // Copilot이 처리 로직 제안
   }
   ```

### 작업 우선순위

1. **P0 - 핵심 기능**
   - [x] 감정 룰렛 구현
   - [x] 강도 슬라이더 구현
   - [x] 테트리스 게임 구현
   - [x] 전체 앱 흐름 관리

2. **P1 - 백엔드 연동**
   - [ ] 백엔드 API 구현
   - [ ] 데이터 전송 로직
   - [ ] 에러 처리

3. **P2 - 개선사항**
   - [ ] 사운드 효과
   - [ ] 더 많은 게임 모드
   - [ ] 통계 및 분석 화면
   - [ ] 다국어 지원

4. **P3 - 고급 기능**
   - [ ] VR 헤드셋 통합
   - [ ] 음성 인식
   - [ ] 멀티플레이어

## 🚀 배포

### 정적 호스팅

이 프로젝트는 순수 HTML/CSS/JavaScript로 구성되어 있어 정적 호스팅이 가능합니다:

- **GitHub Pages**
- **Netlify**
- **Vercel**
- **AWS S3 + CloudFront**

### 배포 전 체크리스트

- [ ] 모든 기능 테스트 완료
- [ ] 브라우저 호환성 확인
- [ ] 성능 최적화
- [ ] 이미지 및 리소스 최적화
- [ ] 콘솔 에러 없음
- [ ] 모바일 반응형 확인

## 📞 문의

프로젝트 관련 문의사항이 있으면 이슈를 생성해주세요.

---

**Happy Coding! 🎮**
