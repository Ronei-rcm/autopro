"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const warranty_controller_1 = require("../controllers/warranty.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', warranty_controller_1.WarrantyController.list);
router.get('/expiring', warranty_controller_1.WarrantyController.getExpiring);
router.get('/summary', warranty_controller_1.WarrantyController.getSummary);
router.get('/:id', warranty_controller_1.WarrantyController.getById);
router.post('/', warranty_controller_1.createWarrantyValidation, warranty_controller_1.WarrantyController.create);
router.put('/:id', warranty_controller_1.updateWarrantyValidation, warranty_controller_1.WarrantyController.update);
router.delete('/:id', warranty_controller_1.WarrantyController.delete);
exports.default = router;
//# sourceMappingURL=warranty.routes.js.map