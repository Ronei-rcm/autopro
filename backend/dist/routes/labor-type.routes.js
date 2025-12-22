"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const labor_type_controller_1 = require("../controllers/labor-type.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', labor_type_controller_1.LaborTypeController.list);
router.get('/:id', labor_type_controller_1.LaborTypeController.getById);
router.post('/', labor_type_controller_1.createLaborTypeValidation, labor_type_controller_1.LaborTypeController.create);
router.put('/:id', labor_type_controller_1.updateLaborTypeValidation, labor_type_controller_1.LaborTypeController.update);
router.delete('/:id', labor_type_controller_1.LaborTypeController.delete);
exports.default = router;
//# sourceMappingURL=labor-type.routes.js.map