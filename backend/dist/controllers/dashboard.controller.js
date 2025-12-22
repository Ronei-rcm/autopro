"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const database_1 = __importDefault(require("../config/database"));
class DashboardController {
    static async getOverview(_req, res) {
        try {
            // KPIs principais
            const kpisResult = await database_1.default.query(`SELECT 
          (SELECT COUNT(*) FROM clients WHERE active = true) as total_clients,
          (SELECT COUNT(*) FROM orders WHERE status IN ('open', 'in_progress', 'waiting_parts')) as active_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'finished' AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as finished_orders_month,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'finished' AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as revenue_month,
          (SELECT COUNT(*) FROM products WHERE active = true AND current_quantity <= min_quantity) as low_stock_count,
          (SELECT COUNT(*) FROM accounts_receivable WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue_receivables,
          (SELECT COUNT(*) FROM accounts_payable WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue_payables,
          (SELECT COUNT(*) FROM appointments WHERE status IN ('scheduled', 'confirmed') AND start_time >= CURRENT_TIMESTAMP) as upcoming_appointments`);
            // Receita dos últimos 6 meses
            const revenueResult = await database_1.default.query(`SELECT 
          DATE_TRUNC('month', finished_at) as month,
          SUM(total) as revenue
         FROM orders
         WHERE status = 'finished'
         AND finished_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
         GROUP BY DATE_TRUNC('month', finished_at)
         ORDER BY month ASC`);
            // Distribuição de serviços (por status de OS)
            const servicesResult = await database_1.default.query(`SELECT 
          status,
          COUNT(*) as count
         FROM orders
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY status`);
            // Top produtos mais vendidos (últimos 30 dias)
            const topProductsResult = await database_1.default.query(`SELECT 
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
         LIMIT 5`);
            // Vendas por dia (últimos 7 dias)
            const dailySalesResult = await database_1.default.query(`SELECT 
          DATE_TRUNC('day', finished_at) as date,
          COUNT(*) as orders_count,
          SUM(total) as revenue
         FROM orders
         WHERE status = 'finished'
         AND finished_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY DATE_TRUNC('day', finished_at)
         ORDER BY date ASC`);
            // Comparação mês atual vs mês anterior
            const comparisonResult = await database_1.default.query(`SELECT 
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as current_month,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND finished_at < DATE_TRUNC('month', CURRENT_DATE)) as previous_month,
          (SELECT COUNT(*) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)) as current_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'finished' 
           AND finished_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND finished_at < DATE_TRUNC('month', CURRENT_DATE)) as previous_orders`);
            res.json({
                kpis: kpisResult.rows[0],
                revenue: revenueResult.rows.map((r) => ({
                    month: new Date(r.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                    revenue: parseFloat(r.revenue || '0'),
                })),
                services: servicesResult.rows.map((r) => ({
                    status: r.status,
                    count: parseInt(r.count),
                })),
                topProducts: topProductsResult.rows.map((r) => ({
                    name: r.name,
                    quantity: parseFloat(r.total_quantity || '0'),
                    revenue: parseFloat(r.total_revenue || '0'),
                })),
                dailySales: dailySalesResult.rows.map((r) => ({
                    date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    orders: parseInt(r.orders_count || '0'),
                    revenue: parseFloat(r.revenue || '0'),
                })),
                comparison: comparisonResult.rows[0],
            });
        }
        catch (error) {
            console.error('Dashboard overview error:', error);
            res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
        }
    }
    // Dashboard personalizado por perfil
    static async getProfileDashboard(req, res) {
        try {
            const profile = req.userProfile;
            // Admin vê tudo (usa o overview completo)
            if (profile === 'admin') {
                return DashboardController.getOverview(req, res);
            }
            // Dashboards específicos por perfil
            switch (profile) {
                case 'mechanic':
                    return DashboardController.getMechanicDashboard(req, res);
                case 'financial':
                    return DashboardController.getFinancialDashboard(req, res);
                case 'attendant':
                    return DashboardController.getAttendantDashboard(req, res);
                default:
                    res.status(403).json({ error: 'Perfil não reconhecido' });
            }
        }
        catch (error) {
            console.error('Profile dashboard error:', error);
            res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
        }
    }
    // Dashboard para Mecânico
    static async getMechanicDashboard(req, res) {
        try {
            const userId = req.userId;
            // OS em andamento atribuídas ao mecânico
            const myActiveOrdersResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM orders
         WHERE mechanic_id = $1
         AND status IN ('open', 'in_progress', 'waiting_parts')`, [userId]);
            // OS aguardando peças
            const waitingPartsResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM orders
         WHERE mechanic_id = $1
         AND status = 'waiting_parts'`, [userId]);
            // Tempo médio de conclusão (últimas 10 OS finalizadas)
            const avgTimeResult = await database_1.default.query(`SELECT 
          AVG(EXTRACT(EPOCH FROM (finished_at - started_at)) / 3600) as avg_hours
         FROM orders
         WHERE mechanic_id = $1
         AND status = 'finished'
         AND finished_at >= CURRENT_DATE - INTERVAL '30 days'
         AND started_at IS NOT NULL
         AND finished_at IS NOT NULL
         LIMIT 10`);
            // OS finalizadas no mês
            const finishedThisMonthResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM orders
         WHERE mechanic_id = $1
         AND status = 'finished'
         AND finished_at >= DATE_TRUNC('month', CURRENT_DATE)`, [userId]);
            // Próximas OS agendadas (hoje e amanhã)
            const upcomingOrdersResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM orders o
         JOIN appointments a ON o.id = a.order_id
         WHERE o.mechanic_id = $1
         AND a.status IN ('scheduled', 'confirmed')
         AND a.start_time >= CURRENT_TIMESTAMP
         AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '2 days'`, [userId]);
            // Distribuição de status das minhas OS
            const myOrdersStatusResult = await database_1.default.query(`SELECT status, COUNT(*) as count
         FROM orders
         WHERE mechanic_id = $1
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY status`, [userId]);
            // Minhas OS dos últimos 7 dias (gráfico)
            const myOrdersLast7DaysResult = await database_1.default.query(`SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as orders_count
         FROM orders
         WHERE mechanic_id = $1
         AND created_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY DATE_TRUNC('day', created_at)
         ORDER BY date ASC`, [userId]);
            // Top 5 clientes (por número de OS)
            const topClientsResult = await database_1.default.query(`SELECT 
          c.id,
          c.name,
          COUNT(o.id) as orders_count
         FROM orders o
         JOIN clients c ON o.client_id = c.id
         WHERE o.mechanic_id = $1
         AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY c.id, c.name
         ORDER BY orders_count DESC
         LIMIT 5`, [userId]);
            res.json({
                profile: 'mechanic',
                kpis: {
                    my_active_orders: parseInt(myActiveOrdersResult.rows[0]?.count || '0'),
                    waiting_parts: parseInt(waitingPartsResult.rows[0]?.count || '0'),
                    avg_completion_hours: parseFloat(avgTimeResult.rows[0]?.avg_hours || '0').toFixed(1),
                    finished_this_month: parseInt(finishedThisMonthResult.rows[0]?.count || '0'),
                    upcoming_orders: parseInt(upcomingOrdersResult.rows[0]?.count || '0'),
                },
                ordersByStatus: myOrdersStatusResult.rows.map((r) => ({
                    status: r.status,
                    count: parseInt(r.count),
                })),
                ordersLast7Days: myOrdersLast7DaysResult.rows.map((r) => ({
                    date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    orders: parseInt(r.orders_count || '0'),
                })),
                topClients: topClientsResult.rows.map((r) => ({
                    id: r.id,
                    name: r.name,
                    ordersCount: parseInt(r.orders_count || '0'),
                })),
            });
        }
        catch (error) {
            console.error('Mechanic dashboard error:', error);
            res.status(500).json({ error: 'Erro ao buscar dados do dashboard do mecânico' });
        }
    }
    // Dashboard para Financeiro
    static async getFinancialDashboard(_req, res) {
        try {
            // Contas a pagar (resumo)
            const payablesResult = await database_1.default.query(`SELECT 
          COUNT(*) FILTER (WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue,
          COUNT(*) FILTER (WHERE status = 'open' AND due_date >= CURRENT_DATE) as pending,
          COALESCE(SUM(amount) FILTER (WHERE status = 'open'), 0) as total_open,
          COALESCE(SUM(amount) FILTER (WHERE status = 'open' AND due_date < CURRENT_DATE), 0) as total_overdue
         FROM accounts_payable`);
            // Contas a receber (resumo)
            const receivablesResult = await database_1.default.query(`SELECT 
          COUNT(*) FILTER (WHERE status = 'open' AND due_date < CURRENT_DATE) as overdue,
          COUNT(*) FILTER (WHERE status = 'open' AND due_date >= CURRENT_DATE) as pending,
          COALESCE(SUM(amount) FILTER (WHERE status = 'open'), 0) as total_open,
          COALESCE(SUM(amount) FILTER (WHERE status = 'open' AND due_date < CURRENT_DATE), 0) as total_overdue
         FROM accounts_receivable`);
            // Fluxo de caixa do mês
            const cashFlowResult = await database_1.default.query(`SELECT 
          COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) as income,
          COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) as expense
         FROM cash_flow
         WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
         AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`);
            // Receitas dos últimos 6 meses
            const revenue6MonthsResult = await database_1.default.query(`SELECT 
          DATE_TRUNC('month', finished_at) as month,
          SUM(total) as revenue
         FROM orders
         WHERE status = 'finished'
         AND finished_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
         GROUP BY DATE_TRUNC('month', finished_at)
         ORDER BY month ASC`);
            // Pagamentos dos últimos 7 dias
            const paymentsLast7DaysResult = await database_1.default.query(`SELECT 
          DATE_TRUNC('day', payment_date) as date,
          SUM(amount) FILTER (WHERE type = 'income') as income,
          SUM(amount) FILTER (WHERE type = 'expense') as expense
         FROM cash_flow
         WHERE payment_date >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY DATE_TRUNC('day', payment_date)
         ORDER BY date ASC`);
            // Top 5 clientes por receita
            const topClientsByRevenueResult = await database_1.default.query(`SELECT 
          c.id,
          c.name,
          COALESCE(SUM(o.total), 0) as total_revenue
         FROM clients c
         LEFT JOIN orders o ON c.id = o.client_id AND o.status = 'finished'
         WHERE o.finished_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY c.id, c.name
         ORDER BY total_revenue DESC
         LIMIT 5`);
            // Comparação mês atual vs anterior
            const comparisonResult = await database_1.default.query(`SELECT 
          (SELECT COALESCE(SUM(amount), 0) FROM cash_flow 
           WHERE type = 'income' AND date >= DATE_TRUNC('month', CURRENT_DATE)) as current_income,
          (SELECT COALESCE(SUM(amount), 0) FROM cash_flow 
           WHERE type = 'income' AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND date < DATE_TRUNC('month', CURRENT_DATE)) as previous_income,
          (SELECT COALESCE(SUM(amount), 0) FROM cash_flow 
           WHERE type = 'expense' AND date >= DATE_TRUNC('month', CURRENT_DATE)) as current_expense,
          (SELECT COALESCE(SUM(amount), 0) FROM cash_flow 
           WHERE type = 'expense' AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND date < DATE_TRUNC('month', CURRENT_DATE)) as previous_expense`);
            const comparison = comparisonResult.rows[0];
            const currentIncome = parseFloat(comparison.current_income || '0');
            const previousIncome = parseFloat(comparison.previous_income || '0');
            const currentExpense = parseFloat(comparison.current_expense || '0');
            const previousExpense = parseFloat(comparison.previous_expense || '0');
            const incomeTrendValue = previousIncome > 0
                ? ((currentIncome - previousIncome) / previousIncome) * 100
                : 0;
            const expenseTrendValue = previousExpense > 0
                ? ((currentExpense - previousExpense) / previousExpense) * 100
                : 0;
            const incomeTrend = `${incomeTrendValue >= 0 ? '+' : ''}${incomeTrendValue.toFixed(1)}%`;
            const expenseTrend = `${expenseTrendValue >= 0 ? '+' : ''}${expenseTrendValue.toFixed(1)}%`;
            res.json({
                profile: 'financial',
                kpis: {
                    payables_overdue: parseInt(payablesResult.rows[0]?.overdue || '0'),
                    payables_pending: parseInt(payablesResult.rows[0]?.pending || '0'),
                    payables_total: parseFloat(payablesResult.rows[0]?.total_open || '0'),
                    payables_overdue_amount: parseFloat(payablesResult.rows[0]?.total_overdue || '0'),
                    receivables_overdue: parseInt(receivablesResult.rows[0]?.overdue || '0'),
                    receivables_pending: parseInt(receivablesResult.rows[0]?.pending || '0'),
                    receivables_total: parseFloat(receivablesResult.rows[0]?.total_open || '0'),
                    receivables_overdue_amount: parseFloat(receivablesResult.rows[0]?.total_overdue || '0'),
                    cash_flow_income: parseFloat(cashFlowResult.rows[0]?.income || '0'),
                    cash_flow_expense: parseFloat(cashFlowResult.rows[0]?.expense || '0'),
                    cash_flow_balance: parseFloat(cashFlowResult.rows[0]?.income || '0') - parseFloat(cashFlowResult.rows[0]?.expense || '0'),
                },
                revenue6Months: revenue6MonthsResult.rows.map((r) => ({
                    month: new Date(r.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                    revenue: parseFloat(r.revenue || '0'),
                })),
                paymentsLast7Days: paymentsLast7DaysResult.rows.map((r) => ({
                    date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    income: parseFloat(r.income || '0'),
                    expense: parseFloat(r.expense || '0'),
                })),
                topClientsByRevenue: topClientsByRevenueResult.rows.map((r) => ({
                    id: r.id,
                    name: r.name,
                    revenue: parseFloat(r.total_revenue || '0'),
                })),
                comparison: {
                    current_income: currentIncome,
                    previous_income: previousIncome,
                    current_expense: currentExpense,
                    previous_expense: previousExpense,
                    income_trend: incomeTrend,
                    expense_trend: expenseTrend,
                },
            });
        }
        catch (error) {
            console.error('Financial dashboard error:', error);
            res.status(500).json({ error: 'Erro ao buscar dados do dashboard financeiro' });
        }
    }
    // Dashboard para Atendente
    static async getAttendantDashboard(_req, res) {
        try {
            // Agendamentos de hoje
            const todayAppointmentsResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM appointments
         WHERE DATE(start_time) = CURRENT_DATE
         AND status IN ('scheduled', 'confirmed')`);
            // Agendamentos desta semana
            const weekAppointmentsResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM appointments
         WHERE start_time >= DATE_TRUNC('week', CURRENT_DATE)
         AND start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
         AND status IN ('scheduled', 'confirmed')`);
            // Clientes novos este mês
            const newClientsResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM clients
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`);
            // Orçamentos pendentes
            const pendingQuotesResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM quotes
         WHERE status = 'open'`);
            // OS abertas (sem mecânico atribuído)
            const unassignedOrdersResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM orders
         WHERE status IN ('open', 'in_progress')
         AND mechanic_id IS NULL`);
            // Agendamentos por status (hoje)
            const appointmentsByStatusResult = await database_1.default.query(`SELECT status, COUNT(*) as count
         FROM appointments
         WHERE DATE(start_time) = CURRENT_DATE
         GROUP BY status`);
            // Agendamentos dos próximos 7 dias
            const upcomingAppointmentsResult = await database_1.default.query(`SELECT 
          DATE(start_time) as date,
          COUNT(*) as count
         FROM appointments
         WHERE start_time >= CURRENT_TIMESTAMP
         AND start_time <= CURRENT_TIMESTAMP + INTERVAL '7 days'
         AND status IN ('scheduled', 'confirmed')
         GROUP BY DATE(start_time)
         ORDER BY date ASC`);
            // Top 5 clientes mais frequentes
            const topClientsResult = await database_1.default.query(`SELECT 
          c.id,
          c.name,
          COUNT(a.id) as appointments_count
         FROM clients c
         JOIN appointments a ON c.id = a.client_id
         WHERE a.created_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY c.id, c.name
         ORDER BY appointments_count DESC
         LIMIT 5`);
            // Orçamentos convertidos este mês
            const convertedQuotesResult = await database_1.default.query(`SELECT COUNT(*) as count
         FROM quotes
         WHERE status = 'converted'
         AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)`);
            res.json({
                profile: 'attendant',
                kpis: {
                    today_appointments: parseInt(todayAppointmentsResult.rows[0]?.count || '0'),
                    week_appointments: parseInt(weekAppointmentsResult.rows[0]?.count || '0'),
                    new_clients_month: parseInt(newClientsResult.rows[0]?.count || '0'),
                    pending_quotes: parseInt(pendingQuotesResult.rows[0]?.count || '0'),
                    unassigned_orders: parseInt(unassignedOrdersResult.rows[0]?.count || '0'),
                    converted_quotes_month: parseInt(convertedQuotesResult.rows[0]?.count || '0'),
                },
                appointmentsByStatus: appointmentsByStatusResult.rows.map((r) => ({
                    status: r.status,
                    count: parseInt(r.count),
                })),
                upcomingAppointments: upcomingAppointmentsResult.rows.map((r) => ({
                    date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    count: parseInt(r.count || '0'),
                })),
                topClients: topClientsResult.rows.map((r) => ({
                    id: r.id,
                    name: r.name,
                    appointmentsCount: parseInt(r.appointments_count || '0'),
                })),
            });
        }
        catch (error) {
            console.error('Attendant dashboard error:', error);
            res.status(500).json({ error: 'Erro ao buscar dados do dashboard do atendente' });
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map