"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const supplier_controller_1 = require("../controllers/supplier.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', supplier_controller_1.SupplierController.list);
router.get('/count', supplier_controller_1.SupplierController.count);
router.get('/:id', supplier_controller_1.SupplierController.getById);
router.post('/', supplier_controller_1.createSupplierValidation, supplier_controller_1.SupplierController.create);
router.put('/:id', supplier_controller_1.updateSupplierValidation, supplier_controller_1.SupplierController.update);
router.delete('/:id', supplier_controller_1.SupplierController.delete);
exports.default = router;
//# sourceMappingURL=supplier.routes.js.map