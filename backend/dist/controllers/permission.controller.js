"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePermissionsValidation = exports.PermissionController = void 0;
const permission_model_1 = require("../models/permission.model");
const express_validator_1 = require("express-validator");
class PermissionController {
    // Listar todas as permissões (apenas admin)
    static async getAll(req, res) {
        try {
            if (req.userProfile !== 'admin') {
                res.status(403).json({ error: 'Acesso negado' });
                return;
            }
            const permissions = await permission_model_1.PermissionModel.findAll();
            res.json(permissions);
        }
        catch (error) {
            console.error('Get all permissions error:', error);
            res.status(500).json({ error: 'Erro ao buscar permissões' });
        }
    }
    // Buscar permissões de um perfil
    static async getByProfile(req, res) {
        try {
            if (req.userProfile !== 'admin') {
                res.status(403).json({ error: 'Acesso negado' });
                return;
            }
            const profile = req.params.profile;
            const includeHidden = req.query.includeHidden === 'true';
            if (!['admin', 'mechanic', 'financial', 'attendant'].includes(profile)) {
                res.status(400).json({ error: 'Perfil inválido' });
                return;
            }
            const permissions = await permission_model_1.PermissionModel.findByProfile(profile, includeHidden);
            res.json(permissions);
        }
        catch (error) {
            console.error('Get permissions by profile error:', error);
            res.status(500).json({ error: 'Erro ao buscar permissões do perfil' });
        }
    }
    // Buscar permissões agrupadas por módulo
    static async getGroupedByModule(req, res) {
        try {
            if (req.userProfile !== 'admin') {
                res.status(403).json({ error: 'Acesso negado' });
                return;
            }
            const profile = req.params.profile;
            const includeHidden = req.query.includeHidden === 'true';
            if (!['admin', 'mechanic', 'financial', 'attendant'].includes(profile)) {
                res.status(400).json({ error: 'Perfil inválido' });
                return;
            }
            const grouped = await permission_model_1.PermissionModel.findGroupedByModule(profile, includeHidden);
            res.json(grouped);
        }
        catch (error) {
            console.error('Get grouped permissions error:', error);
            res.status(500).json({ error: 'Erro ao buscar permissões agrupadas' });
        }
    }
    // Atualizar permissões de um perfil
    static async updateProfilePermissions(req, res) {
        try {
            if (req.userProfile !== 'admin') {
                res.status(403).json({ error: 'Acesso negado' });
                return;
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const profile = req.params.profile;
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
            await permission_model_1.PermissionModel.updateProfilePermissions(profile, permissions);
            res.json({ message: 'Permissões atualizadas com sucesso' });
        }
        catch (error) {
            console.error('Update profile permissions error:', error);
            res.status(500).json({ error: 'Erro ao atualizar permissões' });
        }
    }
    // Verificar se usuário atual tem permissão
    static async checkPermission(req, res) {
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
            const hasPermission = await permission_model_1.PermissionModel.hasPermission(req.userProfile, module, action);
            res.json({ hasPermission });
        }
        catch (error) {
            console.error('Check permission error:', error);
            res.status(500).json({ error: 'Erro ao verificar permissão' });
        }
    }
    // Verificar múltiplas permissões em lote
    static async checkBatchPermissions(req, res) {
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
            const checks = await Promise.all(permissions.map(async (perm) => {
                const hasPermission = await permission_model_1.PermissionModel.hasPermission(req.userProfile, perm.module, perm.action);
                return {
                    key: `${perm.module}:${perm.action}`,
                    hasPermission,
                };
            }));
            // Construir objeto de resultado
            const result = {};
            checks.forEach(({ key, hasPermission }) => {
                result[key] = hasPermission;
            });
            res.json({ permissions: result });
        }
        catch (error) {
            console.error('Check batch permissions error:', error);
            res.status(500).json({ error: 'Erro ao verificar permissões em lote' });
        }
    }
}
exports.PermissionController = PermissionController;
// Validações
exports.updateProfilePermissionsValidation = [
    (0, express_validator_1.body)('permissions')
        .isArray()
        .withMessage('Permissões devem ser um array'),
    (0, express_validator_1.body)('permissions.*.permission_id')
        .isInt()
        .withMessage('ID da permissão deve ser um número'),
    (0, express_validator_1.body)('permissions.*.granted')
        .isBoolean()
        .withMessage('Granted deve ser um booleano'),
];
//# sourceMappingURL=permission.controller.js.map