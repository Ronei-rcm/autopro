import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  ChecklistController,
  createChecklistValidation,
  updateChecklistValidation,
  createExecutionValidation,
  updateExecutionItemValidation,
} from '../controllers/checklist.controller';

const router = Router();

router.use(authenticate);

// CRUD de Checklists
router.get('/', ChecklistController.list);
router.get('/:id', ChecklistController.getById);
router.post('/', createChecklistValidation, ChecklistController.create);
router.put('/:id', updateChecklistValidation, ChecklistController.update);
router.delete('/:id', ChecklistController.delete);

// Execuções de Checklist (vinculadas à OS)
router.post('/orders/:orderId/executions', createExecutionValidation, ChecklistController.createExecution);
router.get('/orders/:orderId/executions', ChecklistController.getExecutionsByOrder);
router.get('/executions/:id', ChecklistController.getExecutionById);
router.put('/executions/:executionId/items/:itemId', updateExecutionItemValidation, ChecklistController.updateExecutionItem);

export default router;
