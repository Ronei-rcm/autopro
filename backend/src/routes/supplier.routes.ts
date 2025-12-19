import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  SupplierController,
  createSupplierValidation,
  updateSupplierValidation,
} from '../controllers/supplier.controller';

const router = Router();

router.use(authenticate);

router.get('/', SupplierController.list);
router.get('/count', SupplierController.count);
router.get('/:id', SupplierController.getById);
router.post('/', createSupplierValidation, SupplierController.create);
router.put('/:id', updateSupplierValidation, SupplierController.update);
router.delete('/:id', SupplierController.delete);

export default router;

