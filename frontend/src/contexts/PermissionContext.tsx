import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface PermissionCacheEntry {
  value: boolean;
  timestamp: number;
}

interface PermissionCache {
  [key: string]: PermissionCacheEntry; // key: "module:action"
}

const CACHE_TTL = 30000; // 30 segundos - tempo suficiente para evitar muitas requisições, mas curto o suficiente para refletir mudanças rapidamente

interface PermissionContextType {
  checkPermission: (module: string, action: string) => Promise<boolean>;
  checkMultiplePermissions: (permissions: Array<{ module: string; action: string }>) => Promise<Record<string, boolean>>;
  clearCache: () => void;
  cache: PermissionCache;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cache, setCache] = useState<PermissionCache>({});
  const cacheRef = useRef<PermissionCache>({});

  // Sincronizar ref com state
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  // Limpar cache quando usuário mudar
  useEffect(() => {
    setCache({});
    cacheRef.current = {};
  }, [user?.id]);

  const checkPermission = useCallback(async (module: string, action: string): Promise<boolean> => {
    // Admin tem todas as permissões
    if (user?.profile === 'admin') {
      return true;
    }

    if (!user) {
      return false;
    }

    const cacheKey = `${module}:${action}`;
    const now = Date.now();

    try {
      // Verificar cache usando ref (síncrono) e se ainda é válido
      const cached = cacheRef.current[cacheKey];
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return cached.value;
      }

      // Se não está no cache ou expirou, fazer requisição
      const response = await api.get('/permissions/check', {
        params: { module, action },
      });
      const hasPermission = response.data.hasPermission;
      
      // Atualizar cache com timestamp
      setCache(prev => ({
        ...prev,
        [cacheKey]: { value: hasPermission, timestamp: now },
      }));
      
      return hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      // Em caso de erro, não cachear e retornar false
      return false;
    }
  }, [user?.id, user?.profile]);

  const checkMultiplePermissions = useCallback(async (
    permissions: Array<{ module: string; action: string }>
  ): Promise<Record<string, boolean>> => {
    // Admin tem todas as permissões
    if (user?.profile === 'admin') {
      const result: Record<string, boolean> = {};
      permissions.forEach(({ module, action }) => {
        result[`${module}:${action}`] = true;
      });
      return result;
    }

    if (!user || permissions.length === 0) {
      return {};
    }

    // Filtrar permissões que já estão no cache usando ref e são válidas
    const uncached: Array<{ module: string; action: string; key: string }> = [];
    const result: Record<string, boolean> = {};
    const now = Date.now();

    permissions.forEach(({ module, action }) => {
      const key = `${module}:${action}`;
      const cached = cacheRef.current[key];
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        result[key] = cached.value;
      } else {
        uncached.push({ module, action, key });
      }
    });

    // Se todas já estão em cache, retornar
    if (uncached.length === 0) {
      return result;
    }

    try {
      // Fazer requisição em lote
      const response = await api.post('/permissions/check-batch', {
        permissions: uncached.map(({ module, action }) => ({ module, action })),
      });

      // Atualizar cache e resultado
      const newCacheEntries: PermissionCache = {};
      Object.entries(response.data.permissions || {}).forEach(([key, hasPermission]) => {
        result[key] = hasPermission as boolean;
        newCacheEntries[key] = { value: hasPermission as boolean, timestamp: now };
      });

      // Atualizar cache
      if (Object.keys(newCacheEntries).length > 0) {
        setCache(prev => ({
          ...prev,
          ...newCacheEntries,
        }));
      }

      return result;
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      // Em caso de erro, retornar false para todas as não cacheadas
      uncached.forEach(({ key }) => {
        result[key] = false;
      });
      return result;
    }
  }, [user?.id, user?.profile]);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        checkPermission,
        checkMultiplePermissions,
        clearCache,
        cache,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};

