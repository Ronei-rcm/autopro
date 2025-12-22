"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/overview', dashboard_controller_1.DashboardController.getOverview);
router.get('/profile', dashboard_controller_1.DashboardController.getProfileDashboard);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map