"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', vehicle_controller_1.VehicleController.list);
router.get('/client/:clientId', vehicle_controller_1.VehicleController.getByClient);
router.get('/:id/history', vehicle_controller_1.VehicleController.getHistory);
router.get('/:id', vehicle_controller_1.VehicleController.getById);
router.post('/', vehicle_controller_1.createVehicleValidation, vehicle_controller_1.VehicleController.create);
router.put('/:id', vehicle_controller_1.updateVehicleValidation, vehicle_controller_1.VehicleController.update);
router.delete('/:id', vehicle_controller_1.VehicleController.delete);
exports.default = router;
//# sourceMappingURL=vehicle.routes.js.map