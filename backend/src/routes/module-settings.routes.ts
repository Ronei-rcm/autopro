import { Router } from 'express';
import { 
  ModuleSettingsController, 
  updateModuleVisibilityValidation,
  updateMultipleModuleVisibilityValidation 
} from '../controllers/module-settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Buscar módulos ocultos (disponível para todos os usuários autenticados)
// IMPORTANTE: Esta rota deve vir ANTES do authorize('admin')
router.get('/hidden', ModuleSettingsController.getHiddenModules);

// Todas as outras rotas requerem perfil admin
router.use(authorize('admin'));

// Listar todas as configurações
router.get('/', ModuleSettingsController.getAll);

// Buscar configuração de um módulo específico
router.get('/:module', ModuleSettingsController.getByModule);

// Atualizar visibilidade de um módulo
router.put('/:module/visibility', updateModuleVisibilityValidation, ModuleSettingsController.updateVisibility);

// Atualizar visibilidade de múltiplos módulos
router.put('/visibility/batch', updateMultipleModuleVisibilityValidation, ModuleSettingsController.updateMultipleVisibility);

export default router;

