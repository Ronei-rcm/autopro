"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_controller_1 = require("../controllers/client.controller");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
router.get('/', client_controller_1.ClientController.list);
router.get('/count', client_controller_1.ClientController.count);
router.get('/:id/statistics', client_controller_1.ClientController.getStatistics);
router.get('/:id', client_controller_1.ClientController.getById);
router.get('/:id/statistics', client_controller_1.ClientController.getStatistics);
router.post('/', client_controller_1.createClientValidation, client_controller_1.ClientController.create);
router.put('/:id', client_controller_1.updateClientValidation, client_controller_1.ClientController.update);
router.delete('/:id', client_controller_1.ClientController.delete);
exports.default = router;
//# sourceMappingURL=client.routes.js.map