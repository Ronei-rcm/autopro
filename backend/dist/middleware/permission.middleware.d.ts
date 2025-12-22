import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
/**
 * Middleware para verificar permissão específica
 * @param module Módulo (ex: 'orders', 'clients')
 * @param action Ação (ex: 'create', 'edit', 'delete')
 */
export declare const requirePermission: (module: string, action: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar múltiplas permissões (OR - pelo menos uma)
 */
export declare const requireAnyPermission: (...permissions: Array<{
    module: string;
    action: string;
}>) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar múltiplas permissões (AND - todas)
 */
export declare const requireAllPermissions: (...permissions: Array<{
    module: string;
    action: string;
}>) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=permission.middleware.d.ts.map