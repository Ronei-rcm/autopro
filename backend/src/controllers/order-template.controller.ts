import { Request, Response } from 'express';
import { OrderTemplateModel } from '../models/order-template.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class OrderTemplateController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active_only === 'true';
      const templates = await OrderTemplateModel.findAll(activeOnly);
      res.json(templates);
    } catch (error) {
      console.error('List order templates error:', error);
      res.status(500).json({ error: 'Erro ao listar templates' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const template = await OrderTemplateModel.findById(id);
      if (!template) {
        res.status(404).json({ error: 'Template não encontrado' });
        return;
      }

      res.json(template);
    } catch (error) {
      console.error('Get order template error:', error);
      res.status(500).json({ error: 'Erro ao buscar template' });
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

      const template = await OrderTemplateModel.create(
        {
          name,
          description,
          category,
          active: active !== undefined ? active : true,
          created_by: req.userId,
        },
        items
      );

      res.status(201).json(template);
    } catch (error: any) {
      console.error('Create order template error:', error);
      res.status(500).json({ error: 'Erro ao criar template' });
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

      const existingTemplate = await OrderTemplateModel.findById(id, false);
      if (!existingTemplate) {
        res.status(404).json({ error: 'Template não encontrado' });
        return;
      }

      const { name, description, category, active, items } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (active !== undefined) updateData.active = active;

      const template = await OrderTemplateModel.update(id, updateData, items);
      res.json(template);
    } catch (error: any) {
      console.error('Update order template error:', error);
      res.status(500).json({ error: 'Erro ao atualizar template' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await OrderTemplateModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Template não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete order template error:', error);
      res.status(500).json({ error: 'Erro ao deletar template' });
    }
  }
}

// Validações
export const createOrderTemplateValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('items').optional().isArray().withMessage('Items deve ser um array'),
  body('items.*.description').optional().notEmpty().withMessage('Descrição do item é obrigatória'),
  body('items.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
  body('items.*.unit_price').optional().isFloat({ min: 0 }).withMessage('Preço unitário deve ser positivo'),
  body('items.*.item_type').optional().isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
];

export const updateOrderTemplateValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('items').optional().isArray().withMessage('Items deve ser um array'),
  body('items.*.description').optional().notEmpty().withMessage('Descrição do item é obrigatória'),
  body('items.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
  body('items.*.unit_price').optional().isFloat({ min: 0 }).withMessage('Preço unitário deve ser positivo'),
  body('items.*.item_type').optional().isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
];
