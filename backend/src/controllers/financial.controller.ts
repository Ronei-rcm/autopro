import { Request, Response } from 'express';
import { AccountPayableModel } from '../models/account-payable.model';
import { AccountReceivableModel } from '../models/account-receivable.model';
import { CashFlowModel } from '../models/cash-flow.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class FinancialController {
  // Contas a Pagar
  static async listPayables(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const supplierId = req.query.supplier_id ? parseInt(req.query.supplier_id as string) : undefined;
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

      const payables = await AccountPayableModel.findAll(status, supplierId, startDate, endDate);
      res.json(payables);
    } catch (error) {
      console.error('List payables error:', error);
      res.status(500).json({ error: 'Erro ao listar contas a pagar' });
    }
  }

  static async getPayableById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const payable = await AccountPayableModel.findById(id);
      if (!payable) {
        res.status(404).json({ error: 'Conta a pagar não encontrada' });
        return;
      }

      res.json(payable);
    } catch (error) {
      console.error('Get payable error:', error);
      res.status(500).json({ error: 'Erro ao buscar conta a pagar' });
    }
  }

  static async createPayable(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const payable = await AccountPayableModel.create(req.body);
      res.status(201).json(payable);
    } catch (error: any) {
      console.error('Create payable error:', error);
      res.status(500).json({ error: 'Erro ao criar conta a pagar' });
    }
  }

  static async updatePayable(req: AuthRequest, res: Response): Promise<void> {
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

      const existingPayable = await AccountPayableModel.findById(id);
      if (!existingPayable) {
        res.status(404).json({ error: 'Conta a pagar não encontrada' });
        return;
      }

      // Se pagou totalmente, atualizar status
      if (req.body.paid_amount !== undefined) {
        const totalPaid = parseFloat(req.body.paid_amount);
        const totalAmount = parseFloat(existingPayable.amount);
        if (totalPaid >= totalAmount) {
          req.body.status = 'paid';
          req.body.paid_amount = totalAmount;
          if (!req.body.payment_date) {
            req.body.payment_date = new Date();
          }
        } else if (totalPaid > 0) {
          req.body.status = 'open';
        }
      }

      const payable = await AccountPayableModel.update(id, req.body);
      res.json(payable);
    } catch (error: any) {
      console.error('Update payable error:', error);
      res.status(500).json({ error: 'Erro ao atualizar conta a pagar' });
    }
  }

  static async deletePayable(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await AccountPayableModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Conta a pagar não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete payable error:', error);
      res.status(500).json({ error: 'Erro ao deletar conta a pagar' });
    }
  }

  // Contas a Receber
  static async listReceivables(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const clientId = req.query.client_id ? parseInt(req.query.client_id as string) : undefined;
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

      const receivables = await AccountReceivableModel.findAll(status, clientId, startDate, endDate);
      res.json(receivables);
    } catch (error) {
      console.error('List receivables error:', error);
      res.status(500).json({ error: 'Erro ao listar contas a receber' });
    }
  }

  static async getReceivableById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const receivable = await AccountReceivableModel.findById(id);
      if (!receivable) {
        res.status(404).json({ error: 'Conta a receber não encontrada' });
        return;
      }

      res.json(receivable);
    } catch (error) {
      console.error('Get receivable error:', error);
      res.status(500).json({ error: 'Erro ao buscar conta a receber' });
    }
  }

  static async createReceivable(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const receivable = await AccountReceivableModel.create(req.body);
      res.status(201).json(receivable);
    } catch (error: any) {
      console.error('Create receivable error:', error);
      res.status(500).json({ error: 'Erro ao criar conta a receber' });
    }
  }

  static async updateReceivable(req: AuthRequest, res: Response): Promise<void> {
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

      const existingReceivable = await AccountReceivableModel.findById(id);
      if (!existingReceivable) {
        res.status(404).json({ error: 'Conta a receber não encontrada' });
        return;
      }

      // Se recebeu totalmente, atualizar status
      if (req.body.paid_amount !== undefined) {
        const totalPaid = parseFloat(req.body.paid_amount);
        const totalAmount = parseFloat(existingReceivable.amount);
        if (totalPaid >= totalAmount) {
          req.body.status = 'paid';
          req.body.paid_amount = totalAmount;
          if (!req.body.payment_date) {
            req.body.payment_date = new Date();
          }
        } else if (totalPaid > 0) {
          req.body.status = 'open';
        }
      }

      const receivable = await AccountReceivableModel.update(id, req.body);
      res.json(receivable);
    } catch (error: any) {
      console.error('Update receivable error:', error);
      res.status(500).json({ error: 'Erro ao atualizar conta a receber' });
    }
  }

  static async deleteReceivable(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await AccountReceivableModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Conta a receber não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete receivable error:', error);
      res.status(500).json({ error: 'Erro ao deletar conta a receber' });
    }
  }

  // Fluxo de Caixa
  static async listCashFlow(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;
      const type = req.query.type as string | undefined;
      const category = req.query.category as string | undefined;

      const cashFlow = await CashFlowModel.findAll(startDate, endDate, type, category);
      res.json(cashFlow);
    } catch (error) {
      console.error('List cash flow error:', error);
      res.status(500).json({ error: 'Erro ao listar fluxo de caixa' });
    }
  }

  static async createCashFlow(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const cashFlow = await CashFlowModel.create({
        ...req.body,
        created_by: req.userId,
      });
      res.status(201).json(cashFlow);
    } catch (error: any) {
      console.error('Create cash flow error:', error);
      res.status(500).json({ error: 'Erro ao criar movimento de caixa' });
    }
  }

  // Dashboard e Relatórios
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const payableSummary = await AccountPayableModel.getSummary();
      const receivableSummary = await AccountReceivableModel.getSummary();
      
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
      const cashFlowSummary = await CashFlowModel.getSummary(startOfMonth, endOfMonth);

      res.json({
        payables: payableSummary,
        receivables: receivableSummary,
        cashFlow: cashFlowSummary,
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
  }
}

// Validações
export const createPayableValidation = [
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('due_date').isISO8601().withMessage('Data de vencimento inválida'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
];

export const createReceivableValidation = [
  body('client_id').isInt().withMessage('Cliente é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('due_date').isISO8601().withMessage('Data de vencimento inválida'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
];

export const createCashFlowValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
  body('date').isISO8601().withMessage('Data inválida'),
];

