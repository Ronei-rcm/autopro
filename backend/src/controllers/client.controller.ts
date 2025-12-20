import { Request, Response } from 'express';
import { ClientModel } from '../models/client.model';
import { body, validationResult, query } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import pool from '../config/database';

export class ClientController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;

      const clients = await ClientModel.findAll(search, active);
      res.json(clients);
    } catch (error) {
      console.error('List clients error:', error);
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  }

  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const clientId = parseInt(req.params.id);
      if (isNaN(clientId)) {
        res.status(400).json({ error: 'ID do cliente inválido' });
        return;
      }

      // Verificar se cliente existe
      const client = await ClientModel.findById(clientId);
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Total de OS
      const ordersResult = await pool.query(
        `SELECT COUNT(*) as total, 
                SUM(CASE WHEN status = 'finished' THEN total ELSE 0 END) as total_spent,
                MAX(CASE WHEN status = 'finished' THEN finished_at END) as last_visit
         FROM orders 
         WHERE client_id = $1`,
        [clientId]
      );
      const ordersData = ordersResult.rows[0];

      // OS recentes (últimas 5)
      const recentOrdersResult = await pool.query(
        `SELECT o.id, o.order_number, o.status, o.total, o.finished_at,
                v.brand, v.model, v.plate
         FROM orders o
         LEFT JOIN vehicles v ON o.vehicle_id = v.id
         WHERE o.client_id = $1
         ORDER BY o.created_at DESC
         LIMIT 5`,
        [clientId]
      );

      // Garantias ativas
      const warrantiesResult = await pool.query(
        `SELECT COUNT(*) as active_count
         FROM warranties w
         INNER JOIN orders o ON w.order_id = o.id
         WHERE o.client_id = $1 AND w.status = 'active'`,
        [clientId]
      );

      // Contas a receber pendentes
      const receivablesResult = await pool.query(
        `SELECT COUNT(*) as pending_count,
                SUM(amount - received_amount) as pending_amount
         FROM accounts_receivable
         WHERE client_id = $1 AND status IN ('open', 'overdue')`,
        [clientId]
      );

      // Veículos do cliente
      const vehiclesResult = await pool.query(
        `SELECT COUNT(*) as total_vehicles
         FROM vehicles
         WHERE client_id = $1`,
        [clientId]
      );

      res.json({
        total_orders: parseInt(ordersData.total || '0'),
        total_spent: parseFloat(ordersData.total_spent || '0'),
        last_visit: ordersData.last_visit || null,
        recent_orders: recentOrdersResult.rows,
        active_warranties: parseInt(warrantiesResult.rows[0]?.active_count || '0'),
        pending_receivables: {
          count: parseInt(receivablesResult.rows[0]?.pending_count || '0'),
          amount: parseFloat(receivablesResult.rows[0]?.pending_amount || '0'),
        },
        total_vehicles: parseInt(vehiclesResult.rows[0]?.total_vehicles || '0'),
      });
    } catch (error) {
      console.error('Get client statistics error:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas do cliente' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const client = await ClientModel.findById(id);
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      res.json(client);
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const client = await ClientModel.create(req.body);
      res.status(201).json(client);
    } catch (error: any) {
      console.error('Create client error:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        res.status(400).json({ error: 'CPF ou CNPJ já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao criar cliente' });
      }
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

      const existingClient = await ClientModel.findById(id);
      if (!existingClient) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      const client = await ClientModel.update(id, req.body);
      res.json(client);
    } catch (error: any) {
      console.error('Update client error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'CPF ou CNPJ já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
      }
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await ClientModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  }

  static async count(req: Request, res: Response): Promise<void> {
    try {
      const count = await ClientModel.count();
      res.json({ count });
    } catch (error) {
      console.error('Count clients error:', error);
      res.status(500).json({ error: 'Erro ao contar clientes' });
    }
  }
}

// Validações
export const createClientValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('type').isIn(['PF', 'PJ']).withMessage('Tipo deve ser PF ou PJ'),
  body('cpf')
    .if(body('type').equals('PF'))
    .notEmpty()
    .withMessage('CPF é obrigatório para pessoa física'),
  body('cnpj')
    .if(body('type').equals('PJ'))
    .notEmpty()
    .withMessage('CNPJ é obrigatório para pessoa jurídica'),
  body('email').optional().isEmail().withMessage('Email inválido'),
];

export const updateClientValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('type').optional().isIn(['PF', 'PJ']).withMessage('Tipo deve ser PF ou PJ'),
  body('email').optional().isEmail().withMessage('Email inválido'),
];

