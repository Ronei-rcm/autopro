import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// TODO: Implementar controllers
router.get('/', (req, res) => {
  res.json({ message: 'Listar clientes' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Criar cliente' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Buscar cliente' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Atualizar cliente' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Deletar cliente' });
});

export default router;

