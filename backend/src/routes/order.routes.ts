import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  OrderController,
  createOrderValidation,
  addItemValidation,
  updateItemValidation,
} from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.get('/', OrderController.list);
router.get('/:id', OrderController.getById);
router.post('/', createOrderValidation, OrderController.create);
router.put('/:id', OrderController.update);
router.delete('/:id', OrderController.delete);
router.post('/:id/items', addItemValidation, OrderController.addItem);
router.put('/:id/items/:itemId', updateItemValidation, OrderController.updateItem);
router.delete('/:id/items/:itemId', OrderController.removeItem);
router.put('/:id/discount', OrderController.updateDiscount);
router.get('/statistics/overview', OrderController.getStatistics);
router.post('/:id/quick-action', OrderController.quickAction);
router.post('/:id/generate-receivable', OrderController.generateReceivable);

export default router;

