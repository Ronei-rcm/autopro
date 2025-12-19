import { Request, Response } from 'express';
import pool from '../config/database';

export class DashboardController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      // KPIs principais
      const kpisResult = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM clients WHERE active = true) as total_clients,
          (SELECT COUNT(*) FROM orders WHERE status IN ('open', 'in_progress', 'waiting_parts')) as active_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'finished' AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as finished_orders_month,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'finished' AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as revenue_month,
          (SELECT COUNT(*) FROM products WHERE active = true AND current_quantity <= min_quantity) as low_stock_count,
          (SELECT COUNT(*) FROM accounts_receivable WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue_receivables,
          (SELECT COUNT(*) FROM accounts_payable WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue_payables,
          (SELECT COUNT(*) FROM appointments WHERE status IN ('scheduled', 'confirmed') AND start_time >= CURRENT_TIMESTAMP) as upcoming_appointments`
      );

      // Receita dos últimos 6 meses
      const revenueResult = await pool.query(
        `SELECT 
          DATE_TRUNC('month', finished_at) as month,
          SUM(total) as revenue
         FROM orders
         WHERE status = 'finished'
         AND finished_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
         GROUP BY DATE_TRUNC('month', finished_at)
         ORDER BY month ASC`
      );

      // Distribuição de serviços (por status de OS)
      const servicesResult = await pool.query(
        `SELECT 
          status,
          COUNT(*) as count
         FROM orders
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY status`
      );

      // Top produtos mais vendidos (últimos 30 dias)
      const topProductsResult = await pool.query(
        `SELECT 
          p.name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_revenue
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN products p ON oi.product_id = p.id
         WHERE o.status = 'finished'
         AND o.finished_at >= CURRENT_DATE - INTERVAL '30 days'
         AND oi.item_type = 'product'
         GROUP BY p.id, p.name
         ORDER BY total_revenue DESC
         LIMIT 5`
      );

      // Vendas por dia (últimos 7 dias)
      const dailySalesResult = await pool.query(
        `SELECT 
          DATE_TRUNC('day', finished_at) as date,
          COUNT(*) as orders_count,
          SUM(total) as revenue
         FROM orders
         WHERE status = 'finished'
         AND finished_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY DATE_TRUNC('day', finished_at)
         ORDER BY date ASC`
      );

      // Comparação mês atual vs mês anterior
      const comparisonResult = await pool.query(
        `SELECT 
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as current_month,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND finished_at < DATE_TRUNC('month', CURRENT_DATE)) as previous_month,
          (SELECT COUNT(*) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as current_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND finished_at < DATE_TRUNC('month', CURRENT_DATE)) as previous_orders`
      );

      res.json({
        kpis: kpisResult.rows[0],
        revenue: revenueResult.rows.map((r: any) => ({
          month: new Date(r.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          revenue: parseFloat(r.revenue || '0'),
        })),
        services: servicesResult.rows.map((r: any) => ({
          status: r.status,
          count: parseInt(r.count),
        })),
        topProducts: topProductsResult.rows.map((r: any) => ({
          name: r.name,
          quantity: parseFloat(r.total_quantity || '0'),
          revenue: parseFloat(r.total_revenue || '0'),
        })),
        dailySales: dailySalesResult.rows.map((r: any) => ({
          date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          orders: parseInt(r.orders_count || '0'),
          revenue: parseFloat(r.revenue || '0'),
        })),
        comparison: comparisonResult.rows[0],
      });
    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
  }
}

