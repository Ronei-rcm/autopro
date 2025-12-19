import { Request, Response } from 'express';
import { VehicleModel } from '../models/vehicle.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

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

