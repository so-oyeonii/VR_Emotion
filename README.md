# VR Emotion Research - 감정 외재화 연구 플랫폼

React + Supabase 기반의 사회적 배제(Cyberball) 실험 및 감정 데이터 수집 플랫폼

## 프로젝트 개요

VR 기반 감정 외재화 연구를 위한 웹 데이터 수집 앱입니다. Cyberball 패러다임(Williams, 2006)을 활용하여 사회적 배제를 유도한 뒤, GEW 프레임워크 기반의 감정 측정을 수행합니다.

## 실험 흐름

```
Phase 1: 사전 설문
  ① 사용자 정보 입력 (/)
  ② AAQ-II 심리적 유연성 척도 (/aaq) — 7문항, 1-7점
  ③ PANAS 정서 척도 (/panas) — 20문항, 1-5점

Phase 2: Cyberball 게임 (/game)
  포함 단계 (1분) → 배제 단계 (2분) = 총 3분
  - 포함: ~35% 확률로 공이 옴
  - 배제: 0% 확률 (화면 변화 없음, 원래 패러다임 준수)

Phase 3: 감정 측정 (/emotion)
  GEW 색상 구체로 감정 선택 (최대 3개) + 강도 1-10

Phase 4: VR 체험 (/complete → VR 헤드셋)
  웹에서 완료 후 VR 헤드셋 착용 (별도 개발)
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19 + Vite, Zustand, React Router |
| Database | Supabase (PostgreSQL, 무료 티어) |
| 게임 | Canvas API (Cyberball) |
| 감정 색상 | Jonauskaite et al. + GEW 프레임워크 |

## 프로젝트 구조

```
VR_Emotion/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── UserInfo.jsx        # 사용자 정보 입력
│       │   ├── AAQ.jsx             # AAQ-II 척도
│       │   ├── PANAS.jsx           # PANAS 척도
│       │   ├── CyberballGame.jsx   # Cyberball 게임 화면
│       │   ├── EmotionSelect.jsx   # GEW 감정 구체 선택 + 강도
│       │   └── Completion.jsx      # 완료 + VR 안내
│       ├── hooks/
│       │   └── useCyberball.js     # Cyberball 게임 로직
│       ├── store/
│       │   └── useStore.js         # Zustand 전역 상태
│       ├── services/
│       │   ├── supabase.js         # Supabase 클라이언트
│       │   └── api.js              # DB 통신 함수
│       └── App.jsx                 # 라우팅
│
├── supabase-schema.sql             # Supabase 테이블 생성 SQL
└── README.md
```

## 시작하기

### 1. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com)에서 무료 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 실행 (테이블 + RLS 설정)
3. Settings > API에서 URL과 anon key 복사

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# .env 파일에 Supabase URL과 anon key 입력

npm install
npm run dev
```

## DB 스키마

| 테이블 | 설명 | 컬럼 |
|--------|------|------|
| `users` | 참가자 정보 | id, name, birthdate, phone_last_four |
| `aaq_responses` | AAQ-II 응답 | user_id, item_number(1-7), response(1-7) |
| `panas_responses` | PANAS 응답 | user_id, item_text, item_type(PA/NA), response(1-5) |
| `emotions` | 감정 선택 | user_id, emotion_name, intensity(1-10), color, sequence_order |

## 데이터 내보내기

Supabase 대시보드에서 별도 어드민 없이 CSV 다운로드 가능:
- **Table Editor** > 테이블 선택 > CSV 다운로드
- **SQL Editor** > 조인 쿼리 실행 > Export

```sql
SELECT u.name, u.birthdate, u.phone_last_four,
       e.emotion_name, e.intensity, e.color, e.sequence_order
FROM users u
LEFT JOIN emotions e ON u.id = e.user_id
ORDER BY u.created_at, e.sequence_order;
```

## Cyberball 게임 설계

Williams & Jarvis (2006) 원래 패러다임 준수:

| 항목 | 포함 단계 | 배제 단계 |
|------|-----------|-----------|
| 시간 | 1분 | 2분 |
| 공 확률 | ~35% | 0% |
| 화면 변화 | 없음 | 없음 (원래 패러다임) |
| 던지기 제한 | 5초 내 선택 (자동 던지기) | - |

## 감정 색상 (GEW + Jonauskaite et al.)

| 감정 | Hex | 근거 |
|------|-----|------|
| 분노 | `#D32F2F` | 빨강-분노 73%+ |
| 슬픔 | `#1565C0` | 파랑-슬픔 일관 |
| 소외감 | `#607D8B` | 회색-슬픔 체계적 연결 |
| 수치심 | `#6A1B9A` | 어두운 보라-수치심 |
| 불안 | `#2E7D32` | 어두운 초록-부정감정 |
| 무관심 | `#8D6E63` | 갈색-낮은 각성 |
| 두려움 | `#263238` | 검정-공포 |
| 좌절감 | `#E64A19` | 주황-분노 인접 |
| 놀람 | `#F9A825` | 노랑-놀람 |
| 평온 | `#00ACC1` | 청록-차분 |

## 라이선스

연구 목적으로 개발되었습니다.
