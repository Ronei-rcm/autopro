"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const module_settings_controller_1 = require("../controllers/module-settings.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
// Buscar módulos ocultos (disponível para todos os usuários autenticados)
// IMPORTANTE: Esta rota deve vir ANTES do authorize('admin')
router.get('/hidden', module_settings_controller_1.ModuleSettingsController.getHiddenModules);
// Todas as outras rotas requerem perfil admin
router.use((0, auth_middleware_1.authorize)('admin'));
// Listar todas as configurações
router.get('/', module_settings_controller_1.ModuleSettingsController.getAll);
// Buscar configuração de um módulo específico
router.get('/:module', module_settings_controller_1.ModuleSettingsController.getByModule);
// Atualizar visibilidade de um módulo
router.put('/:module/visibility', module_settings_controller_1.updateModuleVisibilityValidation, module_settings_controller_1.ModuleSettingsController.updateVisibility);
// Atualizar visibilidade de múltiplos módulos
router.put('/visibility/batch', module_settings_controller_1.updateMultipleModuleVisibilityValidation, module_settings_controller_1.ModuleSettingsController.updateMultipleVisibility);
exports.default = router;
//# sourceMappingURL=module-settings.routes.js.map