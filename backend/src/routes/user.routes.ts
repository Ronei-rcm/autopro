import { Router } from 'express';
import { UserController, createUserValidation, updateUserValidation } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar todos os usuários (apenas admin)
router.get('/', authorize('admin'), UserController.getAll);

// Buscar usuário por ID
router.get('/:id', UserController.getById);

// Criar novo usuário (apenas admin)
router.post('/', authorize('admin'), createUserValidation, UserController.create);

// Atualizar usuário
router.put('/:id', updateUserValidation, UserController.update);

// Deletar/desativar usuário (apenas admin)
router.delete('/:id', authorize('admin'), UserController.delete);

export default router;
