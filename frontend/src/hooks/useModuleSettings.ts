import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

/**
 * Hook para verificar configurações de módulos (ocultos/visíveis)
 */
export const useModuleSettings = () => {
  const { user } = useAuth();
  const [hiddenModules, setHiddenModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHiddenModules = async () => {
      if (!user) {
        setHiddenModules([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/module-settings/hidden');
        setHiddenModules(response.data.modules || []);
      } catch (error) {
        console.error('Error loading hidden modules:', error);
        // Em caso de erro, assumir que não há módulos ocultos
        setHiddenModules([]);
      } finally {
        setLoading(false);
      }
    };

    loadHiddenModules();
  }, [user]);

  const isModuleHidden = (module: string): boolean => {
    return hiddenModules.includes(module);
  };

  return { hiddenModules, isModuleHidden, loading };
};

