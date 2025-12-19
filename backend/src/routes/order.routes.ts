import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  OrderController,
  createOrderValidation,
  addItemValidation,
} from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.get('/', OrderController.list);
router.get('/:id', OrderController.getById);
router.post('/', createOrderValidation, OrderController.create);
router.put('/:id', OrderController.update);
router.delete('/:id', OrderController.delete);
router.post('/:id/items', addItemValidation, OrderController.addItem);
router.delete('/:id/items/:itemId', OrderController.removeItem);
router.put('/:id/discount', OrderController.updateDiscount);

export default router;

