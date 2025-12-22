import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionContext } from '../contexts/PermissionContext';
import api from '../services/api';

/**
 * Hook para verificar permissões do usuário atual
 * Agora usa o contexto de permissões que tem cache integrado
 */
export const usePermission = (module: string, action: string) => {
  const { user } = useAuth();
  const { checkPermission, cache } = usePermissionContext();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      // Admin tem todas as permissões
      if (user?.profile === 'admin') {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      if (!user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      // Verificar se já está no cache (síncrono) e se ainda é válido
      const cacheKey = `${module}:${action}`;
      const cached = cache[cacheKey];
      const now = Date.now();
      const CACHE_TTL = 30000; // 30 segundos
      
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        setHasPermission(cached.value);
        setLoading(false);
        return;
      }

      // Se não está no cache, verificar (vai atualizar o cache automaticamente)
      try {
        const has = await checkPermission(module, action);
        setHasPermission(has);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [module, action, user, checkPermission, cache]);

  return { hasPermission, loading };
};

/**
 * Hook para verificar múltiplas permissões (retorna true se tiver pelo menos uma)
 */
export const useAnyPermission = (...permissions: Array<{ module: string; action: string }>) => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      // Admin tem todas as permissões
      if (user?.profile === 'admin') {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      if (!user || permissions.length === 0) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        const checks = await Promise.all(
          permissions.map(p =>
            api
              .get('/permissions/check', { params: { module: p.module, action: p.action } })
              .then(res => res.data.hasPermission)
              .catch(() => false)
          )
        );
        setHasPermission(checks.some(check => check === true));
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [permissions, user]);

  return { hasPermission, loading };
};

/**
 * Hook para verificar se usuário tem permissão de visualizar um módulo
 */
export const useCanView = (module: string) => {
  return usePermission(module, 'view');
};
