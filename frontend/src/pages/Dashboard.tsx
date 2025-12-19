import { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, Package, Calendar, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import api from '../services/api';
import KPICard from '../components/dashboard/KPICard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardData {
  kpis: {
    total_clients: number;
    active_orders: number;
    finished_orders_month: number;
    revenue_month: number;
    low_stock_count: number;
    overdue_receivables: number;
    overdue_payables: number;
    upcoming_appointments: number;
  };
  revenue: Array<{ month: string; revenue: number }>;
  services: Array<{ status: string; count: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  dailySales: Array<{ date: string; orders: number; revenue: number }>;
  comparison: {
    current_month: number;
    previous_month: number;
    current_orders: number;
    previous_orders: number;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/overview');
      setData(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const percent = ((current - previous) / previous) * 100;
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '#10b981' : '#64748b';
    return current >= previous ? '#10b981' : '#ef4444';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Abertas',
      in_progress: 'Em Andamento',
      waiting_parts: 'Aguardando Peças',
      finished: 'Finalizadas',
      cancelled: 'Canceladas',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div>
        <header style={{ marginBottom: '2rem' }}>
          <SkeletonLoader type="text" lines={2} width="40%" height="32px" />
        </header>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Erro ao carregar dados do dashboard
      </div>
    );
  }

  const revenueTrend = calculateTrend(data.comparison.current_month, data.comparison.previous_month);
  const ordersTrend = calculateTrend(data.comparison.current_orders, data.comparison.previous_orders);

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', 
          fontWeight: 'bold', 
          color: '#1e293b', 
          marginBottom: '0.5rem',
          lineHeight: '1.2',
        }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: 'clamp(0.875rem, 2vw, 0.9rem)' }}>
          Visão geral do seu negócio
        </p>
      </header>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
        className="dashboard-kpis"
      >
        <KPICard
          title="Clientes"
          value={data.kpis.total_clients.toString()}
          icon={Users}
          trend={undefined}
          trendColor="#10b981"
          iconColor="#10b981"
        />
        <KPICard
          title="OS Ativas"
          value={data.kpis.active_orders.toString()}
          icon={FileText}
          bgColor="#fff7ed"
          iconColor="#f97316"
        />
        <KPICard
          title="Faturamento do Mês"
          value={formatCurrency(parseFloat(data.kpis.revenue_month.toString()))}
          icon={DollarSign}
          trend={`${revenueTrend} vs mês anterior`}
          trendColor={getTrendColor(data.comparison.current_month, data.comparison.previous_month)}
          bgColor="#f0fdf4"
          iconColor="#10b981"
        />
        <KPICard
          title="OS Finalizadas (Mês)"
          value={data.kpis.finished_orders_month.toString()}
          icon={FileText}
          trend={`${ordersTrend} vs mês anterior`}
          trendColor={getTrendColor(data.comparison.current_orders, data.comparison.previous_orders)}
          bgColor="#eff6ff"
          iconColor="#3b82f6"
        />
        <KPICard
          title="Estoque Baixo"
          value={data.kpis.low_stock_count.toString()}
          icon={Package}
          bgColor="#fef3c7"
          iconColor="#f59e0b"
        />
        <KPICard
          title="Contas Vencidas"
          value={(data.kpis.overdue_receivables + data.kpis.overdue_payables).toString()}
          icon={AlertTriangle}
          bgColor="#fee2e2"
          iconColor="#ef4444"
        />
        <KPICard
          title="Próximos Agendamentos"
          value={data.kpis.upcoming_appointments.toString()}
          icon={Calendar}
          bgColor="#f0fdf4"
          iconColor="#10b981"
        />
      </div>

      {/* Charts Row 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
        className="dashboard-charts"
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
            <LineChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Serviços */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#3b82f6" />
            Distribuição de OS (Mês Atual)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.services.map((s) => ({ status: getStatusLabel(s.status), count: s.count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
        className="dashboard-charts"
      >
        {/* Vendas dos Últimos 7 Dias */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="#f97316" />
            Vendas dos Últimos 7 Dias
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="OS" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Produtos */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="#10b981" />
            Top 5 Produtos (Últimos 30 Dias)
          </h3>
          {data.topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.topProducts.map((product, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '3px solid #f97316',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{product.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Qtd: {product.quantity.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Nenhum produto vendido nos últimos 30 dias
            </div>
          )}
        </div>
      </div>

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
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Receita - Mês Atual</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {formatCurrency(parseFloat(data.comparison.current_month.toString()))}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Mês anterior: {formatCurrency(parseFloat(data.comparison.previous_month.toString()))}
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>OS Finalizadas - Mês Atual</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {data.comparison.current_orders}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Mês anterior: {data.comparison.previous_orders}
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Variação de Receita</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: getTrendColor(data.comparison.current_month, data.comparison.previous_month),
              }}
            >
              {revenueTrend}
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Variação de OS</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: getTrendColor(data.comparison.current_orders, data.comparison.previous_orders),
              }}
            >
              {ordersTrend}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
