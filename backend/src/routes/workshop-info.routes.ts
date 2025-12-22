import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  WorkshopInfoController,
  updateWorkshopInfoValidation,
} from '../controllers/workshop-info.controller';

const router = Router();

// GET pode ser público (para usar em PDFs)
router.get('/', WorkshopInfoController.get);

// UPDATE requer autenticação
router.put('/', authenticate, updateWorkshopInfoValidation, WorkshopInfoController.update);

export default router;
