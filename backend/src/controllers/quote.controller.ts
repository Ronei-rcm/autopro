import { Request, Response } from 'express';
import { QuoteModel } from '../models/quote.model';
import { OrderModel } from '../models/order.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { QuoteStatus, Order } from '../types';

export class QuoteController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const clientId = req.query.client_id ? parseInt(req.query.client_id as string) : undefined;
      const search = req.query.search as string | undefined;

      const quotes = await QuoteModel.findAll(status, clientId, search);
      res.json(quotes);
    } catch (error) {
      console.error('List quotes error:', error);
      res.status(500).json({ error: 'Erro ao listar orçamentos' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const quote = await QuoteModel.findById(id);
      if (!quote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      res.json(quote);
    } catch (error) {
      console.error('Get quote error:', error);
      res.status(500).json({ error: 'Erro ao buscar orçamento' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { client_id, vehicle_id, status, discount, valid_until, notes, items } = req.body;

      if (!items || items.length === 0) {
        res.status(400).json({ error: 'Orçamento deve ter pelo menos um item' });
        return;
      }

      const quote = await QuoteModel.create(
        {
          client_id: parseInt(client_id),
          vehicle_id: parseInt(vehicle_id),
          user_id: req.userId!,
          status: (status || 'open') as QuoteStatus,
          discount: parseFloat(discount) || 0,
          valid_until: valid_until ? new Date(valid_until) : null,
          notes: notes || null,
        },
        items
      );

      res.status(201).json(quote);
    } catch (error: any) {
      console.error('Create quote error:', error);
      res.status(500).json({ error: 'Erro ao criar orçamento' });
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

      const existingQuote = await QuoteModel.findById(id);
      if (!existingQuote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      // Não permitir editar orçamento convertido
      if (existingQuote.status === 'converted') {
        res.status(400).json({ error: 'Não é possível editar orçamento convertido' });
        return;
      }

      const { status, discount, valid_until, notes, items } = req.body;

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (discount !== undefined) updateData.discount = discount;
      if (valid_until !== undefined) updateData.valid_until = valid_until;
      if (notes !== undefined) updateData.notes = notes;

      const quote = await QuoteModel.update(id, updateData, items);
      res.json(quote);
    } catch (error: any) {
      console.error('Update quote error:', error);
      res.status(500).json({ error: 'Erro ao atualizar orçamento' });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const { status } = req.body;
      if (!['open', 'approved', 'rejected', 'converted'].includes(status)) {
        res.status(400).json({ error: 'Status inválido' });
        return;
      }

      const updated = await QuoteModel.updateStatus(id, status);
      if (!updated) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Update quote status error:', error);
      res.status(500).json({ error: 'Erro ao atualizar status do orçamento' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const existingQuote = await QuoteModel.findById(id);
      if (!existingQuote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      // Não permitir excluir orçamento convertido
      if (existingQuote.status === 'converted') {
        res.status(400).json({ error: 'Não é possível excluir orçamento convertido' });
        return;
      }

      const deleted = await QuoteModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete quote error:', error);
      res.status(500).json({ error: 'Erro ao deletar orçamento' });
    }
  }

  static async convertToOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const quote = await QuoteModel.findById(id);
      if (!quote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      if (quote.status === 'converted') {
        res.status(400).json({ error: 'Orçamento já foi convertido' });
        return;
      }

      if (!quote.items || quote.items.length === 0) {
        res.status(400).json({ error: 'Orçamento não possui itens' });
        return;
      }

      const { mechanic_id } = req.body;

      // Gerar número da ordem
      const orderNumber = await OrderModel.generateOrderNumber();

      // Criar ordem de serviço baseada no orçamento
      const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
        quote_id: quote.id,
        client_id: quote.client_id,
        vehicle_id: quote.vehicle_id,
        mechanic_id: mechanic_id || undefined,
        order_number: orderNumber,
        status: 'open' as const,
        subtotal: quote.subtotal,
        discount: quote.discount,
        total: quote.total,
        technical_notes: quote.notes || undefined,
      };

      const order = await OrderModel.create(orderData);

      // Adicionar itens da ordem
      for (const item of quote.items) {
        await OrderModel.addItem({
          order_id: order.id,
          product_id: item.product_id || null,
          labor_id: item.labor_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          item_type: item.item_type,
        });
      }

      // Buscar ordem completa com itens
      const fullOrder = await OrderModel.findById(order.id);
      const orderItems = await OrderModel.getItems(order.id);

      // Atualizar status do orçamento para 'converted'
      await QuoteModel.updateStatus(id, 'converted');

      res.status(201).json({ order: { ...fullOrder, items: orderItems }, message: 'Orçamento convertido em ordem de serviço com sucesso' });
    } catch (error: any) {
      console.error('Convert quote to order error:', error);
      res.status(500).json({ error: 'Erro ao converter orçamento em ordem de serviço' });
    }
  }

  static async addItem(req: AuthRequest, res: Response): Promise<void> {
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

      const quote = await QuoteModel.findById(id);
      if (!quote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      if (quote.status === 'converted') {
        res.status(400).json({ error: 'Não é possível adicionar item a orçamento convertido' });
        return;
      }

      const { product_id, labor_id, description, quantity, unit_price, item_type } = req.body;

      if (item_type === 'product' && !product_id) {
        res.status(400).json({ error: 'product_id é obrigatório para item do tipo product' });
        return;
      }

      if (item_type === 'labor' && !labor_id) {
        res.status(400).json({ error: 'labor_id é obrigatório para item do tipo labor' });
        return;
      }

      const total_price = quantity * unit_price;

      const item = await QuoteModel.addItem(id, {
        product_id: product_id || null,
        labor_id: labor_id || null,
        description,
        quantity,
        unit_price,
        total_price,
        item_type,
      });

      const updatedQuote = await QuoteModel.findById(id);
      res.json({ item, quote: updatedQuote });
    } catch (error: any) {
      console.error('Add quote item error:', error);
      res.status(500).json({ error: 'Erro ao adicionar item ao orçamento' });
    }
  }

  static async removeItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);

      if (isNaN(id) || isNaN(itemId)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const quote = await QuoteModel.findById(id);
      if (!quote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      if (quote.status === 'converted') {
        res.status(400).json({ error: 'Não é possível remover item de orçamento convertido' });
        return;
      }

      const removed = await QuoteModel.removeItem(itemId, id);
      if (!removed) {
        res.status(404).json({ error: 'Item não encontrado' });
        return;
      }

      const updatedQuote = await QuoteModel.findById(id);
      res.json({ quote: updatedQuote, message: 'Item removido com sucesso' });
    } catch (error: any) {
      console.error('Remove quote item error:', error);
      res.status(500).json({ error: 'Erro ao remover item do orçamento' });
    }
  }
}

// Validações
export const createQuoteValidation = [
  body('client_id').isInt().withMessage('ID do cliente é obrigatório'),
  body('vehicle_id').isInt().withMessage('ID do veículo é obrigatório'),
  body('items').isArray({ min: 1 }).withMessage('Orçamento deve ter pelo menos um item'),
  body('items.*.description').notEmpty().withMessage('Descrição do item é obrigatória'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que zero'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Preço unitário deve ser maior ou igual a zero'),
  body('items.*.item_type').isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
  body('items.*.product_id').if(body('items.*.item_type').equals('product')).notEmpty().withMessage('product_id é obrigatório para produto'),
  body('items.*.labor_id').if(body('items.*.item_type').equals('labor')).notEmpty().withMessage('labor_id é obrigatório para serviço'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Desconto deve ser maior ou igual a zero'),
  body('status').optional().isIn(['open', 'approved', 'rejected']).withMessage('Status inválido'),
];

export const updateQuoteValidation = [
  body('status').optional().isIn(['open', 'approved', 'rejected']).withMessage('Status inválido'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Desconto deve ser maior ou igual a zero'),
  body('items').optional().isArray().withMessage('Items deve ser um array'),
];

export const addItemValidation = [
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que zero'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Preço unitário deve ser maior ou igual a zero'),
  body('item_type').isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
  body('product_id').if(body('item_type').equals('product')).notEmpty().withMessage('product_id é obrigatório para produto'),
  body('labor_id').if(body('item_type').equals('labor')).notEmpty().withMessage('labor_id é obrigatório para serviço'),
];
