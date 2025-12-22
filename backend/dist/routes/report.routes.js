"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const report_controller_1 = require("../controllers/report.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/overview', report_controller_1.ReportController.overview);
router.get('/financial', report_controller_1.ReportController.financial);
router.get('/sales', report_controller_1.ReportController.sales);
router.get('/inventory', report_controller_1.ReportController.inventory);
router.get('/clients', report_controller_1.ReportController.clients);
exports.default = router;
//# sourceMappingURL=report.routes.js.map