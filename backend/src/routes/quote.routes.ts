import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// TODO: Implementar controllers
router.get('/', (req, res) => {
  res.json({ message: 'Listar orçamentos' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Criar orçamento' });
});

export default router;

