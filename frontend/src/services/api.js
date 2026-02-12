import { supabase } from './supabase';

// 실험 데이터 생성 (사용자 정보 입력 시)
export const createExperiment = async (userData) => {
  // 중복 확인: 이름 + 생년월일 + 전화번호 뒷자리
  const { data: existing } = await supabase
    .from('experiment_data')
    .select('*')
    .eq('name', userData.name)
    .eq('birthdate', userData.birthdate)
    .eq('phone_last_four', userData.phone_last_four)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('experiment_data')
    .insert({
      name: userData.name,
      birthdate: userData.birthdate,
      phone_last_four: userData.phone_last_four
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// AAQ-II 응답 저장 (UPDATE)
export const saveAAQResponses = async (experimentId, responses) => {
  const updateData = {};
  responses.forEach((value, idx) => {
    updateData[`aaq_${idx + 1}`] = value;
  });

  const { error } = await supabase
    .from('experiment_data')
    .update(updateData)
    .eq('id', experimentId);

  if (error) throw error;
};

// PANAS 응답 저장 (UPDATE)
export const savePANASResponses = async (experimentId, responses) => {
  const updateData = {};
  
  // PANAS 항목 이름을 컬럼명으로 매핑
  const panasMapping = {
    'interested': 'panas_interested',
    'excited': 'panas_excited',
    'strong': 'panas_strong',
    'enthusiastic': 'panas_enthusiastic',
    'proud': 'panas_proud',
    'alert': 'panas_alert',
    'inspired': 'panas_inspired',
    'determined': 'panas_determined',
    'attentive': 'panas_attentive',
    'active': 'panas_active',
    'distressed': 'panas_distressed',
    'upset': 'panas_upset',
    'guilty': 'panas_guilty',
    'scared': 'panas_scared',
    'hostile': 'panas_hostile',
    'irritable': 'panas_irritable',
    'ashamed': 'panas_ashamed',
    'nervous': 'panas_nervous',
    'jittery': 'panas_jittery',
    'afraid': 'panas_afraid'
  };

  responses.forEach((item) => {
    const columnName = panasMapping[item.item.toLowerCase()];
    if (columnName) {
      updateData[columnName] = item.value;
    }
  });

  const { error } = await supabase
    .from('experiment_data')
    .update(updateData)
    .eq('id', experimentId);

  if (error) throw error;
};

// 감정 데이터 저장 (UPDATE)
export const saveEmotions = async (experimentId, emotions) => {
  const updateData = {};
  
  emotions.forEach((e, idx) => {
    const num = idx + 1;
    updateData[`emotion_${num}_name`] = e.emotion;
    updateData[`emotion_${num}_intensity`] = e.intensity;
    updateData[`emotion_${num}_color`] = e.color;
  });

  const { error } = await supabase
    .from('experiment_data')
    .update(updateData)
    .eq('id', experimentId);

  if (error) throw error;
};

// 레거시 함수들 (호환성 유지)
export const createUser = createExperiment;
export const createEmotionsBatch = saveEmotions;
