"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', appointment_controller_1.AppointmentController.list);
router.get('/upcoming', appointment_controller_1.AppointmentController.getUpcoming);
router.get('/:id', appointment_controller_1.AppointmentController.getById);
router.post('/', appointment_controller_1.createAppointmentValidation, appointment_controller_1.AppointmentController.create);
router.put('/:id', appointment_controller_1.updateAppointmentValidation, appointment_controller_1.AppointmentController.update);
router.delete('/:id', appointment_controller_1.AppointmentController.delete);
router.post('/:id/quick-action', appointment_controller_1.AppointmentController.quickAction);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map