import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import pool from '../config/database';

export class ReportController {
  // Relatório Financeiro
  static async financial(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : new Date();

      // Receitas (contas a receber pagas)
      const receivablesResult = await pool.query(
        `SELECT 
          DATE_TRUNC('day', payment_date) as date,
          SUM(amount) as total
         FROM accounts_receivable
         WHERE status = 'paid'
         AND payment_date >= $1 AND payment_date <= $2
         GROUP BY DATE_TRUNC('day', payment_date)
         ORDER BY date ASC`,
        [startDate, endDate]
      );

      // Despesas (contas a pagar pagas)
      const payablesResult = await pool.query(
        `SELECT 
          DATE_TRUNC('day', payment_date) as date,
          SUM(amount) as total
         FROM accounts_payable
         WHERE status = 'paid'
         AND payment_date >= $1 AND payment_date <= $2
         GROUP BY DATE_TRUNC('day', payment_date)
         ORDER BY date ASC`,
        [startDate, endDate]
      );

      // Resumo por categoria (despesas)
      const categoryResult = await pool.query(
        `SELECT 
          COALESCE(category, 'Sem categoria') as category,
          SUM(amount) as total
         FROM accounts_payable
         WHERE status = 'paid'
         AND payment_date >= $1 AND payment_date <= $2
         GROUP BY category
         ORDER BY total DESC`,
        [startDate, endDate]
      );

      // Totais
      const totalsResult = await pool.query(
        `SELECT 
          (SELECT COALESCE(SUM(amount), 0) FROM accounts_receivable WHERE status = 'paid' AND payment_date >= $1 AND payment_date <= $2) as total_income,
          (SELECT COALESCE(SUM(amount), 0) FROM accounts_payable WHERE status = 'paid' AND payment_date >= $1 AND payment_date <= $2) as total_expense`,
        [startDate, endDate]
      );

      res.json({
        period: { start: startDate, end: endDate },
        receivables: receivablesResult.rows,
        payables: payablesResult.rows,
        categories: categoryResult.rows,
        totals: totalsResult.rows[0],
      });
    } catch (error) {
      console.error('Financial report error:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório financeiro' });
    }
  }

  // Relatório de Vendas (Ordens de Serviço)
  static async sales(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : new Date();

      // Vendas por dia
      const dailyResult = await pool.query(
        `SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as count,
          SUM(total) as total
         FROM orders
         WHERE status = 'finished'
         AND finished_at >= $1 AND finished_at <= $2
         GROUP BY DATE_TRUNC('day', created_at)
         ORDER BY date ASC`,
        [startDate, endDate]
      );

      // Vendas por mecânico
      const mechanicResult = await pool.query(
        `SELECT 
          u.name as mechanic_name,
          COUNT(o.id) as count,
          SUM(o.total) as total
         FROM orders o
         LEFT JOIN users u ON o.mechanic_id = u.id
         WHERE o.status = 'finished'
         AND o.finished_at >= $1 AND o.finished_at <= $2
         GROUP BY u.id, u.name
         ORDER BY total DESC`,
        [startDate, endDate]
      );

      // Vendas por cliente
      const clientResult = await pool.query(
        `SELECT 
          c.name as client_name,
          COUNT(o.id) as count,
          SUM(o.total) as total
         FROM orders o
         LEFT JOIN clients c ON o.client_id = c.id
         WHERE o.status = 'finished'
         AND o.finished_at >= $1 AND o.finished_at <= $2
         GROUP BY c.id, c.name
         ORDER BY total DESC
         LIMIT 10`,
        [startDate, endDate]
      );

      // Status das OS
      const statusResult = await pool.query(
        `SELECT 
          status,
          COUNT(*) as count,
          SUM(total) as total
         FROM orders
         WHERE created_at >= $1 AND created_at <= $2
         GROUP BY status`,
        [startDate, endDate]
      );

      // Totais
      const totalsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'finished' THEN total ELSE 0 END) as total_sales,
          AVG(CASE WHEN status = 'finished' THEN total ELSE NULL END) as avg_order_value
         FROM orders
         WHERE created_at >= $1 AND created_at <= $2`,
        [startDate, endDate]
      );

      res.json({
        period: { start: startDate, end: endDate },
        daily: dailyResult.rows,
        byMechanic: mechanicResult.rows,
        byClient: clientResult.rows,
        byStatus: statusResult.rows,
        totals: totalsResult.rows[0],
      });
    } catch (error) {
      console.error('Sales report error:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de vendas' });
    }
  }

  // Relatório de Estoque
  static async inventory(req: Request, res: Response): Promise<void> {
    try {
      // Produtos com estoque baixo
      const lowStockResult = await pool.query(
        `SELECT 
          p.*,
          s.name as supplier_name
         FROM products p
         LEFT JOIN suppliers s ON p.supplier_id = s.id
         WHERE p.current_quantity <= p.min_quantity
         AND p.active = true
         ORDER BY (p.current_quantity - p.min_quantity) ASC`
      );

      // Movimentações recentes
      const movementsResult = await pool.query(
        `SELECT 
          im.*,
          p.name as product_name,
          u.name as user_name
         FROM inventory_movements im
         LEFT JOIN products p ON im.product_id = p.id
         LEFT JOIN users u ON im.created_by = u.id
         ORDER BY im.created_at DESC
         LIMIT 50`
      );

      // Produtos por categoria
      const categoryResult = await pool.query(
        `SELECT 
          COALESCE(category, 'Sem categoria') as category,
          COUNT(*) as count,
          SUM(current_quantity) as total_quantity,
          SUM(current_quantity * cost_price) as total_value
         FROM products
         WHERE active = true
         GROUP BY category
         ORDER BY total_value DESC`
      );

      // Valor total do estoque
      const totalValueResult = await pool.query(
        `SELECT 
          SUM(current_quantity * cost_price) as total_cost_value,
          SUM(current_quantity * sale_price) as total_sale_value,
          COUNT(*) as total_products
         FROM products
         WHERE active = true`
      );

      res.json({
        lowStock: lowStockResult.rows,
        movements: movementsResult.rows,
        byCategory: categoryResult.rows,
        totals: totalValueResult.rows[0],
      });
    } catch (error) {
      console.error('Inventory report error:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de estoque' });
    }
  }

  // Relatório de Clientes
  static async clients(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : new Date(new Date().getFullYear(), 0, 1);
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : new Date();

      // Top clientes por valor
      const topClientsResult = await pool.query(
        `SELECT 
          c.id,
          c.name,
          c.type,
          COUNT(DISTINCT o.id) as orders_count,
          SUM(o.total) as total_spent
         FROM clients c
         LEFT JOIN orders o ON c.id = o.client_id AND o.status = 'finished' AND o.finished_at >= $1 AND o.finished_at <= $2
         WHERE c.active = true
         GROUP BY c.id, c.name, c.type
         HAVING COUNT(DISTINCT o.id) > 0
         ORDER BY total_spent DESC
         LIMIT 20`,
        [startDate, endDate]
      );

      // Clientes por tipo
      const typeResult = await pool.query(
        `SELECT 
          type,
          COUNT(*) as count
         FROM clients
         WHERE active = true
         GROUP BY type`
      );

      // Novos clientes
      const newClientsResult = await pool.query(
        `SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
         FROM clients
         WHERE created_at >= $1 AND created_at <= $2
         GROUP BY DATE_TRUNC('month', created_at)
         ORDER BY month ASC`,
        [startDate, endDate]
      );

      res.json({
        period: { start: startDate, end: endDate },
        topClients: topClientsResult.rows,
        byType: typeResult.rows,
        newClients: newClientsResult.rows,
      });
    } catch (error) {
      console.error('Clients report error:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de clientes' });
    }
  }

  // Relatório Geral (Dashboard)
  static async overview(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : new Date();

      // Resumo geral
      const summaryResult = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM clients WHERE active = true) as total_clients,
          (SELECT COUNT(*) FROM orders WHERE status = 'finished' AND finished_at >= $1 AND finished_at <= $2) as finished_orders,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'finished' AND finished_at >= $1 AND finished_at <= $2) as total_revenue,
          (SELECT COUNT(*) FROM products WHERE active = true AND current_quantity <= min_quantity) as low_stock_count,
          (SELECT COUNT(*) FROM accounts_receivable WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue_receivables,
          (SELECT COUNT(*) FROM accounts_payable WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue_payables`,
        [startDate, endDate]
      );

      res.json({
        period: { start: startDate, end: endDate },
        summary: summaryResult.rows[0],
      });
    } catch (error) {
      console.error('Overview report error:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório geral' });
    }
  }
}

