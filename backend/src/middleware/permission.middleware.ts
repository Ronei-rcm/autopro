import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { PermissionModel } from '../models/permission.model';
import { UserProfile } from '../types';

/**
 * Middleware para verificar permissão específica
 * @param module Módulo (ex: 'orders', 'clients')
 * @param action Ação (ex: 'create', 'edit', 'delete')
 */
export const requirePermission = (module: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userProfile) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const hasPermission = await PermissionModel.hasPermission(
        req.userProfile as UserProfile,
        module,
        action
      );

      if (!hasPermission) {
        res.status(403).json({ 
          error: 'Acesso negado',
          message: `Você não tem permissão para ${action} em ${module}`
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ error: 'Erro ao verificar permissão' });
    }
  };
};

/**
 * Middleware para verificar múltiplas permissões (OR - pelo menos uma)
 */
export const requireAnyPermission = (...permissions: Array<{ module: string; action: string }>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userProfile) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const checks = await Promise.all(
        permissions.map(p => 
          PermissionModel.hasPermission(req.userProfile as UserProfile, p.module, p.action)
        )
      );

      if (!checks.some(check => check === true)) {
        res.status(403).json({ 
          error: 'Acesso negado',
          message: 'Você não tem permissão para realizar esta ação'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ error: 'Erro ao verificar permissão' });
    }
  };
};

/**
 * Middleware para verificar múltiplas permissões (AND - todas)
 */
export const requireAllPermissions = (...permissions: Array<{ module: string; action: string }>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userProfile) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const checks = await Promise.all(
        permissions.map(p => 
          PermissionModel.hasPermission(req.userProfile as UserProfile, p.module, p.action)
        )
      );

      if (!checks.every(check => check === true)) {
        res.status(403).json({ 
          error: 'Acesso negado',
          message: 'Você não tem todas as permissões necessárias'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ error: 'Erro ao verificar permissão' });
    }
  };
};
