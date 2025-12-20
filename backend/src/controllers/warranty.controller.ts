import { Request, Response } from 'express';
import { WarrantyModel } from '../models/warranty.model';
import { OrderModel } from '../models/order.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class WarrantyController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const orderId = req.query.order_id ? parseInt(req.query.order_id as string) : undefined;
      const clientId = req.query.client_id ? parseInt(req.query.client_id as string) : undefined;
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

      const warranties = await WarrantyModel.findAll(status, orderId, clientId, startDate, endDate);
      
      // Atualizar status de garantias expiradas antes de retornar
      await WarrantyModel.updateExpiredStatuses();
      
      res.json(warranties);
    } catch (error) {
      console.error('List warranties error:', error);
      res.status(500).json({ error: 'Erro ao listar garantias' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const warranty = await WarrantyModel.findById(id);
      if (!warranty) {
        res.status(404).json({ error: 'Garantia não encontrada' });
        return;
      }

      res.json(warranty);
    } catch (error) {
      console.error('Get warranty error:', error);
      res.status(500).json({ error: 'Erro ao buscar garantia' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { order_id, order_item_id, warranty_period_days, start_date } = req.body;

      // Verificar se a ordem existe
      const order = await OrderModel.findById(order_id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      // Calcular data de término
      const startDate = start_date ? new Date(start_date) : new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + warranty_period_days);

      const warranty = await WarrantyModel.create({
        ...req.body,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
      });

      res.status(201).json(warranty);
    } catch (error: any) {
      console.error('Create warranty error:', error);
      res.status(500).json({ error: 'Erro ao criar garantia' });
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

      const existingWarranty = await WarrantyModel.findById(id);
      if (!existingWarranty) {
        res.status(404).json({ error: 'Garantia não encontrada' });
        return;
      }

      // Se alterar período ou data inicial, recalcular data de término
      if (req.body.warranty_period_days || req.body.start_date) {
        const periodDays = req.body.warranty_period_days || existingWarranty.warranty_period_days;
        const startDate = req.body.start_date ? new Date(req.body.start_date) : new Date(existingWarranty.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + periodDays);
        req.body.end_date = endDate;
      }

      const warranty = await WarrantyModel.update(id, req.body);
      if (!warranty) {
        res.status(404).json({ error: 'Garantia não encontrada' });
        return;
      }

      res.json(warranty);
    } catch (error: any) {
      console.error('Update warranty error:', error);
      res.status(500).json({ error: 'Erro ao atualizar garantia' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await WarrantyModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Garantia não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete warranty error:', error);
      res.status(500).json({ error: 'Erro ao deletar garantia' });
    }
  }

  static async getExpiring(req: Request, res: Response): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const warranties = await WarrantyModel.getExpiringWarranties(days);
      res.json(warranties);
    } catch (error) {
      console.error('Get expiring warranties error:', error);
      res.status(500).json({ error: 'Erro ao buscar garantias próximas ao vencimento' });
    }
  }

  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      // Atualizar status de garantias expiradas antes de retornar resumo
      await WarrantyModel.updateExpiredStatuses();
      
      const summary = await WarrantyModel.getSummary();
      res.json(summary);
    } catch (error) {
      console.error('Get warranty summary error:', error);
      res.status(500).json({ error: 'Erro ao buscar resumo de garantias' });
    }
  }
}

// Validações
export const createWarrantyValidation = [
  body('order_id').isInt().withMessage('ID da ordem é obrigatório'),
  body('order_item_id').isInt().withMessage('ID do item é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('warranty_period_days').isInt({ min: 1 }).withMessage('Período de garantia deve ser maior que zero'),
];

export const updateWarrantyValidation = [
  body('description').optional().notEmpty().withMessage('Descrição não pode ser vazia'),
  body('warranty_period_days').optional().isInt({ min: 1 }).withMessage('Período de garantia deve ser maior que zero'),
  body('status').optional().isIn(['active', 'expired', 'used', 'cancelled']).withMessage('Status inválido'),
];
