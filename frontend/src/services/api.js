import axios from 'axios';

// Codespaces 환경에서는 /api로 프록시 사용
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// API functions
export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const getUser = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const createEmotion = async (emotionData) => {
  const response = await api.post('/emotions/', emotionData);
  return response.data;
};

export const createEmotionsBatch = async (userId, emotions) => {
  const response = await api.post(`/emotions/batch?user_id=${userId}`, emotions);
  return response.data;
};

export const getUserEmotions = async (userId) => {
  const response = await api.get(`/emotions/user/${userId}`);
  return response.data;
};

export default api;
