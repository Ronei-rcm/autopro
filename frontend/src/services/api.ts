import axios from 'axios';

// Usa o proxy do Vite em desenvolvimento, ou a URL configurada em produção
const getBaseURL = () => {
  // Em desenvolvimento, sempre usa o proxy do Vite
  if (import.meta.env.DEV) {
    return '/api';
  }
  // Em produção, usa a URL configurada ou padrão
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
      if (error.response.status === 500) {
        error.message = error.response.data?.error || 'Erro interno do servidor. Verifique se o backend está rodando corretamente.';
      } else {
        error.message = error.response.data?.error || error.response.data?.message || error.message;
      }
    } else if (error.request) {
      // Erro de rede - servidor não respondeu
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.message = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
      } else {
        error.message = 'Erro de conexão. Verifique sua internet.';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

