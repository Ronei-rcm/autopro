import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { ProductModel } from '../models/product.model';
import { InventoryMovementModel } from '../models/inventory-movement.model';
import { OrderHistoryModel } from '../models/order-history.model';
import { AccountReceivableModel } from '../models/account-receivable.model';
import { InstallmentModel } from '../models/installment.model';
import { OrderTemplateModel } from '../models/order-template.model';
import { OrderFileModel } from '../models/order-file.model';
import { WarrantyModel } from '../models/warranty.model';
import { NotificationModel } from '../models/notification.model';
import { UserModel } from '../models/user.model';
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
      const files = await OrderFileModel.findByOrder(id);
      res.json({ ...order, items, history, files });
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
              await OrderModel.addItem({
                order_id: order.id,
                product_id: item.product_id || null,
                labor_id: item.labor_id || null,
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

      // Verificar se a ordem existe
      const order = await OrderModel.findById(id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      // Verificar se há contas a receber vinculadas
      try {
        const receivables = await AccountReceivableModel.findAll(undefined, undefined, undefined, undefined);
        const linkedReceivables = receivables.filter((ar: any) => ar.order_id === id);
        
        if (linkedReceivables.length > 0) {
          // Verificar se as contas estão pagas ou podem ser canceladas
          const unpaidReceivables = linkedReceivables.filter((ar: any) => 
            ar.status === 'open' || ar.status === 'overdue'
          );
          
          if (unpaidReceivables.length > 0) {
            res.status(400).json({ 
              error: 'Não é possível excluir esta ordem de serviço pois existem contas a receber em aberto vinculadas. Cancele ou exclua as contas primeiro.',
              linked_receivables: linkedReceivables.length,
              unpaid_receivables: unpaidReceivables.length,
              receivable_ids: unpaidReceivables.map((ar: any) => ar.id)
            });
            return;
          }
          
          // Se todas as contas estão pagas ou canceladas, podemos continuar
          // Mas vamos remover a referência primeiro para evitar erro de foreign key
          const updateClient = await pool.connect();
          try {
            for (const receivable of linkedReceivables) {
              await updateClient.query(
                'UPDATE accounts_receivable SET order_id = NULL WHERE id = $1',
                [receivable.id]
              );
            }
          } finally {
            updateClient.release();
          }
        }
      } catch (receivableError: any) {
        // Se falhar ao verificar, continuar (pode ser que a tabela não exista ainda)
        console.warn('Aviso ao verificar contas a receber:', receivableError.message);
      }

      // Deletar usando transação para garantir consistência
      const client = await pool.connect();
      let transactionStarted = false;
      
      try {
        await client.query('BEGIN');
        transactionStarted = true;

        // Deletar a ordem (CASCADE vai deletar itens, histórico, arquivos, garantias, etc)
        const deleteResult = await client.query('DELETE FROM orders WHERE id = $1', [id]);
        
        if (!deleteResult.rowCount || deleteResult.rowCount === 0) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          client.release();
          res.status(404).json({ error: 'Ordem de serviço não encontrada' });
          return;
        }

        await client.query('COMMIT');
        transactionStarted = false;
        client.release();
        res.status(204).send();
      } catch (dbError: any) {
        if (transactionStarted) {
          try {
            await client.query('ROLLBACK');
          } catch (rollbackError: any) {
            console.error('Erro ao fazer rollback:', rollbackError);
          }
        }
        client.release();
        throw dbError;
      }
    } catch (error: any) {
      console.error('Delete order error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Verificar tipo de erro
      if (error.code === '23503') { // Foreign key violation
        res.status(400).json({ 
          error: 'Não é possível excluir esta ordem de serviço pois existem registros vinculados. Verifique contas a receber, garantias ou outros registros relacionados.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      } else if (error.code === '42P01') { // Table does not exist
        res.status(500).json({ 
          error: 'Erro ao deletar ordem de serviço. Tabela não encontrada.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      } else {
        res.status(500).json({ 
          error: 'Erro ao deletar ordem de serviço',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        });
      }
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
      if (!existingOrder) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      let newDiscount = parseFloat(discount) || 0;
      
      // Validar que o desconto não pode ser maior que o subtotal
      if (newDiscount > existingOrder.subtotal) {
        res.status(400).json({ 
          error: `O desconto não pode ser maior que o subtotal (R$ ${existingOrder.subtotal.toFixed(2)})`,
          max_discount: existingOrder.subtotal
        });
        return;
      }

      // Se não há itens, não permitir desconto
      if (existingOrder.subtotal === 0 && newDiscount > 0) {
        res.status(400).json({ 
          error: 'Não é possível adicionar desconto quando não há itens na ordem de serviço'
        });
        return;
      }

      if (existingOrder.discount !== newDiscount) {
        await OrderHistoryModel.create({
          order_id: id,
          field_changed: 'discount',
          old_value: existingOrder.discount.toString(),
          new_value: newDiscount.toString(),
          changed_by: req.userId,
          notes: `Desconto alterado de ${existingOrder.discount} para ${newDiscount}`,
        });
      }

      await OrderModel.update(id, { discount: newDiscount });
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
      try {
        const existingReceivables = await AccountReceivableModel.findAll(undefined, undefined, undefined, undefined);
        const existingReceivable = existingReceivables.find((ar: any) => ar.order_id === orderId);
        
        if (existingReceivable) {
          res.status(400).json({ error: 'Já existe uma conta a receber para esta ordem de serviço' });
          return;
        }
      } catch (error: any) {
        // Se houver erro ao buscar, continuar (pode ser que não exista ainda)
        console.warn('Aviso ao verificar contas existentes:', error.message);
      }

      const { use_installments, installment_count, first_due_date, payment_method } = req.body;

      // Calcular data de vencimento padrão (30 dias a partir de hoje)
      const defaultDueDate = first_due_date ? new Date(first_due_date) : new Date();
      if (!first_due_date) {
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      }

      // Criar conta a receber
      const orderWithVehicle = order as any; // Order pode ter brand/model do JOIN
      const vehicleInfo = orderWithVehicle.brand || orderWithVehicle.model 
        ? `${orderWithVehicle.brand || ''} ${orderWithVehicle.model || ''}`.trim()
        : '';
      const receivableData = {
        order_id: orderId,
        client_id: order.client_id,
        description: `OS ${order.order_number}${vehicleInfo ? ` - ${vehicleInfo}` : ''}`.trim(),
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
        try {
          // Calcular valores das parcelas com precisão
          const totalAmount = parseFloat(order.total.toString());
          const installmentCount = parseInt(installment_count.toString());
          
          if (installmentCount <= 0 || installmentCount > 24) {
            throw new Error('Número de parcelas inválido (deve ser entre 1 e 24)');
          }
          
          // Calcular valor base de cada parcela
          const baseAmount = Math.floor((totalAmount / installmentCount) * 100) / 100;
          // Calcular diferença para garantir que a soma seja exata
          const totalBaseAmount = baseAmount * installmentCount;
          const remainder = parseFloat((totalAmount - totalBaseAmount).toFixed(2));
          
          const firstDueDate = first_due_date ? new Date(first_due_date) : new Date(defaultDueDate);

          const installmentPromises = [];
          for (let i = 0; i < installmentCount; i++) {
            const installmentDueDate = new Date(firstDueDate);
            installmentDueDate.setMonth(installmentDueDate.getMonth() + i);
            
            // Primeira parcela recebe o resto para garantir que a soma seja exata
            const amount = i === 0 
              ? parseFloat((baseAmount + remainder).toFixed(2))
              : parseFloat(baseAmount.toFixed(2));
            
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
        } catch (installmentError: any) {
          console.error('Erro ao criar parcelas:', installmentError);
          // Se falhar ao criar parcelas, ainda retornar a conta criada
          // mas avisar sobre o problema
          if (installmentError.code === '42P01') {
            console.warn('Tabela installments não existe. Parcelas não foram criadas.');
          } else {
            // Re-throw para ser capturado pelo catch externo
            throw installmentError;
          }
        }
      }

      // Buscar conta completa com parcelas se houver
      const fullReceivable = await AccountReceivableModel.findById(receivable.id);
      if (fullReceivable) {
        try {
          const installments = await InstallmentModel.findByReceivableId(receivable.id);
          res.status(201).json({ ...fullReceivable, installments: installments || [] });
        } catch (installmentError: any) {
          // Se falhar ao buscar parcelas, retornar sem elas
          console.warn('Aviso ao buscar parcelas:', installmentError.message);
          res.status(201).json({ ...fullReceivable, installments: [] });
        }
      } else {
        res.status(201).json(receivable);
      }
    } catch (error: any) {
      console.error('Generate receivable error:', error);
      res.status(500).json({ 
        error: 'Erro ao gerar conta a receber',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

      // Criar notificação para o financeiro quando OS é finalizada
      if (action === 'finish' && updatedOrder) {
        try {
          const formattedTotal = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(updatedOrder.total || 0));

          await NotificationModel.create({
            profile: 'financial',
            type: 'order_finished',
            title: `OS #${updatedOrder.order_number} Finalizada`,
            message: `A ordem de serviço #${updatedOrder.order_number} do cliente ${updatedOrder.client_name || 'N/A'} foi finalizada. Valor total: ${formattedTotal}. Gere a conta a receber para continuar o processo.`,
            reference_type: 'order',
            reference_id: id,
            action_url: `/financeiro?order_id=${id}`,
            read: false,
          });
        } catch (notifError) {
          // Não falhar a requisição se a notificação falhar
          console.error('Erro ao criar notificação:', notifError);
        }
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error('Quick action error:', error);
      res.status(500).json({ error: 'Erro ao executar ação' });
    }
  }

  // Assumir OS (mecânico assume uma OS sem mecânico ou de outro mecânico)
  static async assumeOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const order = await OrderModel.findById(id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      // Verificar se a OS já está finalizada ou cancelada
      if (order.status === 'finished' || order.status === 'cancelled') {
        res.status(400).json({ error: 'Não é possível assumir uma OS finalizada ou cancelada' });
        return;
      }

      const previousMechanicId = order.mechanic_id;
      const previousMechanicName = order.mechanic_name;

      // Atualizar mecânico da OS
      await OrderModel.update(id, { mechanic_id: userId });

      // Registrar histórico
      await OrderHistoryModel.create({
        order_id: id,
        field_changed: 'mechanic_id',
        old_value: previousMechanicId?.toString() || 'Sem mecânico',
        new_value: userId.toString(),
        changed_by: userId,
        notes: previousMechanicId 
          ? `OS transferida de ${previousMechanicName || 'outro mecânico'} para o usuário atual`
          : 'OS assumida pelo usuário atual',
      });

      const updatedOrder = await OrderModel.findById(id);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Assume order error:', error);
      res.status(500).json({ error: 'Erro ao assumir ordem de serviço' });
    }
  }

  // Transferir OS para outro mecânico
  static async transferOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { mechanic_id } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID da ordem inválido' });
        return;
      }

      if (!mechanic_id || isNaN(parseInt(mechanic_id.toString()))) {
        res.status(400).json({ error: 'ID do mecânico inválido' });
        return;
      }

      const newMechanicId = parseInt(mechanic_id.toString());

      const order = await OrderModel.findById(id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      // Verificar se a OS já está finalizada ou cancelada
      if (order.status === 'finished' || order.status === 'cancelled') {
        res.status(400).json({ error: 'Não é possível transferir uma OS finalizada ou cancelada' });
        return;
      }

      // Verificar se o novo mecânico existe e é mecânico
      const newMechanic = await UserModel.findById(newMechanicId);
      if (!newMechanic || newMechanic.profile !== 'mechanic') {
        res.status(400).json({ error: 'Mecânico inválido ou não encontrado' });
        return;
      }

      const previousMechanicId = order.mechanic_id;
      const previousMechanicName = order.mechanic_name;

      // Atualizar mecânico da OS
      await OrderModel.update(id, { mechanic_id: newMechanicId });

      // Registrar histórico
      await OrderHistoryModel.create({
        order_id: id,
        field_changed: 'mechanic_id',
        old_value: previousMechanicId?.toString() || 'Sem mecânico',
        new_value: newMechanicId.toString(),
        changed_by: req.userId,
        notes: `OS transferida de ${previousMechanicName || 'sem mecânico'} para ${newMechanic.name}`,
      });

      const updatedOrder = await OrderModel.findById(id);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Transfer order error:', error);
      res.status(500).json({ error: 'Erro ao transferir ordem de serviço' });
    }
  }

  static async saveSignature(req: AuthRequest, res: Response): Promise<void> {
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

      const { signature, signed_by_name } = req.body;

      const order = await OrderModel.findById(id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      await OrderModel.updateSignature(id, signature, signed_by_name);
      
      // Registrar no histórico
      await OrderHistoryModel.create({
        order_id: id,
        field_changed: 'Assinatura do Cliente',
        new_value: 'Assinatura registrada',
        changed_by: req.userId || undefined,
        notes: `Assinado por: ${signed_by_name}`,
      });

      res.json({ message: 'Assinatura salva com sucesso' });
    } catch (error: any) {
      console.error('Save signature error:', error);
      res.status(500).json({ error: 'Erro ao salvar assinatura' });
    }
  }

  static async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const { file_data, file_name, file_type, description } = req.body;

      if (!file_data || !file_name) {
        res.status(400).json({ error: 'Dados do arquivo são obrigatórios' });
        return;
      }

      const order = await OrderModel.findById(id);
      if (!order) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      // Validar e calcular tamanho do arquivo
      let fileSize: number;
      try {
        // Tentar calcular o tamanho do base64
        fileSize = Buffer.from(file_data, 'base64').length;
      } catch (error) {
        // Se falhar, tentar calcular de outra forma
        fileSize = Math.ceil((file_data.length * 3) / 4);
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (fileSize > maxSize) {
        res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' });
        return;
      }

      // Salvar arquivo (armazenando base64 no banco por simplicidade)
      // Para produção, idealmente salvar em storage (S3, etc) e guardar apenas o path
      try {
        // Garantir que a tabela existe e está com o tipo correto
        await OrderFileModel.ensureTableExists();
        
        const file = await OrderFileModel.create({
          order_id: id,
          file_name,
          file_path: file_data, // Armazenando base64 diretamente por simplicidade
          file_type: file_type || 'photo',
          file_size: fileSize,
          description: description || null,
          uploaded_by: req.userId || undefined,
        });

        res.status(201).json(file);
      } catch (dbError: any) {
        // Verificar se é erro de campo muito longo (VARCHAR antigo)
        if (dbError.message?.includes('value too long') || dbError.message?.includes('character varying')) {
          console.error('Erro: campo file_path muito pequeno. Tentando alterar para TEXT...');
          try {
            // Tentar alterar o campo para TEXT
            await pool.query(`ALTER TABLE order_files ALTER COLUMN file_path TYPE TEXT;`);
            // Tentar novamente
            const file = await OrderFileModel.create({
              order_id: id,
              file_name,
              file_path: file_data,
              file_type: file_type || 'photo',
              file_size: fileSize,
              description: description || null,
              uploaded_by: req.userId || undefined,
            });
            res.status(201).json(file);
            return;
          } catch (alterError: any) {
            res.status(500).json({ 
              error: 'Erro ao salvar arquivo. O campo file_path precisa ser alterado para TEXT.',
              details: alterError.message 
            });
            return;
          }
        }
        
        // Verificar se é erro de tabela não encontrada
        if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
          res.status(500).json({ 
            error: 'Tabela order_files não existe. Execute a migration 007_add_order_signatures_and_files.sql',
            details: dbError.message 
          });
          return;
        }
        throw dbError;
      }
    } catch (error: any) {
      console.error('Upload file error:', error);
      res.status(500).json({ 
        error: 'Erro ao fazer upload do arquivo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const fileId = parseInt(req.params.fileId);

      if (isNaN(id) || isNaN(fileId)) {
        res.status(400).json({ error: 'IDs inválidos' });
        return;
      }

      const file = await OrderFileModel.findById(fileId);
      if (!file || file.order_id !== id) {
        res.status(404).json({ error: 'Arquivo não encontrado' });
        return;
      }

      await OrderFileModel.delete(fileId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Erro ao excluir arquivo' });
    }
  }

  static async getFile(req: Request, res: Response): Promise<void> {
    try {
      const fileId = parseInt(req.params.fileId);
      if (isNaN(fileId)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const file = await OrderFileModel.findById(fileId);
      if (!file) {
        res.status(404).json({ error: 'Arquivo não encontrado' });
        return;
      }

      res.json(file);
    } catch (error: any) {
      console.error('Get file error:', error);
      res.status(500).json({ error: 'Erro ao buscar arquivo' });
    }
  }

  static async createWarranties(req: AuthRequest, res: Response): Promise<void> {
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

      const { warranties } = req.body; // Array de { order_item_id, warranty_period_days, description }

      if (!Array.isArray(warranties) || warranties.length === 0) {
        res.status(400).json({ error: 'Lista de garantias é obrigatória' });
        return;
      }

      const items = await OrderModel.getItems(orderId);
      const createdWarranties = [];

      for (const warrantyData of warranties) {
        const { order_item_id, warranty_period_days, description, notes } = warrantyData;

        // Verificar se o item existe na ordem
        const item = items.find(i => i.id === order_item_id);
        if (!item) {
          continue; // Pular itens inválidos
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + warranty_period_days);

        const warranty = await WarrantyModel.create({
          order_id: orderId,
          order_item_id,
          product_id: item.product_id || null,
          labor_id: item.labor_id || null,
          description: description || item.description,
          warranty_period_days,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          notes: notes || null,
        });

        createdWarranties.push(warranty);
      }

      res.status(201).json({
        message: `${createdWarranties.length} garantia(s) criada(s) com sucesso`,
        warranties: createdWarranties,
      });
    } catch (error: any) {
      console.error('Create warranties error:', error);
      res.status(500).json({ error: 'Erro ao criar garantias' });
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

export const saveSignatureValidation = [
  body('signature').notEmpty().withMessage('Assinatura é obrigatória'),
  body('signed_by_name').notEmpty().withMessage('Nome de quem assinou é obrigatório'),
];

