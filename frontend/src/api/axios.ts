import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Отправка запроса:', {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers
  });
  return config;
}, (error) => {
  console.error('Ошибка при отправке запроса:', error);
  return Promise.reject(error);
});

// Response interceptor
axiosInstance.interceptors.response.use((response) => {
  console.log('Получен ответ:', {
    url: response.config.url,
    status: response.status,
    data: response.data
  });
  return response;
}, (error) => {
  console.error('Ошибка ответа:', {
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data
  });
  return Promise.reject(error);
});

export default axiosInstance;