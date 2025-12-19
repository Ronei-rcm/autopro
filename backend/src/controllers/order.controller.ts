import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { ProductModel } from '../models/product.model';
import { InventoryMovementModel } from '../models/inventory-movement.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class OrderController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const clientId = req.query.client_id ? parseInt(req.query.client_id as string) : undefined;
      const mechanicId = req.query.mechanic_id ? parseInt(req.query.mechanic_id as string) : undefined;
      const search = req.query.search as string | undefined;

      const orders = await OrderModel.findAll(status, clientId, mechanicId, search);
      res.json(orders);
    } catch (error) {
      console.error('List orders error:', error);
      res.status(500).json({ error: 'Erro ao listar ordens de serviço' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const order = await OrderModel.findById(id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      const items = await OrderModel.getItems(id);
      res.json({ ...order, items });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Erro ao buscar ordem de serviço' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const orderNumber = await OrderModel.generateOrderNumber();
      const order = await OrderModel.create({
        ...req.body,
        order_number: orderNumber,
      });

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Erro ao criar ordem de serviço' });
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

      const existingOrder = await OrderModel.findById(id);
      if (!existingOrder) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      const order = await OrderModel.update(id, req.body);
      
      // Se mudou status para finished, atualizar finished_at
      if (req.body.status === 'finished' && !order.finished_at) {
        await OrderModel.update(id, { finished_at: new Date() });
      }
      // Se mudou status para in_progress, atualizar started_at
      if (req.body.status === 'in_progress' && !order.started_at) {
        await OrderModel.update(id, { started_at: new Date() });
      }

      const updatedOrder = await OrderModel.findById(id);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error('Update order error:', error);
      res.status(500).json({ error: 'Erro ao atualizar ordem de serviço' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await OrderModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
    }
  }

  static async addItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        res.status(400).json({ error: 'ID da ordem inválido' });
        return;
      }

      const order = await OrderModel.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      const { product_id, labor_id, description, quantity, unit_price, item_type } = req.body;
      const total_price = quantity * unit_price;

      // Se for produto, verificar estoque e fazer saída
      if (item_type === 'product' && product_id) {
        const product = await ProductModel.findById(product_id);
        if (!product) {
          res.status(404).json({ error: 'Produto não encontrado' });
          return;
        }

        if (product.current_quantity < quantity) {
          res.status(400).json({ error: 'Estoque insuficiente' });
          return;
        }

        // Criar movimentação de saída
        await InventoryMovementModel.create({
          product_id,
          type: 'exit',
          quantity,
          reference_type: 'order',
          reference_id: orderId,
          notes: `Saída para OS ${order.order_number}`,
          created_by: req.userId,
        });
      }

      const item = await OrderModel.addItem({
        order_id: orderId,
        product_id: product_id || null,
        labor_id: labor_id || null,
        description,
        quantity,
        unit_price,
        total_price,
        item_type,
      });

      // Atualizar totais da ordem
      await OrderModel.updateTotals(orderId);

      res.status(201).json(item);
    } catch (error: any) {
      console.error('Add item error:', error);
      res.status(500).json({ error: 'Erro ao adicionar item' });
    }
  }

  static async removeItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);

      if (isNaN(orderId) || isNaN(itemId)) {
        res.status(400).json({ error: 'IDs inválidos' });
        return;
      }

      // Buscar item antes de remover
      const items = await OrderModel.getItems(orderId);
      const item = items.find((i) => i.id === itemId);

      if (!item) {
        res.status(404).json({ error: 'Item não encontrado' });
        return;
      }

      // Se for produto, reverter saída de estoque
      if (item.item_type === 'product' && item.product_id) {
        await InventoryMovementModel.create({
          product_id: item.product_id,
          type: 'entry',
          quantity: item.quantity,
          reference_type: 'order',
          reference_id: orderId,
          notes: `Reversão de item removido da OS`,
          created_by: req.userId,
        });
      }

      const deleted = await OrderModel.removeItem(itemId);
      if (!deleted) {
        res.status(404).json({ error: 'Item não encontrado' });
        return;
      }

      // Atualizar totais
      await OrderModel.updateTotals(orderId);

      res.status(204).send();
    } catch (error) {
      console.error('Remove item error:', error);
      res.status(500).json({ error: 'Erro ao remover item' });
    }
  }

  static async updateDiscount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { discount } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      await OrderModel.update(id, { discount: parseFloat(discount) || 0 });
      await OrderModel.updateTotals(id);

      const order = await OrderModel.findById(id);
      res.json(order);
    } catch (error) {
      console.error('Update discount error:', error);
      res.status(500).json({ error: 'Erro ao atualizar desconto' });
    }
  }
}

// Validações
export const createOrderValidation = [
  body('client_id').isInt().withMessage('Cliente é obrigatório'),
  body('vehicle_id').isInt().withMessage('Veículo é obrigatório'),
];

export const addItemValidation = [
  body('item_type').isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Preço unitário deve ser positivo'),
];

