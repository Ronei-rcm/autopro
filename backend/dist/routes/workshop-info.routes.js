"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const workshop_info_controller_1 = require("../controllers/workshop-info.controller");
const router = (0, express_1.Router)();
// GET pode ser público (para usar em PDFs)
router.get('/', workshop_info_controller_1.WorkshopInfoController.get);
// UPDATE requer autenticação
router.put('/', auth_middleware_1.authenticate, workshop_info_controller_1.updateWorkshopInfoValidation, workshop_info_controller_1.WorkshopInfoController.update);
exports.default = router;
//# sourceMappingURL=workshop-info.routes.js.map