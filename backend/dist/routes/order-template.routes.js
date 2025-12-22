"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const order_template_controller_1 = require("../controllers/order-template.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', order_template_controller_1.OrderTemplateController.list);
router.get('/:id', order_template_controller_1.OrderTemplateController.getById);
router.post('/', order_template_controller_1.createOrderTemplateValidation, order_template_controller_1.OrderTemplateController.create);
router.put('/:id', order_template_controller_1.updateOrderTemplateValidation, order_template_controller_1.OrderTemplateController.update);
router.delete('/:id', order_template_controller_1.OrderTemplateController.delete);
exports.default = router;
//# sourceMappingURL=order-template.routes.js.map