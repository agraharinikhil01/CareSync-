import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is expired or unauthorized, clear storage and redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
