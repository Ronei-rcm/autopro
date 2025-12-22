"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAllPermissions = exports.requireAnyPermission = exports.requirePermission = void 0;
const permission_model_1 = require("../models/permission.model");
/**
 * Middleware para verificar permissão específica
 * @param module Módulo (ex: 'orders', 'clients')
 * @param action Ação (ex: 'create', 'edit', 'delete')
 */
const requirePermission = (module, action) => {
    return async (req, res, next) => {
        try {
            if (!req.userProfile) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }
            const hasPermission = await permission_model_1.PermissionModel.hasPermission(req.userProfile, module, action);
            if (!hasPermission) {
                res.status(403).json({
                    error: 'Acesso negado',
                    message: `Você não tem permissão para ${action} em ${module}`
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({ error: 'Erro ao verificar permissão' });
        }
    };
};
exports.requirePermission = requirePermission;
/**
 * Middleware para verificar múltiplas permissões (OR - pelo menos uma)
 */
const requireAnyPermission = (...permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.userProfile) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }
            const checks = await Promise.all(permissions.map(p => permission_model_1.PermissionModel.hasPermission(req.userProfile, p.module, p.action)));
            if (!checks.some(check => check === true)) {
                res.status(403).json({
                    error: 'Acesso negado',
                    message: 'Você não tem permissão para realizar esta ação'
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({ error: 'Erro ao verificar permissão' });
        }
    };
};
exports.requireAnyPermission = requireAnyPermission;
/**
 * Middleware para verificar múltiplas permissões (AND - todas)
 */
const requireAllPermissions = (...permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.userProfile) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }
            const checks = await Promise.all(permissions.map(p => permission_model_1.PermissionModel.hasPermission(req.userProfile, p.module, p.action)));
            if (!checks.every(check => check === true)) {
                res.status(403).json({
                    error: 'Acesso negado',
                    message: 'Você não tem todas as permissões necessárias'
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({ error: 'Erro ao verificar permissão' });
        }
    };
};
exports.requireAllPermissions = requireAllPermissions;
//# sourceMappingURL=permission.middleware.js.map