import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  profile: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verificar se token ainda é válido
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          // Token inválido, limpar storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Resposta inválida do servidor');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error: any) {
      // Re-throw para que o componente possa tratar
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Limpar token e dados do usuário
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Opcional: chamar API para invalidar token no servidor (se implementado)
      // await api.post('/auth/logout');
    } catch (error) {
      // Mesmo se houver erro, limpar localmente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

