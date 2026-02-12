import { supabase } from './supabase';

// 사용자 생성 (중복 시 기존 사용자 반환)
export const createUser = async (userData) => {
  // 중복 확인: 이름 + 생년월일 + 전화번호 뒷자리
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('name', userData.name)
    .eq('birthdate', userData.birthdate)
    .eq('phone_last_four', userData.phone_last_four)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// AAQ-II 응답 저장
export const saveAAQResponses = async (userId, responses) => {
  const rows = responses.map((value, idx) => ({
    user_id: userId,
    item_number: idx + 1,
    response: value,
  }));

  const { error } = await supabase.from('aaq_responses').insert(rows);
  if (error) throw error;
};

// PANAS 응답 저장
export const savePANASResponses = async (userId, responses) => {
  const rows = responses.map((item) => ({
    user_id: userId,
    item_text: item.item,
    item_type: item.type,
    response: item.value,
  }));

  const { error } = await supabase.from('panas_responses').insert(rows);
  if (error) throw error;
};

// 감정 데이터 일괄 저장
export const createEmotionsBatch = async (userId, emotions) => {
  const rows = emotions.map((e) => ({
    user_id: userId,
    emotion_name: e.emotion,
    intensity: e.intensity,
    color: e.color,
    sequence_order: e.sequence_order,
  }));

  const { error } = await supabase.from('emotions').insert(rows);
  if (error) throw error;
};
