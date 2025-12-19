import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  LaborTypeController,
  createLaborTypeValidation,
  updateLaborTypeValidation,
} from '../controllers/labor-type.controller';

const router = Router();

router.use(authenticate);

router.get('/', LaborTypeController.list);
router.get('/:id', LaborTypeController.getById);
router.post('/', createLaborTypeValidation, LaborTypeController.create);
router.put('/:id', updateLaborTypeValidation, LaborTypeController.update);
router.delete('/:id', LaborTypeController.delete);

export default router;

