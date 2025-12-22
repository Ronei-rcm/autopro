import { Response } from 'express';
import { ModuleSettingsModel } from '../models/module-settings.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

export class ModuleSettingsController {
  // Listar todas as configurações de módulos (apenas admin)
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const settings = await ModuleSettingsModel.findAll();
      res.json(settings);
    } catch (error) {
      console.error('Get all module settings error:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações de módulos' });
    }
  }

  // Buscar configuração de um módulo específico
  static async getByModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const { module } = req.params;
      const settings = await ModuleSettingsModel.findByModule(module);
      
      if (!settings) {
        res.status(404).json({ error: 'Configuração não encontrada' });
        return;
      }

      res.json(settings);
    } catch (error) {
      console.error('Get module settings error:', error);
      res.status(500).json({ error: 'Erro ao buscar configuração do módulo' });
    }
  }

  // Buscar módulos ocultos (disponível para todos os usuários autenticados)
  static async getHiddenModules(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Qualquer usuário autenticado pode ver quais módulos estão ocultos
      // Isso é necessário para o frontend filtrar o menu corretamente
      const hiddenModules = await ModuleSettingsModel.findHiddenModules();
      res.json({ modules: hiddenModules });
    } catch (error) {
      console.error('Get hidden modules error:', error);
      res.status(500).json({ error: 'Erro ao buscar módulos ocultos' });
    }
  }

  // Atualizar visibilidade de um módulo
  static async updateVisibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { module } = req.params;
      const { hidden } = req.body;

      if (typeof hidden !== 'boolean') {
        res.status(400).json({ error: 'Hidden deve ser um booleano' });
        return;
      }

      await ModuleSettingsModel.updateVisibility(module, hidden);
      res.json({ message: 'Visibilidade do módulo atualizada com sucesso', module, hidden });
    } catch (error) {
      console.error('Update module visibility error:', error);
      res.status(500).json({ error: 'Erro ao atualizar visibilidade do módulo' });
    }
  }

  // Atualizar visibilidade de múltiplos módulos
  static async updateMultipleVisibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userProfile !== 'admin') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { modules } = req.body;

      if (!Array.isArray(modules)) {
        res.status(400).json({ error: 'Modules deve ser um array' });
        return;
      }

      // Validar estrutura
      for (const moduleUpdate of modules) {
        if (typeof moduleUpdate.module !== 'string' || typeof moduleUpdate.hidden !== 'boolean') {
          res.status(400).json({ error: 'Cada módulo deve ter module (string) e hidden (boolean)' });
          return;
        }
      }

      await ModuleSettingsModel.updateMultipleVisibility(modules);
      res.json({ message: 'Visibilidade dos módulos atualizada com sucesso' });
    } catch (error) {
      console.error('Update multiple modules visibility error:', error);
      res.status(500).json({ error: 'Erro ao atualizar visibilidade dos módulos' });
    }
  }
}

// Validações
export const updateModuleVisibilityValidation = [
  body('hidden')
    .isBoolean()
    .withMessage('Hidden deve ser um booleano'),
];

export const updateMultipleModuleVisibilityValidation = [
  body('modules')
    .isArray()
    .withMessage('Modules deve ser um array'),
  body('modules.*.module')
    .isString()
    .withMessage('Module deve ser uma string'),
  body('modules.*.hidden')
    .isBoolean()
    .withMessage('Hidden deve ser um booleano'),
];

