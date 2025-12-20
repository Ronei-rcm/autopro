import { Request, Response } from 'express';
import { VehicleModel } from '../models/vehicle.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import pool from '../config/database';

export class VehicleController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const clientId = req.query.client_id ? parseInt(req.query.client_id as string) : undefined;
      const search = req.query.search as string | undefined;

      const vehicles = await VehicleModel.findAll(clientId, search);
      res.json(vehicles);
    } catch (error) {
      console.error('List vehicles error:', error);
      res.status(500).json({ error: 'Erro ao listar veículos' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const vehicle = await VehicleModel.findById(id);
      if (!vehicle) {
        res.status(404).json({ error: 'Veículo não encontrado' });
        return;
      }

      res.json(vehicle);
    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({ error: 'Erro ao buscar veículo' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const vehicle = await VehicleModel.create(req.body);
      res.status(201).json(vehicle);
    } catch (error: any) {
      console.error('Create vehicle error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'Placa ou chassi já cadastrado' });
      } else if (error.code === '23503') {
        res.status(400).json({ error: 'Cliente não encontrado' });
      } else {
        res.status(500).json({ error: 'Erro ao criar veículo' });
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

      const existingVehicle = await VehicleModel.findById(id);
      if (!existingVehicle) {
        res.status(404).json({ error: 'Veículo não encontrado' });
        return;
      }

      const vehicle = await VehicleModel.update(id, req.body);
      res.json(vehicle);
    } catch (error: any) {
      console.error('Update vehicle error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'Placa ou chassi já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar veículo' });
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

      const deleted = await VehicleModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Veículo não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(500).json({ error: 'Erro ao deletar veículo' });
    }
  }

  static async getByClient(req: Request, res: Response): Promise<void> {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        res.status(400).json({ error: 'ID do cliente inválido' });
        return;
      }

      const vehicles = await VehicleModel.findByClient(clientId);
      res.json(vehicles);
    } catch (error) {
      console.error('Get vehicles by client error:', error);
      res.status(500).json({ error: 'Erro ao buscar veículos do cliente' });
    }
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const vehicleId = parseInt(req.params.id);
      if (isNaN(vehicleId)) {
        res.status(400).json({ error: 'ID do veículo inválido' });
        return;
      }

      // Verificar se veículo existe
      const vehicle = await VehicleModel.findById(vehicleId);
      if (!vehicle) {
        res.status(404).json({ error: 'Veículo não encontrado' });
        return;
      }

      // Todas as OS do veículo
      const ordersResult = await pool.query(
        `SELECT o.id, o.order_number, o.status, o.total, o.subtotal, o.discount,
                o.started_at, o.finished_at, o.created_at,
                c.name as client_name,
                u.name as mechanic_name
         FROM orders o
         LEFT JOIN clients c ON o.client_id = c.id
         LEFT JOIN users u ON o.mechanic_id = u.id
         WHERE o.vehicle_id = $1
         ORDER BY o.created_at DESC`,
        [vehicleId]
      );

      // Itens das OS (produtos e serviços)
      const orders = ordersResult.rows;
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const itemsResult = await pool.query(
            `SELECT oi.id, oi.description, oi.quantity, oi.unit_price, oi.total_price,
                    oi.item_type, oi.product_id, oi.labor_id,
                    p.name as product_name, p.code as product_code,
                    lt.name as labor_name
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN labor_types lt ON oi.labor_id = lt.id
             WHERE oi.order_id = $1
             ORDER BY oi.id`,
            [order.id]
          );

          return {
            ...order,
            items: itemsResult.rows,
          };
        })
      );

      // Garantias do veículo
      const warrantiesResult = await pool.query(
        `SELECT w.id, w.description, w.start_date, w.end_date, w.status,
                w.warranty_period_days,
                o.order_number
         FROM warranties w
         INNER JOIN orders o ON w.order_id = o.id
         WHERE o.vehicle_id = $1
         ORDER BY w.start_date DESC`,
        [vehicleId]
      );

      // Estatísticas
      const statsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'finished' THEN total ELSE 0 END) as total_spent,
          MAX(CASE WHEN status = 'finished' THEN finished_at END) as last_service,
          MIN(created_at) as first_service
         FROM orders
         WHERE vehicle_id = $1`,
        [vehicleId]
      );
      const stats = statsResult.rows[0];

      res.json({
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          plate: vehicle.plate,
          current_mileage: vehicle.mileage,
        },
        statistics: {
          total_orders: parseInt(stats.total_orders || '0'),
          total_spent: parseFloat(stats.total_spent || '0'),
          last_service: stats.last_service || null,
          first_service: stats.first_service || null,
        },
        orders: ordersWithItems,
        warranties: warrantiesResult.rows,
      });
    } catch (error) {
      console.error('Get vehicle history error:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico do veículo' });
    }
  }
}

// Validações
export const createVehicleValidation = [
  body('client_id').isInt().withMessage('ID do cliente é obrigatório'),
  body('brand').notEmpty().withMessage('Marca é obrigatória'),
  body('model').notEmpty().withMessage('Modelo é obrigatório'),
  body('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Ano inválido'),
  body('mileage').optional().isInt({ min: 0 }).withMessage('Quilometragem deve ser positiva'),
];

export const updateVehicleValidation = [
  body('brand').optional().notEmpty().withMessage('Marca não pode ser vazia'),
  body('model').optional().notEmpty().withMessage('Modelo não pode ser vazio'),
  body('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Ano inválido'),
  body('mileage').optional().isInt({ min: 0 }).withMessage('Quilometragem deve ser positiva'),
];

