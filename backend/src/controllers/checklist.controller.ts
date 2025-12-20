import { Request, Response } from 'express';
import { ChecklistModel } from '../models/checklist.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class ChecklistController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active_only === 'true';
      const checklists = await ChecklistModel.findAll(activeOnly);
      res.json(checklists);
    } catch (error) {
      console.error('List checklists error:', error);
      res.status(500).json({ error: 'Erro ao listar checklists' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const checklist = await ChecklistModel.findById(id);
      if (!checklist) {
        res.status(404).json({ error: 'Checklist não encontrado' });
        return;
      }

      res.json(checklist);
    } catch (error) {
      console.error('Get checklist error:', error);
      res.status(500).json({ error: 'Erro ao buscar checklist' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, description, category, active, items } = req.body;

      const checklist = await ChecklistModel.create(
        {
          name,
          description,
          category,
          active: active !== undefined ? active : true,
          created_by: req.userId,
        },
        items
      );

      res.status(201).json(checklist);
    } catch (error: any) {
      console.error('Create checklist error:', error);
      res.status(500).json({ error: 'Erro ao criar checklist' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const existingChecklist = await ChecklistModel.findById(id, false);
      if (!existingChecklist) {
        res.status(404).json({ error: 'Checklist não encontrado' });
        return;
      }

      const { name, description, category, active, items } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (active !== undefined) updateData.active = active;

      const checklist = await ChecklistModel.update(id, updateData, items);
      res.json(checklist);
    } catch (error: any) {
      console.error('Update checklist error:', error);
      res.status(500).json({ error: 'Erro ao atualizar checklist' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await ChecklistModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Checklist não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete checklist error:', error);
      res.status(500).json({ error: 'Erro ao deletar checklist' });
    }
  }

  // Execução de checklist
  static async createExecution(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        res.status(400).json({ error: 'ID da ordem inválido' });
        return;
      }

      const { checklist_id, vehicle_id, notes, items } = req.body;

      const execution = await ChecklistModel.createExecution(
        orderId,
        checklist_id,
        vehicle_id,
        req.userId,
        notes,
        items
      );

      res.status(201).json(execution);
    } catch (error: any) {
      console.error('Create checklist execution error:', error);
      res.status(500).json({ error: 'Erro ao criar execução de checklist' });
    }
  }

  static async getExecutionById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const execution = await ChecklistModel.findExecutionById(id);
      if (!execution) {
        res.status(404).json({ error: 'Execução não encontrada' });
        return;
      }

      res.json(execution);
    } catch (error) {
      console.error('Get checklist execution error:', error);
      res.status(500).json({ error: 'Erro ao buscar execução de checklist' });
    }
  }

  static async getExecutionsByOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        res.status(400).json({ error: 'ID da ordem inválido' });
        return;
      }

      const executions = await ChecklistModel.findExecutionsByOrder(orderId);
      res.json(executions);
    } catch (error) {
      console.error('Get checklist executions by order error:', error);
      res.status(500).json({ error: 'Erro ao buscar execuções de checklist' });
    }
  }

  static async updateExecutionItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const executionId = parseInt(req.params.executionId);
      const checklistItemId = parseInt(req.params.itemId);
      
      if (isNaN(executionId) || isNaN(checklistItemId)) {
        res.status(400).json({ error: 'IDs inválidos' });
        return;
      }

      const { checked, value, observation } = req.body;

      const item = await ChecklistModel.updateExecutionItem(executionId, checklistItemId, {
        checked,
        value,
        observation,
      });

      if (!item) {
        res.status(404).json({ error: 'Item não encontrado' });
        return;
      }

      res.json(item);
    } catch (error: any) {
      console.error('Update checklist execution item error:', error);
      res.status(500).json({ error: 'Erro ao atualizar item do checklist' });
    }
  }
}

// Validações
export const createChecklistValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('items').optional().isArray().withMessage('Items deve ser um array'),
  body('items.*.description').optional().notEmpty().withMessage('Descrição do item é obrigatória'),
  body('items.*.item_type').optional().isIn(['check', 'measure', 'observation']).withMessage('Tipo de item inválido'),
];

export const updateChecklistValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('items').optional().isArray().withMessage('Items deve ser um array'),
  body('items.*.description').optional().notEmpty().withMessage('Descrição do item é obrigatória'),
  body('items.*.item_type').optional().isIn(['check', 'measure', 'observation']).withMessage('Tipo de item inválido'),
];

export const createExecutionValidation = [
  body('checklist_id').isInt().withMessage('ID do checklist é obrigatório'),
  body('vehicle_id').isInt().withMessage('ID do veículo é obrigatório'),
  body('items').optional().isArray().withMessage('Items deve ser um array'),
];

export const updateExecutionItemValidation = [
  body('checked').optional().isBoolean().withMessage('Checked deve ser boolean'),
  body('value').optional().isString().withMessage('Value deve ser string'),
  body('observation').optional().isString().withMessage('Observation deve ser string'),
];
