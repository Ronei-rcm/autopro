import { Request, Response } from 'express';
import { InventoryMovementModel } from '../models/inventory-movement.model';

export class InventoryMovementController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.query.product_id ? parseInt(req.query.product_id as string) : undefined;
      const type = req.query.type as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const movements = await InventoryMovementModel.findAll(productId, type, limit);
      res.json(movements);
    } catch (error) {
      console.error('List movements error:', error);
      res.status(500).json({ error: 'Erro ao listar movimentações' });
    }
  }

  static async getByProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        res.status(400).json({ error: 'ID do produto inválido' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const movements = await InventoryMovementModel.findByProduct(productId, limit);
      res.json(movements);
    } catch (error) {
      console.error('Get movements by product error:', error);
      res.status(500).json({ error: 'Erro ao buscar movimentações do produto' });
    }
  }
}

