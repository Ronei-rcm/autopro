import { Request, Response } from 'express';
import { LaborTypeModel } from '../models/labor-type.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class LaborTypeController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
      const laborTypes = await LaborTypeModel.findAll(active);
      res.json(laborTypes);
    } catch (error) {
      console.error('List labor types error:', error);
      res.status(500).json({ error: 'Erro ao listar tipos de mão de obra' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const laborType = await LaborTypeModel.findById(id);
      if (!laborType) {
        res.status(404).json({ error: 'Tipo de mão de obra não encontrado' });
        return;
      }

      res.json(laborType);
    } catch (error) {
      console.error('Get labor type error:', error);
      res.status(500).json({ error: 'Erro ao buscar tipo de mão de obra' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const laborType = await LaborTypeModel.create(req.body);
      res.status(201).json(laborType);
    } catch (error: any) {
      console.error('Create labor type error:', error);
      res.status(500).json({ error: 'Erro ao criar tipo de mão de obra' });
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

      const existingLaborType = await LaborTypeModel.findById(id);
      if (!existingLaborType) {
        res.status(404).json({ error: 'Tipo de mão de obra não encontrado' });
        return;
      }

      const laborType = await LaborTypeModel.update(id, req.body);
      res.json(laborType);
    } catch (error: any) {
      console.error('Update labor type error:', error);
      res.status(500).json({ error: 'Erro ao atualizar tipo de mão de obra' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await LaborTypeModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Tipo de mão de obra não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete labor type error:', error);
      res.status(500).json({ error: 'Erro ao deletar tipo de mão de obra' });
    }
  }
}

// Validações
export const createLaborTypeValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser positivo'),
  body('estimated_hours').optional().isFloat({ min: 0 }).withMessage('Horas estimadas devem ser positivas'),
];

export const updateLaborTypeValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Preço deve ser positivo'),
  body('estimated_hours').optional().isFloat({ min: 0 }).withMessage('Horas estimadas devem ser positivas'),
];

