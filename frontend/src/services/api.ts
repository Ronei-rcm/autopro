import axios from 'axios';

// Usa o proxy do Vite em desenvolvimento, ou a URL configurada em produção
const getBaseURL = () => {
  // Se estiver em desenvolvimento e não tiver VITE_API_URL, usa o proxy
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redirecionar se já estiver na página de login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Melhorar mensagem de erro
    if (error.response) {
      // Erro da API
      error.message = error.response.data?.error || error.response.data?.message || error.message;
    } else if (error.request) {
      // Erro de rede
      error.message = 'Erro de conexão. Verifique sua internet.';
    }
    
    return Promise.reject(error);
  }
);

export default api;

