import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Calendar, Wallet, FileText, ArrowRight, Car, User, Wrench } from 'lucide-react';
import KPICard from './KPICard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NotificationPanel from '../notifications/NotificationPanel';
import { useNavigate } from 'react-router-dom';

interface FinancialDashboardProps {
  data: any;
  formatCurrency: (value: number) => string;
}

const FinancialDashboard = ({ data, formatCurrency }: FinancialDashboardProps) => {
  const navigate = useNavigate();
  
  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? '#10b981' : '#ef4444';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateReceivable = (orderId: number) => {
    navigate(`/financeiro?order_id=${orderId}&tab=receivables`);
  };

  return (
    <div>
      {/* Notificações */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <NotificationPanel profile="financial" />
      </div>

      {/* OS Finalizadas Pendentes */}
      {data.pendingOrders && data.pendingOrders.length > 0 && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '2px solid #fbbf24',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                  OS Finalizadas Aguardando Ação
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  {data.pendingOrdersCount} {data.pendingOrdersCount === 1 ? 'ordem' : 'ordens'} finalizada(s) sem conta a receber
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.pendingOrders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <FileText size={16} color="#f59e0b" />
                    <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                      OS #{order.order_number}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatDate(order.finished_at)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={14} />
                      {order.client_name || 'Cliente não informado'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Car size={14} />
                      {order.brand} {order.model} {order.plate ? `- ${order.plate}` : ''}
                    </div>
                    {order.mechanic_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Wrench size={14} />
                        {order.mechanic_name}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Valor Total</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateReceivable(order.id)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#d97706';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f59e0b';
                    }}
                  >
                    Gerar Conta a Receber
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.pendingOrdersCount > 5 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={() => navigate('/ordens-servico?status=finished')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#f59e0b',
                  border: '2px solid #f59e0b',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                Ver todas as {data.pendingOrdersCount} OS pendentes
              </button>
            </div>
          )}
        </div>
      )}

      {/* KPIs Financeiros */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <KPICard
          title="Contas a Pagar"
          value={formatCurrency(data.kpis.payables_total)}
          icon={TrendingDown}
          bgColor="#fee2e2"
          iconColor="#ef4444"
          trend={`${data.kpis.payables_overdue} vencidas`}
          trendColor="#ef4444"
        />
        <KPICard
          title="Contas a Receber"
          value={formatCurrency(data.kpis.receivables_total)}
          icon={TrendingUp}
          bgColor="#f0fdf4"
          iconColor="#10b981"
          trend={`${data.kpis.receivables_overdue} vencidas`}
          trendColor={data.kpis.receivables_overdue > 0 ? '#ef4444' : '#10b981'}
        />
        <KPICard
          title="Fluxo de Caixa"
          value={formatCurrency(data.kpis.cash_flow_balance)}
          icon={Wallet}
          bgColor={data.kpis.cash_flow_balance >= 0 ? '#f0fdf4' : '#fee2e2'}
          iconColor={data.kpis.cash_flow_balance >= 0 ? '#10b981' : '#ef4444'}
        />
        <KPICard
          title="Receitas (Mês)"
          value={formatCurrency(data.kpis.cash_flow_income)}
          icon={DollarSign}
          bgColor="#f0fdf4"
          iconColor="#10b981"
          trend={data.comparison.income_trend}
          trendColor={getTrendColor(data.comparison.income_trend)}
        />
        <KPICard
          title="Despesas (Mês)"
          value={formatCurrency(data.kpis.cash_flow_expense)}
          icon={TrendingDown}
          bgColor="#fee2e2"
          iconColor="#ef4444"
          trend={data.comparison.expense_trend}
          trendColor={getTrendColor(data.comparison.expense_trend)}
        />
        <KPICard
          title="Vencidas a Pagar"
          value={formatCurrency(data.kpis.payables_overdue_amount)}
          icon={AlertTriangle}
          bgColor="#fee2e2"
          iconColor="#ef4444"
        />
        <KPICard
          title="Vencidas a Receber"
          value={formatCurrency(data.kpis.receivables_overdue_amount)}
          icon={AlertTriangle}
          bgColor="#fef3c7"
          iconColor="#f59e0b"
        />
      </div>

      {/* Gráficos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Receita dos Últimos 6 Meses */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#10b981" />
            Receita dos Últimos 6 Meses
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.revenue6Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pagamentos dos Últimos 7 Dias */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#f97316" />
            Pagamentos (Últimos 7 Dias)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.paymentsLast7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Receitas" />
              <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clientes por Receita */}
      {data.topClientsByRevenue && data.topClientsByRevenue.length > 0 && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#10b981" />
            Top 5 Clientes por Receita (Últimos 30 Dias)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topClientsByRevenue.map((client: any) => (
              <div
                key={client.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: '3px solid #10b981',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{client.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                    {formatCurrency(client.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparação Mensal */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="#3b82f6" />
          Comparação Mensal
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Receitas - Mês Atual</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {formatCurrency(data.comparison.current_income)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Mês anterior: {formatCurrency(data.comparison.previous_income)}
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Despesas - Mês Atual</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {formatCurrency(data.comparison.current_expense)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Mês anterior: {formatCurrency(data.comparison.previous_expense)}
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Variação de Receitas</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: getTrendColor(data.comparison.income_trend),
              }}
            >
              {data.comparison.income_trend}
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Variação de Despesas</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: getTrendColor(data.comparison.expense_trend),
              }}
            >
              {data.comparison.expense_trend}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;

