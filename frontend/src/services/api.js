import axios from 'axios';
import toast from 'react-hot-toast';

const getBaseURL = () => {
  // In production browser environments (e.g. Vercel), always route to relative '/api'
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token and enforce relative /api on Vercel
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (config.baseURL && config.baseURL.includes('localhost:5000')) {
        config.baseURL = '/api';
      }
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error & 401 Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied: Insufficient privileges.');
    }

    return Promise.reject(error);
  }
);

export default api;
