"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class PermissionModel {
    // Buscar todas as permissões
    static async findAll() {
        const result = await database_1.default.query('SELECT id, module, action, description, created_at FROM permissions ORDER BY module, action');
        return result.rows;
    }
    // Buscar permissão por ID
    static async findById(id) {
        const result = await database_1.default.query('SELECT id, module, action, description, created_at FROM permissions WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    // Buscar permissão por módulo e ação
    static async findByModuleAndAction(module, action) {
        const result = await database_1.default.query('SELECT id, module, action, description, created_at FROM permissions WHERE module = $1 AND action = $2', [module, action]);
        return result.rows[0] || null;
    }
    // Buscar permissões de um perfil (opcionalmente filtrar módulos ocultos)
    static async findByProfile(profile, includeHidden = false) {
        // Query base
        let query = `
      SELECT DISTINCT p.id, p.module, p.action, p.description, p.created_at, 
             COALESCE(pp.granted, false) as granted
      FROM permissions p
      LEFT JOIN profile_permissions pp ON p.id = pp.permission_id AND pp.profile = $1
    `;
        const params = [profile];
        let hasWhere = false;
        // Se não deve incluir ocultos, fazer LEFT JOIN com module_settings e filtrar
        if (!includeHidden) {
            // Verificar se a tabela existe antes de fazer o join
            try {
                const tableCheck = await database_1.default.query(`
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
            }
            catch (error) {
                // Se der erro ao verificar, continua sem filtrar
                console.warn('Erro ao verificar tabela module_settings, mostrando todas as permissões:', error);
            }
        }
        query += ' ORDER BY p.module, p.action';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    // Verificar se perfil tem permissão
    static async hasPermission(profile, module, action) {
        // Admin tem todas as permissões
        if (profile === 'admin') {
            return true;
        }
        const result = await database_1.default.query(`SELECT pp.granted
       FROM permissions p
       INNER JOIN profile_permissions pp ON p.id = pp.permission_id
       WHERE p.module = $1 AND p.action = $2 AND pp.profile = $3 AND pp.granted = true`, [module, action, profile]);
        return result.rows.length > 0;
    }
    // Atualizar permissão de um perfil
    static async updateProfilePermission(profile, permissionId, granted) {
        // Verificar se já existe
        const existing = await database_1.default.query('SELECT id FROM profile_permissions WHERE profile = $1 AND permission_id = $2', [profile, permissionId]);
        if (existing.rows.length > 0) {
            // Atualizar
            await database_1.default.query('UPDATE profile_permissions SET granted = $1 WHERE profile = $2 AND permission_id = $3', [granted, profile, permissionId]);
        }
        else {
            // Criar
            await database_1.default.query('INSERT INTO profile_permissions (profile, permission_id, granted) VALUES ($1, $2, $3)', [profile, permissionId, granted]);
        }
    }
    // Atualizar múltiplas permissões de um perfil
    static async updateProfilePermissions(profile, permissions) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            for (const perm of permissions) {
                const existing = await client.query('SELECT id FROM profile_permissions WHERE profile = $1 AND permission_id = $2', [profile, perm.permission_id]);
                if (existing.rows.length > 0) {
                    await client.query('UPDATE profile_permissions SET granted = $1 WHERE profile = $2 AND permission_id = $3', [perm.granted, profile, perm.permission_id]);
                }
                else {
                    await client.query('INSERT INTO profile_permissions (profile, permission_id, granted) VALUES ($1, $2, $3)', [profile, perm.permission_id, perm.granted]);
                }
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Buscar permissões agrupadas por módulo (opcionalmente filtrar módulos ocultos)
    static async findGroupedByModule(profile, includeHidden = false) {
        const permissions = await this.findByProfile(profile, includeHidden);
        const grouped = {};
        for (const perm of permissions) {
            if (!grouped[perm.module]) {
                grouped[perm.module] = [];
            }
            grouped[perm.module].push(perm);
        }
        return grouped;
    }
}
exports.PermissionModel = PermissionModel;
//# sourceMappingURL=permission.model.js.map