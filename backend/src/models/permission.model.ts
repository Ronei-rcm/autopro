import pool from '../config/database';
import { UserProfile } from '../types';

export interface Permission {
  id: number;
  module: string;
  action: string;
  description?: string;
  created_at: Date;
}

export interface ProfilePermission {
  id: number;
  profile: UserProfile;
  permission_id: number;
  granted: boolean;
  created_at: Date;
}

export interface PermissionWithGranted extends Permission {
  granted: boolean;
}

export class PermissionModel {
  // Buscar todas as permissões
  static async findAll(): Promise<Permission[]> {
    const result = await pool.query(
      'SELECT id, module, action, description, created_at FROM permissions ORDER BY module, action'
    );
    return result.rows;
  }

  // Buscar permissão por ID
  static async findById(id: number): Promise<Permission | null> {
    const result = await pool.query(
      'SELECT id, module, action, description, created_at FROM permissions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Buscar permissão por módulo e ação
  static async findByModuleAndAction(module: string, action: string): Promise<Permission | null> {
    const result = await pool.query(
      'SELECT id, module, action, description, created_at FROM permissions WHERE module = $1 AND action = $2',
      [module, action]
    );
    return result.rows[0] || null;
  }

  // Buscar permissões de um perfil (opcionalmente filtrar módulos ocultos)
  static async findByProfile(profile: UserProfile, includeHidden: boolean = false): Promise<PermissionWithGranted[]> {
    // Query base
    let query = `
      SELECT DISTINCT p.id, p.module, p.action, p.description, p.created_at, 
             COALESCE(pp.granted, false) as granted
      FROM permissions p
      LEFT JOIN profile_permissions pp ON p.id = pp.permission_id AND pp.profile = $1
    `;
    
    const params: any[] = [profile];
    let hasWhere = false;
    
    // Se não deve incluir ocultos, fazer LEFT JOIN com module_settings e filtrar
    if (!includeHidden) {
      // Verificar se a tabela existe antes de fazer o join
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'module_settings'
          );
        `);
        
        const tableExists = tableCheck.rows[0]?.exists || false;
        
        if (tableExists) {
          query += `
            LEFT JOIN module_settings ms ON p.module = ms.module
            WHERE (ms.hidden IS NULL OR ms.hidden = false)
          `;
          hasWhere = true;
        }
        // Se a tabela não existe, não filtra (comportamento padrão - mostra tudo)
      } catch (error) {
        // Se der erro ao verificar, continua sem filtrar
        console.warn('Erro ao verificar tabela module_settings, mostrando todas as permissões:', error);
      }
    }
    
    query += ' ORDER BY p.module, p.action';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  // Verificar se perfil tem permissão
  static async hasPermission(profile: UserProfile, module: string, action: string): Promise<boolean> {
    // Admin tem todas as permissões
    if (profile === 'admin') {
      return true;
    }

    const result = await pool.query(
      `SELECT pp.granted
       FROM permissions p
       INNER JOIN profile_permissions pp ON p.id = pp.permission_id
       WHERE p.module = $1 AND p.action = $2 AND pp.profile = $3 AND pp.granted = true`,
      [module, action, profile]
    );

    return result.rows.length > 0;
  }

  // Atualizar permissão de um perfil
  static async updateProfilePermission(
    profile: UserProfile,
    permissionId: number,
    granted: boolean
  ): Promise<void> {
    // Verificar se já existe
    const existing = await pool.query(
      'SELECT id FROM profile_permissions WHERE profile = $1 AND permission_id = $2',
      [profile, permissionId]
    );

    if (existing.rows.length > 0) {
      // Atualizar
      await pool.query(
        'UPDATE profile_permissions SET granted = $1 WHERE profile = $2 AND permission_id = $3',
        [granted, profile, permissionId]
      );
    } else {
      // Criar
      await pool.query(
        'INSERT INTO profile_permissions (profile, permission_id, granted) VALUES ($1, $2, $3)',
        [profile, permissionId, granted]
      );
    }
  }

  // Atualizar múltiplas permissões de um perfil
  static async updateProfilePermissions(
    profile: UserProfile,
    permissions: { permission_id: number; granted: boolean }[]
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const perm of permissions) {
        const existing = await client.query(
          'SELECT id FROM profile_permissions WHERE profile = $1 AND permission_id = $2',
          [profile, perm.permission_id]
        );

        if (existing.rows.length > 0) {
          await client.query(
            'UPDATE profile_permissions SET granted = $1 WHERE profile = $2 AND permission_id = $3',
            [perm.granted, profile, perm.permission_id]
          );
        } else {
          await client.query(
            'INSERT INTO profile_permissions (profile, permission_id, granted) VALUES ($1, $2, $3)',
            [profile, perm.permission_id, perm.granted]
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar permissões agrupadas por módulo (opcionalmente filtrar módulos ocultos)
  static async findGroupedByModule(profile: UserProfile, includeHidden: boolean = false): Promise<Record<string, PermissionWithGranted[]>> {
    const permissions = await this.findByProfile(profile, includeHidden);
    const grouped: Record<string, PermissionWithGranted[]> = {};

    for (const perm of permissions) {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    }

    return grouped;
  }
}
