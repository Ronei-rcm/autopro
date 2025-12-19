import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// TODO: Implementar controllers
router.get('/payable', (req, res) => {
  res.json({ message: 'Listar contas a pagar' });
});

router.get('/receivable', (req, res) => {
  res.json({ message: 'Listar contas a receber' });
});

router.get('/cash-flow', (req, res) => {
  res.json({ message: 'Fluxo de caixa' });
});

export default router;

