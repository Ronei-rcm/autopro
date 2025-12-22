"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_controller_1 = require("../controllers/permission.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
// Verificar se usuário atual tem permissão (não requer admin)
router.get('/check', permission_controller_1.PermissionController.checkPermission);
// Verificar múltiplas permissões em lote (não requer admin)
router.post('/check-batch', permission_controller_1.PermissionController.checkBatchPermissions);
// Todas as outras rotas requerem perfil admin
router.use((0, auth_middleware_1.authorize)('admin'));
// Listar todas as permissões
router.get('/', permission_controller_1.PermissionController.getAll);
// Buscar permissões de um perfil
router.get('/profile/:profile', permission_controller_1.PermissionController.getByProfile);
// Buscar permissões agrupadas por módulo
router.get('/profile/:profile/grouped', permission_controller_1.PermissionController.getGroupedByModule);
// Atualizar permissões de um perfil
router.put('/profile/:profile', permission_controller_1.updateProfilePermissionsValidation, permission_controller_1.PermissionController.updateProfilePermissions);
exports.default = router;
//# sourceMappingURL=permission.routes.js.map