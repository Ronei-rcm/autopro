import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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


// Retry logic para requisições falhadas
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Interceptor para tratar erros e retry automático
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
    
    // Retry automático apenas para erros de rede (sem resposta do servidor)
    if (!error.response && error.request && config && !config._retry) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;

      if (config._retryCount <= MAX_RETRIES) {
        console.log(`🔄 Tentativa ${config._retryCount} de ${MAX_RETRIES} para ${config.url}`);
        await sleep(RETRY_DELAY * config._retryCount); // Backoff exponencial
        return api.request(config);
      }
    }

    // Não redirecionar se já estiver na página de login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Melhorar mensagem de erro
    const axiosError = error as AxiosError & { message?: string; code?: string };
    if (error.response) {
      // Erro da API
      if (error.response.status === 500) {
        axiosError.message = (error.response.data as any)?.error || 'Erro interno do servidor. Verifique se o backend está rodando corretamente.';
      } else {
        axiosError.message = (error.response.data as any)?.error || (error.response.data as any)?.message || axiosError.message || 'Erro desconhecido';
      }
    } else if (error.request) {
      // Erro de rede - servidor não respondeu
      if (axiosError.code === 'ECONNREFUSED' || axiosError.message?.includes('Network Error')) {
        axiosError.message = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
      } else {
        axiosError.message = 'Erro de conexão. Verifique sua internet.';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

