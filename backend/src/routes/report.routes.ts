import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// TODO: Implementar controllers
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard' });
});

router.get('/billing', (req, res) => {
  res.json({ message: 'Relatório de faturamento' });
});

export default router;

