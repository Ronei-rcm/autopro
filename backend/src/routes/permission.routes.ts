import { Router } from 'express';
import { PermissionController, updateProfilePermissionsValidation } from '../controllers/permission.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Verificar se usuário atual tem permissão (não requer admin)
router.get('/check', PermissionController.checkPermission);

// Verificar múltiplas permissões em lote (não requer admin)
router.post('/check-batch', PermissionController.checkBatchPermissions);

// Todas as outras rotas requerem perfil admin
router.use(authorize('admin'));

// Listar todas as permissões
router.get('/', PermissionController.getAll);

// Buscar permissões de um perfil
router.get('/profile/:profile', PermissionController.getByProfile);

// Buscar permissões agrupadas por módulo
router.get('/profile/:profile/grouped', PermissionController.getGroupedByModule);

// Atualizar permissões de um perfil
router.put('/profile/:profile', updateProfilePermissionsValidation, PermissionController.updateProfilePermissions);

export default router;
