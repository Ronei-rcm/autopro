import { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionGuardProps {
  module: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Componente que renderiza children apenas se o usuário tiver a permissão necessária
 */
export const PermissionGuard = ({
  module,
  action,
  children,
  fallback = null,
  requireAdmin = false,
}: PermissionGuardProps) => {
  const { user } = useAuth();
  const { hasPermission, loading } = usePermission(module, action);

  // Se requer admin e não é admin, não mostrar
  if (requireAdmin && user?.profile !== 'admin') {
    return <>{fallback}</>;
  }

  // Se está carregando, não mostrar nada (ou mostrar loading)
  if (loading) {
    return <>{fallback}</>;
  }

  // Se tem permissão, mostrar children
  if (hasPermission) {
    return <>{children}</>;
  }

  // Se não tem permissão, mostrar fallback
  return <>{fallback}</>;
};

/**
 * Componente que renderiza children apenas se o usuário for admin
 */
export const AdminOnly = ({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.profile === 'admin') {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};
