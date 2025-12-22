import { Response } from 'express';
import { PermissionModel } from '../models/permission.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserProfile } from '../types';
import { body, validationResult } from 'express-validator';

export class PermissionController {
  // Listar todas as permissões (apenas admin)
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const permissions = await PermissionModel.findAll();
      res.json(permissions);
    } catch (error) {
      console.error('Get all permissions error:', error);
      res.status(500).json({ error: 'Erro ao buscar permissões' });
    }
  }

  // Buscar permissões de um perfil
  static async getByProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const profile = req.params.profile as UserProfile;
      const includeHidden = req.query.includeHidden === 'true';
      
      if (!['admin', 'mechanic', 'financial', 'attendant'].includes(profile)) {
        res.status(400).json({ error: 'Perfil inválido' });
        return;
      }

      const permissions = await PermissionModel.findByProfile(profile, includeHidden);
      res.json(permissions);
    } catch (error) {
      console.error('Get permissions by profile error:', error);
      res.status(500).json({ error: 'Erro ao buscar permissões do perfil' });
    }
  }

  // Buscar permissões agrupadas por módulo
  static async getGroupedByModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const profile = req.params.profile as UserProfile;
      const includeHidden = req.query.includeHidden === 'true';
      
      if (!['admin', 'mechanic', 'financial', 'attendant'].includes(profile)) {
        res.status(400).json({ error: 'Perfil inválido' });
        return;
      }

      const grouped = await PermissionModel.findGroupedByModule(profile, includeHidden);
      res.json(grouped);
    } catch (error) {
      console.error('Get grouped permissions error:', error);
      res.status(500).json({ error: 'Erro ao buscar permissões agrupadas' });
    }
  }

  // Atualizar permissões de um perfil
  static async updateProfilePermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const profile = req.params.profile as UserProfile;
      
      if (!['admin', 'mechanic', 'financial', 'attendant'].includes(profile)) {
        res.status(400).json({ error: 'Perfil inválido' });
        return;
      }

      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        res.status(400).json({ error: 'Permissões devem ser um array' });
        return;
      }

      // Validar estrutura
      for (const perm of permissions) {
        if (typeof perm.permission_id !== 'number' || typeof perm.granted !== 'boolean') {
          res.status(400).json({ error: 'Estrutura de permissão inválida' });
          return;
        }
      }

      await PermissionModel.updateProfilePermissions(profile, permissions);
      res.json({ message: 'Permissões atualizadas com sucesso' });
    } catch (error) {
      console.error('Update profile permissions error:', error);
      res.status(500).json({ error: 'Erro ao atualizar permissões' });
    }
  }

  // Verificar se usuário atual tem permissão
  static async checkPermission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { module, action } = req.query;

      if (!module || !action || typeof module !== 'string' || typeof action !== 'string') {
        res.status(400).json({ error: 'Módulo e ação são obrigatórios' });
        return;
      }

      if (!req.userProfile) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const hasPermission = await PermissionModel.hasPermission(
        req.userProfile as UserProfile,
        module,
        action
      );

      res.json({ hasPermission });
    } catch (error) {
      console.error('Check permission error:', error);
      res.status(500).json({ error: 'Erro ao verificar permissão' });
    }
  }

  // Verificar múltiplas permissões em lote
  static async checkBatchPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userProfile) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        res.status(400).json({ error: 'Permissões devem ser um array' });
        return;
      }

      // Validar estrutura
      for (const perm of permissions) {
        if (typeof perm.module !== 'string' || typeof perm.action !== 'string') {
          res.status(400).json({ error: 'Cada permissão deve ter module e action como string' });
          return;
        }
      }

      // Verificar todas as permissões em paralelo
      const checks = await Promise.all(
        permissions.map(async (perm: { module: string; action: string }) => {
          const hasPermission = await PermissionModel.hasPermission(
            req.userProfile as UserProfile,
            perm.module,
            perm.action
          );
          return {
            key: `${perm.module}:${perm.action}`,
            hasPermission,
          };
        })
      );

      // Construir objeto de resultado
      const result: Record<string, boolean> = {};
      checks.forEach(({ key, hasPermission }) => {
        result[key] = hasPermission;
      });

      res.json({ permissions: result });
    } catch (error) {
      console.error('Check batch permissions error:', error);
      res.status(500).json({ error: 'Erro ao verificar permissões em lote' });
    }
  }
}

// Validações
export const updateProfilePermissionsValidation = [
  body('permissions')
    .isArray()
    .withMessage('Permissões devem ser um array'),
  body('permissions.*.permission_id')
    .isInt()
    .withMessage('ID da permissão deve ser um número'),
  body('permissions.*.granted')
    .isBoolean()
    .withMessage('Granted deve ser um booleano'),
];
