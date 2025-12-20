import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  WarrantyController,
  createWarrantyValidation,
  updateWarrantyValidation,
} from '../controllers/warranty.controller';

const router = Router();

router.use(authenticate);

router.get('/', WarrantyController.list);
router.get('/expiring', WarrantyController.getExpiring);
router.get('/summary', WarrantyController.getSummary);
router.get('/:id', WarrantyController.getById);
router.post('/', createWarrantyValidation, WarrantyController.create);
router.put('/:id', updateWarrantyValidation, WarrantyController.update);
router.delete('/:id', WarrantyController.delete);

export default router;
