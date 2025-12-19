import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  ClientController,
  createClientValidation,
  updateClientValidation,
} from '../controllers/client.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', ClientController.list);
router.get('/count', ClientController.count);
router.get('/:id', ClientController.getById);
router.post('/', createClientValidation, ClientController.create);
router.put('/:id', updateClientValidation, ClientController.update);
router.delete('/:id', ClientController.delete);

export default router;

