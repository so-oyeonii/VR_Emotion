-- VR Emotion Research: 통합 테이블 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 기존 테이블이 있다면 먼저 삭제 (주의: 데이터도 삭제됩니다!)
-- DROP TABLE IF EXISTS users, aaq_responses, panas_responses, emotions CASCADE;

-- 통합 실험 데이터 테이블
CREATE TABLE experiment_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- 사용자 정보
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  phone_last_four VARCHAR(4) NOT NULL,
  
  -- AAQ-II 응답 (7문항, 1-7 척도)
  aaq_1 INTEGER CHECK (aaq_1 IS NULL OR (aaq_1 BETWEEN 1 AND 7)),
  aaq_2 INTEGER CHECK (aaq_2 IS NULL OR (aaq_2 BETWEEN 1 AND 7)),
  aaq_3 INTEGER CHECK (aaq_3 IS NULL OR (aaq_3 BETWEEN 1 AND 7)),
  aaq_4 INTEGER CHECK (aaq_4 IS NULL OR (aaq_4 BETWEEN 1 AND 7)),
  aaq_5 INTEGER CHECK (aaq_5 IS NULL OR (aaq_5 BETWEEN 1 AND 7)),
  aaq_6 INTEGER CHECK (aaq_6 IS NULL OR (aaq_6 BETWEEN 1 AND 7)),
  aaq_7 INTEGER CHECK (aaq_7 IS NULL OR (aaq_7 BETWEEN 1 AND 7)),
  
  -- PANAS 응답 (20문항, 1-5 척도)
  -- Positive Affect (PA)
  panas_interested INTEGER CHECK (panas_interested IS NULL OR (panas_interested BETWEEN 1 AND 5)),
  panas_excited INTEGER CHECK (panas_excited IS NULL OR (panas_excited BETWEEN 1 AND 5)),
  panas_strong INTEGER CHECK (panas_strong IS NULL OR (panas_strong BETWEEN 1 AND 5)),
  panas_enthusiastic INTEGER CHECK (panas_enthusiastic IS NULL OR (panas_enthusiastic BETWEEN 1 AND 5)),
  panas_proud INTEGER CHECK (panas_proud IS NULL OR (panas_proud BETWEEN 1 AND 5)),
  panas_alert INTEGER CHECK (panas_alert IS NULL OR (panas_alert BETWEEN 1 AND 5)),
  panas_inspired INTEGER CHECK (panas_inspired IS NULL OR (panas_inspired BETWEEN 1 AND 5)),
  panas_determined INTEGER CHECK (panas_determined IS NULL OR (panas_determined BETWEEN 1 AND 5)),
  panas_attentive INTEGER CHECK (panas_attentive IS NULL OR (panas_attentive BETWEEN 1 AND 5)),
  panas_active INTEGER CHECK (panas_active IS NULL OR (panas_active BETWEEN 1 AND 5)),
  
  -- Negative Affect (NA)
  panas_distressed INTEGER CHECK (panas_distressed IS NULL OR (panas_distressed BETWEEN 1 AND 5)),
  panas_upset INTEGER CHECK (panas_upset IS NULL OR (panas_upset BETWEEN 1 AND 5)),
  panas_guilty INTEGER CHECK (panas_guilty IS NULL OR (panas_guilty BETWEEN 1 AND 5)),
  panas_scared INTEGER CHECK (panas_scared IS NULL OR (panas_scared BETWEEN 1 AND 5)),
  panas_hostile INTEGER CHECK (panas_hostile IS NULL OR (panas_hostile BETWEEN 1 AND 5)),
  panas_irritable INTEGER CHECK (panas_irritable IS NULL OR (panas_irritable BETWEEN 1 AND 5)),
  panas_ashamed INTEGER CHECK (panas_ashamed IS NULL OR (panas_ashamed BETWEEN 1 AND 5)),
  panas_nervous INTEGER CHECK (panas_nervous IS NULL OR (panas_nervous BETWEEN 1 AND 5)),
  panas_jittery INTEGER CHECK (panas_jittery IS NULL OR (panas_jittery BETWEEN 1 AND 5)),
  panas_afraid INTEGER CHECK (panas_afraid IS NULL OR (panas_afraid BETWEEN 1 AND 5)),
  
  -- 감정 선택 (최대 3개, 각각 이름/강도/색상)
  emotion_1_name TEXT,
  emotion_1_intensity INTEGER CHECK (emotion_1_intensity IS NULL OR (emotion_1_intensity BETWEEN 1 AND 10)),
  emotion_1_color VARCHAR(7),
  
  emotion_2_name TEXT,
  emotion_2_intensity INTEGER CHECK (emotion_2_intensity IS NULL OR (emotion_2_intensity BETWEEN 1 AND 10)),
  emotion_2_color VARCHAR(7),
  
  emotion_3_name TEXT,
  emotion_3_intensity INTEGER CHECK (emotion_3_intensity IS NULL OR (emotion_3_intensity BETWEEN 1 AND 10)),
  emotion_3_color VARCHAR(7)
);

-- Row Level Security (RLS) 설정
ALTER TABLE experiment_data ENABLE ROW LEVEL SECURITY;

-- INSERT 허용 (실험 참가자가 데이터 제출)
CREATE POLICY "Allow anonymous insert" ON experiment_data FOR INSERT TO anon WITH CHECK (true);

-- SELECT 허용 (중복 사용자 확인용)
CREATE POLICY "Allow anonymous select" ON experiment_data FOR SELECT TO anon USING (true);

-- UPDATE 허용 (데이터 업데이트용 - AAQ, PANAS, Emotion 단계별 저장)
CREATE POLICY "Allow anonymous update" ON experiment_data FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- === 인덱스 생성 (검색 속도 향상) ===
CREATE INDEX idx_experiment_data_user ON experiment_data(name, birthdate, phone_last_four);
CREATE INDEX idx_experiment_data_created ON experiment_data(created_at);

-- === CSV 다운로드 안내 ===
-- Supabase 대시보드 > Table Editor에서 experiment_data 테이블 선택 후
-- 우측 상단 "..." 메뉴 > "Download as CSV" 클릭
