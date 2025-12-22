"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const order_controller_1 = require("../controllers/order.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', order_controller_1.OrderController.list);
router.get('/:id', order_controller_1.OrderController.getById);
router.post('/', order_controller_1.createOrderValidation, order_controller_1.OrderController.create);
router.put('/:id', order_controller_1.OrderController.update);
router.delete('/:id', order_controller_1.OrderController.delete);
router.post('/:id/items', order_controller_1.addItemValidation, order_controller_1.OrderController.addItem);
router.put('/:id/items/:itemId', order_controller_1.updateItemValidation, order_controller_1.OrderController.updateItem);
router.delete('/:id/items/:itemId', order_controller_1.OrderController.removeItem);
router.put('/:id/discount', order_controller_1.OrderController.updateDiscount);
router.get('/statistics/overview', order_controller_1.OrderController.getStatistics);
router.post('/:id/quick-action', order_controller_1.OrderController.quickAction);
router.post('/:id/generate-receivable', order_controller_1.OrderController.generateReceivable);
// Assinatura e arquivos
router.post('/:id/signature', order_controller_1.saveSignatureValidation, order_controller_1.OrderController.saveSignature);
router.post('/:id/files', order_controller_1.OrderController.uploadFile);
router.get('/:id/files/:fileId', order_controller_1.OrderController.getFile);
router.delete('/:id/files/:fileId', order_controller_1.OrderController.deleteFile);
// Garantias
router.post('/:id/warranties', order_controller_1.OrderController.createWarranties);
exports.default = router;
//# sourceMappingURL=order.routes.js.map