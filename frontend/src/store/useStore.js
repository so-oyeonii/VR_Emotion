import { create } from 'zustand';

const useStore = create((set) => ({
  // User data
  userData: {
    name: '',
    birthdate: '',
    phone_last_four: '',
    userId: null,
  },

  // Questionnaire responses
  aaqResponses: null,     // AAQ-II (7 items, 1-7 scale)
  panasResponses: null,   // PANAS (20 items, 1-5 scale)

  // Selected emotions (max 3, free selection after Cyberball)
  selectedEmotions: [],

  // Emotion intensities (with intensity 1-10)
  emotionIntensities: [],

  // Current screen/step
  // 0: UserInfo, 1: AAQ-II, 2: PANAS, 3: Cyberball, 4: EmotionSelect, 5: Complete
  currentScreen: 0,

  // Actions
  setUserData: (data) => set({ userData: data }),

  setAAQResponses: (responses) => set({ aaqResponses: responses }),

  setPANASResponses: (responses) => set({ panasResponses: responses }),

  addSelectedEmotion: (emotion, color) => set((state) => {
    if (state.selectedEmotions.length >= 3) return state;
    const isDuplicate = state.selectedEmotions.some(e => e.emotion === emotion);
    if (isDuplicate) return state;
    return {
      selectedEmotions: [...state.selectedEmotions, { emotion, color, sequence_order: state.selectedEmotions.length + 1 }]
    };
  }),

  clearSelectedEmotions: () => set({ selectedEmotions: [] }),

  setScreen: (screen) => set({ currentScreen: screen }),

  resetStore: () => set({
    userData: {
      name: '',
      birthdate: '',
      phone_last_four: '',
      userId: null,
    },
    aaqResponses: null,
    panasResponses: null,
    selectedEmotions: [],
    emotionIntensities: [],
    currentScreen: 0,
  }),
}));

export default useStore;
