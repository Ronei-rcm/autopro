"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const checklist_controller_1 = require("../controllers/checklist.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// CRUD de Checklists
router.get('/', checklist_controller_1.ChecklistController.list);
router.get('/:id', checklist_controller_1.ChecklistController.getById);
router.post('/', checklist_controller_1.createChecklistValidation, checklist_controller_1.ChecklistController.create);
router.put('/:id', checklist_controller_1.updateChecklistValidation, checklist_controller_1.ChecklistController.update);
router.delete('/:id', checklist_controller_1.ChecklistController.delete);
// Execuções de Checklist (vinculadas à OS)
router.post('/orders/:orderId/executions', checklist_controller_1.createExecutionValidation, checklist_controller_1.ChecklistController.createExecution);
router.get('/orders/:orderId/executions', checklist_controller_1.ChecklistController.getExecutionsByOrder);
router.get('/executions/:id', checklist_controller_1.ChecklistController.getExecutionById);
router.put('/executions/:executionId/items/:itemId', checklist_controller_1.updateExecutionItemValidation, checklist_controller_1.ChecklistController.updateExecutionItem);
exports.default = router;
//# sourceMappingURL=checklist.routes.js.map