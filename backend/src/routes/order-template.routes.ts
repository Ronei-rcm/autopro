import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  OrderTemplateController,
  createOrderTemplateValidation,
  updateOrderTemplateValidation,
} from '../controllers/order-template.controller';

const router = Router();

router.use(authenticate);

router.get('/', OrderTemplateController.list);
router.get('/:id', OrderTemplateController.getById);
router.post('/', createOrderTemplateValidation, OrderTemplateController.create);
router.put('/:id', updateOrderTemplateValidation, OrderTemplateController.update);
router.delete('/:id', OrderTemplateController.delete);

export default router;
