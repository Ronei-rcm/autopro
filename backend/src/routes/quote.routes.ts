import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  QuoteController,
  createQuoteValidation,
  updateQuoteValidation,
  addItemValidation,
  approveAndScheduleValidation,
} from '../controllers/quote.controller';

const router = Router();

router.use(authenticate);

// CRUD de Orçamentos
router.get('/', QuoteController.list);
router.get('/:id', QuoteController.getById);
router.post('/', createQuoteValidation, QuoteController.create);
router.put('/:id', updateQuoteValidation, QuoteController.update);
router.delete('/:id', QuoteController.delete);

// Status
router.patch('/:id/status', QuoteController.updateStatus);

// Aprovar e agendar
router.post('/:id/approve-and-schedule', approveAndScheduleValidation, QuoteController.approveAndSchedule);

// Converter em OS
router.post('/:id/convert-to-order', QuoteController.convertToOrder);

// Itens
router.post('/:id/items', addItemValidation, QuoteController.addItem);
router.delete('/:id/items/:itemId', QuoteController.removeItem);

export default router;

