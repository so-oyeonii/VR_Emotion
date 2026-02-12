import axios from 'axios';

// 환경 변수 사용 (개발: /api 프록시, 프로덕션: 백엔드 URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// API functions
export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const createEmotionsBatch = async (userId, emotions) => {
  const response = await api.post(`/emotions/batch?user_id=${userId}`, emotions);
  return response.data;
};

export default api;
