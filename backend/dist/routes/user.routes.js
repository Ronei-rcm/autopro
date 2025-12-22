"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
// Listar todos os usuários (apenas admin)
router.get('/', (0, auth_middleware_1.authorize)('admin'), user_controller_1.UserController.getAll);
// Buscar usuário por ID
router.get('/:id', user_controller_1.UserController.getById);
// Criar novo usuário (apenas admin)
router.post('/', (0, auth_middleware_1.authorize)('admin'), user_controller_1.createUserValidation, user_controller_1.UserController.create);
// Atualizar usuário
router.put('/:id', user_controller_1.updateUserValidation, user_controller_1.UserController.update);
// Deletar/desativar usuário (apenas admin)
router.delete('/:id', (0, auth_middleware_1.authorize)('admin'), user_controller_1.UserController.delete);
exports.default = router;
//# sourceMappingURL=user.routes.js.map