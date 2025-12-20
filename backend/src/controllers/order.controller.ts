import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { ProductModel } from '../models/product.model';
import { InventoryMovementModel } from '../models/inventory-movement.model';
import { OrderHistoryModel } from '../models/order-history.model';
import { AccountReceivableModel } from '../models/account-receivable.model';
import { InstallmentModel } from '../models/installment.model';
import { OrderTemplateModel } from '../models/order-template.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import pool from '../config/database';

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
      const history = await OrderHistoryModel.findByOrder(id);
      res.json({ ...order, items, history });
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

      const { template_id, ...orderData } = req.body;
      const orderNumber = await OrderModel.generateOrderNumber();
      const order = await OrderModel.create({
        ...orderData,
        order_number: orderNumber,
      });

      // Se template_id foi fornecido, aplicar os itens do template
      if (template_id) {
        const template = await OrderTemplateModel.findById(parseInt(template_id));
        if (template && template.items && template.items.length > 0) {
          for (const item of template.items) {
            try {
              await OrderModel.addItem(order.id, {
                product_id: item.product_id || undefined,
                labor_id: item.labor_id || undefined,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                item_type: item.item_type,
              });
            } catch (itemError) {
              console.error(`Erro ao adicionar item do template: ${item.description}`, itemError);
              // Continua adicionando outros itens mesmo se um falhar
            }
          }
          // Atualizar totais da OS após adicionar todos os itens
          await OrderModel.updateTotals(order.id);
          // Retornar ordem atualizada com itens
          const updatedOrder = await OrderModel.findById(order.id);
          const items = await OrderModel.getItems(order.id);
          res.status(201).json({ ...updatedOrder, items });
          return;
        }
      }

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

  static async updateItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);

      if (isNaN(orderId) || isNaN(itemId)) {
        res.status(400).json({ error: 'IDs inválidos' });
        return;
      }

      const order = await OrderModel.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      // Buscar item atual
      const currentItem = await OrderModel.getItemById(itemId);
      if (!currentItem || currentItem.order_id !== orderId) {
        res.status(404).json({ error: 'Item não encontrado' });
        return;
      }

      const { description, quantity, unit_price } = req.body;
      const newTotalPrice = quantity * unit_price;

      // Se for produto, atualizar estoque
      if (currentItem.item_type === 'product' && currentItem.product_id) {
        const product = await ProductModel.findById(currentItem.product_id);
        if (!product) {
          res.status(404).json({ error: 'Produto não encontrado' });
          return;
        }

        const quantityDifference = quantity - currentItem.quantity;

        // Se a quantidade aumentou, verificar estoque
        if (quantityDifference > 0) {
          if (product.current_quantity < quantityDifference) {
            res.status(400).json({ error: 'Estoque insuficiente' });
            return;
          }

          // Criar movimentação de saída pela diferença
          await InventoryMovementModel.create({
            product_id: currentItem.product_id,
            type: 'exit',
            quantity: quantityDifference,
            reference_type: 'order',
            reference_id: orderId,
            notes: `Atualização de quantidade na OS ${order.order_number}`,
            created_by: req.userId,
          });
        } else if (quantityDifference < 0) {
          // Se a quantidade diminuiu, criar movimentação de entrada pela diferença
          await InventoryMovementModel.create({
            product_id: currentItem.product_id,
            type: 'entry',
            quantity: Math.abs(quantityDifference),
            reference_type: 'order',
            reference_id: orderId,
            notes: `Atualização de quantidade na OS ${order.order_number}`,
            created_by: req.userId,
          });
        }
      }

      // Atualizar item
      const updatedItem = await OrderModel.updateItem(itemId, {
        description,
        quantity,
        unit_price,
        total_price: newTotalPrice,
      });

      if (!updatedItem) {
        res.status(404).json({ error: 'Item não encontrado' });
        return;
      }

      // Atualizar totais da ordem
      await OrderModel.updateTotals(orderId);

      res.json(updatedItem);
    } catch (error: any) {
      console.error('Update item error:', error);
      res.status(500).json({ error: 'Erro ao atualizar item' });
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

      const existingOrder = await OrderModel.findById(id);
      if (existingOrder && existingOrder.discount !== parseFloat(discount || '0')) {
        await OrderHistoryModel.create({
          order_id: id,
          field_changed: 'discount',
          old_value: existingOrder.discount.toString(),
          new_value: discount,
          changed_by: req.userId,
          notes: `Desconto alterado de ${existingOrder.discount} para ${discount}`,
        });
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

  static async generateReceivable(req: AuthRequest, res: Response): Promise<void> {
    try {
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

      // Verificar se já existe conta a receber para esta OS
      const existingReceivables = await AccountReceivableModel.findAll(undefined, undefined, undefined, undefined);
      const existingReceivable = existingReceivables.find((ar: any) => ar.order_id === orderId);
      
      if (existingReceivable) {
        res.status(400).json({ error: 'Já existe uma conta a receber para esta ordem de serviço' });
        return;
      }

      const { use_installments, installment_count, first_due_date, payment_method } = req.body;

      // Calcular data de vencimento padrão (30 dias a partir de hoje)
      const defaultDueDate = first_due_date ? new Date(first_due_date) : new Date();
      if (!first_due_date) {
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      }

      // Criar conta a receber
      const receivableData = {
        order_id: orderId,
        client_id: order.client_id,
        description: `OS ${order.order_number} - ${order.brand || ''} ${order.model || ''}`.trim(),
        due_date: defaultDueDate,
        amount: order.total,
        paid_amount: 0,
        payment_method: payment_method || null,
        status: 'open',
        notes: `Gerada automaticamente da OS ${order.order_number}`,
      };

      const receivable = await AccountReceivableModel.create(receivableData);

      // Se usar parcelas, criar parcelas
      if (use_installments && installment_count && installment_count > 1) {
        const baseAmount = Math.floor((order.total / installment_count) * 100) / 100;
        const remainder = Math.round((order.total - (baseAmount * installment_count)) * 100) / 100;
        const firstDueDate = new Date(first_due_date || defaultDueDate);

        const installmentPromises = [];
        for (let i = 0; i < installment_count; i++) {
          const installmentDueDate = new Date(firstDueDate);
          installmentDueDate.setMonth(installmentDueDate.getMonth() + i);
          
          const amount = i === 0 ? baseAmount + remainder : baseAmount;
          
          installmentPromises.push(
            InstallmentModel.create({
              account_receivable_id: receivable.id,
              installment_number: i + 1,
              due_date: installmentDueDate,
              amount: amount,
              paid_amount: 0,
              status: 'open',
              payment_method: payment_method || null,
              notes: null,
            })
          );
        }
        
        await Promise.all(installmentPromises);
      }

      // Buscar conta completa com parcelas se houver
      const fullReceivable = await AccountReceivableModel.findById(receivable.id);
      if (fullReceivable) {
        const installments = await InstallmentModel.findByReceivableId(receivable.id);
        res.status(201).json({ ...fullReceivable, installments });
      } else {
        res.status(201).json(receivable);
      }
    } catch (error: any) {
      console.error('Generate receivable error:', error);
      res.status(500).json({ error: 'Erro ao gerar conta a receber' });
    }
  }

  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      
      // Total de OS
      const totalResult = await pool.query('SELECT COUNT(*) as count FROM orders');
      const total = parseInt(totalResult.rows[0].count);

      // Por status
      const statusResult = await pool.query(
        `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
      );
      const byStatus = statusResult.rows.reduce((acc: any, row: any) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {});

      // Total em valores
      const valueResult = await pool.query(
        `SELECT 
          SUM(CASE WHEN status = 'finished' THEN total ELSE 0 END) as finished_total,
          SUM(CASE WHEN status IN ('open', 'in_progress', 'waiting_parts') THEN total ELSE 0 END) as pending_total,
          SUM(total) as total_all
         FROM orders`
      );
      const values = valueResult.rows[0];

      // OS do mês
      const monthResult = await pool.query(
        `SELECT COUNT(*) as count, SUM(total) as total
         FROM orders
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`
      );
      const thisMonth = monthResult.rows[0];

      res.json({
        total,
        byStatus,
        values: {
          finished: parseFloat(values.finished_total || '0'),
          pending: parseFloat(values.pending_total || '0'),
          all: parseFloat(values.total_all || '0'),
        },
        thisMonth: {
          count: parseInt(thisMonth.count),
          total: parseFloat(thisMonth.total || '0'),
        },
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  static async quickAction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { action } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const order = await OrderModel.findById(id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      let newStatus = order.status;
      let updateData: any = {};

      switch (action) {
        case 'start':
          newStatus = 'in_progress';
          updateData = { status: newStatus, started_at: new Date() };
          break;
        case 'finish':
          newStatus = 'finished';
          updateData = { status: newStatus, finished_at: new Date() };
          break;
        case 'wait_parts':
          newStatus = 'waiting_parts';
          updateData = { status: newStatus };
          break;
        case 'cancel':
          newStatus = 'cancelled';
          updateData = { status: newStatus };
          break;
        case 'reopen':
          newStatus = 'open';
          updateData = { status: newStatus };
          break;
        default:
          res.status(400).json({ error: 'Ação inválida' });
          return;
      }

      // Registrar histórico
      if (order.status !== newStatus) {
        await OrderHistoryModel.create({
          order_id: id,
          field_changed: 'status',
          old_value: order.status,
          new_value: newStatus,
          changed_by: req.userId,
          notes: `Ação rápida: ${action}`,
        });
      }

      await OrderModel.update(id, updateData);
      const updatedOrder = await OrderModel.findById(id);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Quick action error:', error);
      res.status(500).json({ error: 'Erro ao executar ação' });
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

export const updateItemValidation = [
  body('description').optional().notEmpty().withMessage('Descrição não pode ser vazia'),
  body('quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
  body('unit_price').optional().isFloat({ min: 0 }).withMessage('Preço unitário deve ser positivo'),
];

