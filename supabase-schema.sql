-- VR Emotion Research: Supabase 테이블 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 1. 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  phone_last_four VARCHAR(4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AAQ-II 응답 테이블 (7문항, 1-7 척도)
CREATE TABLE aaq_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_number INTEGER NOT NULL CHECK (item_number BETWEEN 1 AND 7),
  response INTEGER NOT NULL CHECK (response BETWEEN 1 AND 7),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PANAS 응답 테이블 (20문항, 1-5 척도)
CREATE TABLE panas_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_text TEXT NOT NULL,
  item_type VARCHAR(2) NOT NULL CHECK (item_type IN ('PA', 'NA')),
  response INTEGER NOT NULL CHECK (response BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 감정 선택 테이블 (최대 3개, 강도 1-10)
CREATE TABLE emotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  emotion_name TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  color VARCHAR(7),
  sequence_order INTEGER NOT NULL CHECK (sequence_order >= 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- === Row Level Security (RLS) 설정 ===
-- 익명 사용자가 데이터를 INSERT할 수 있도록 허용

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aaq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE panas_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;

-- INSERT 허용 (실험 참가자가 데이터 제출)
CREATE POLICY "Allow anonymous insert" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON aaq_responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON panas_responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON emotions FOR INSERT TO anon WITH CHECK (true);

-- SELECT 허용 (중복 사용자 확인용)
CREATE POLICY "Allow anonymous select" ON users FOR SELECT TO anon USING (true);

-- === 데이터 내보내기용 뷰 (선택사항) ===
-- Supabase SQL Editor에서 아래 쿼리로 전체 데이터를 CSV로 내보낼 수 있습니다:
--
-- SELECT
--   u.name, u.birthdate, u.phone_last_four, u.created_at AS user_created,
--   e.emotion_name, e.intensity, e.color, e.sequence_order,
--   e.created_at AS emotion_created
-- FROM users u
-- LEFT JOIN emotions e ON u.id = e.user_id
-- ORDER BY u.created_at, e.sequence_order;
