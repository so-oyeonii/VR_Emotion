import { create } from 'zustand';

const useStore = create((set) => ({
  // User data
  userData: {
    name: '',
    birthdate: '',
    phone_last_four: '',
    userId: null,
  },
  
  // Selected emotions from the wheel (3개 선택)
  selectedEmotions: [],
  
  // Emotion intensities (강도 조절 후)
  emotionIntensities: [],
  
  // Current screen/step (0: UserInfo, 1: Tetris, 2: EmotionWheel, 3: Intensity, 4: Complete)
  currentScreen: 0,
  
  // Actions
  setUserData: (data) => set({ userData: data }),
  
  addSelectedEmotion: (emotion, color) => set((state) => {
    // 최대 5개까지 (직접 선택 3개 + 룰렛 2개)
    if (state.selectedEmotions.length >= 5) {
      console.log('이미 5개 선택됨, 추가 불가');
      return state;
    }
    
    // 중복 체크
    const isDuplicate = state.selectedEmotions.some(e => e.emotion === emotion);
    if (isDuplicate) {
      console.log('중복된 감정:', emotion);
      return state;
    }
    
    console.log('감정 추가 성공:', emotion, color);
    return {
      selectedEmotions: [...state.selectedEmotions, { emotion, color, sequence_order: state.selectedEmotions.length + 1 }]
    };
  }),
  
  removeSelectedEmotion: (index) => set((state) => ({
    selectedEmotions: state.selectedEmotions.filter((_, i) => i !== index)
  })),
  
  clearSelectedEmotions: () => set({ selectedEmotions: [] }),
  
  setIntensity: (index, intensity) => set((state) => {
    const newIntensities = [...state.emotionIntensities];
    newIntensities[index] = {
      ...newIntensities[index],
      intensity
    };
    return { emotionIntensities: newIntensities };
  }),
  
  initializeIntensities: () => set((state) => ({
    emotionIntensities: state.selectedEmotions.map((item, index) => ({
      emotion: item.emotion,
      color: item.color,
      intensity: 5,  // 기본값 5
      sequence_order: index + 1
    }))
  })),
  
  nextScreen: () => set((state) => ({ 
    currentScreen: Math.min(state.currentScreen + 1, 4) 
  })),
  
  prevScreen: () => set((state) => ({ 
    currentScreen: Math.max(state.currentScreen - 1, 0) 
  })),
  
  setScreen: (screen) => set({ currentScreen: screen }),
  
  resetStore: () => set({
    userData: {
      name: '',
      birthdate: '',
      phone_last_four: '',
      userId: null,
    },
    selectedEmotions: [],
    emotionIntensities: [],
    currentScreen: 0,
  }),
}));

export default useStore;
