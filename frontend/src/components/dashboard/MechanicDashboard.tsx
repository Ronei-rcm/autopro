import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Calendar, TrendingUp, Car, User, Wrench } from 'lucide-react';
import KPICard from './KPICard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MechanicDashboardProps {
  data: any;
  formatCurrency?: (value: number) => string;
}

const MechanicDashboard = ({ data, formatCurrency }: MechanicDashboardProps) => {
  const navigate = useNavigate();
  
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Aberta',
      in_progress: 'Em Andamento',
      waiting_parts: 'Aguardando Peças',
      finished: 'Finalizada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#64748b',
      in_progress: '#3b82f6',
      waiting_parts: '#f59e0b',
      finished: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não agendado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOrderClick = (orderId: number) => {
    navigate(`/ordens-servico?order_id=${orderId}`);
  };

  return (
    <div>
      {/* KPIs Específicos do Mecânico */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <KPICard
          title="Minhas OS Ativas"
          value={data.kpis.my_active_orders.toString()}
          icon={FileText}
          bgColor="#fff7ed"
          iconColor="#f97316"
        />
        <KPICard
          title="Aguardando Peças"
          value={data.kpis.waiting_parts.toString()}
          icon={Clock}
          bgColor="#fef3c7"
          iconColor="#f59e0b"
        />
        <KPICard
          title="Tempo Médio (horas)"
          value={data.kpis.avg_completion_hours}
          icon={TrendingUp}
          bgColor="#eff6ff"
          iconColor="#3b82f6"
        />
        <KPICard
          title="Finalizadas (Mês)"
          value={data.kpis.finished_this_month.toString()}
          icon={CheckCircle}
          bgColor="#f0fdf4"
          iconColor="#10b981"
        />
        <KPICard
          title="Próximas OS"
          value={data.kpis.upcoming_orders.toString()}
          icon={Calendar}
          bgColor="#f0fdf4"
          iconColor="#10b981"
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
        {/* Distribuição de Status */}
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
            Minhas OS por Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.ordersByStatus.map((s: any) => ({ status: getStatusLabel(s.status), count: s.count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* OS dos Últimos 7 Dias */}
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
            Minhas OS (Últimos 7 Dias)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.ordersLast7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Próximas OS */}
      {data.upcomingOrders && data.upcomingOrders.length > 0 && (
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
            <Calendar size={18} color="#10b981" />
            Próximas OS ({data.upcomingOrders.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.upcomingOrders.map((order: any) => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${getStatusColor(order.status)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={16} color={getStatusColor(order.status)} />
                      <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                        OS #{order.order_number}
                      </span>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: getStatusColor(order.status) + '20',
                          color: getStatusColor(order.status),
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={14} />
                        {order.client_name || 'Cliente não informado'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Car size={14} />
                        {order.brand} {order.model} {order.plate ? `- ${order.plate}` : ''}
                      </div>
                    </div>
                    {order.appointment_start_time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#f59e0b', fontWeight: '500' }}>
                        <Clock size={12} />
                        Agendado para: {formatDate(order.appointment_start_time)}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                    {formatCurrency && (
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                        {formatCurrency(order.total)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Clientes */}
      {data.topClients && data.topClients.length > 0 && (
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
            Top 5 Clientes (Últimos 30 Dias)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topClients.map((client: any) => (
              <div
                key={client.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: '3px solid #f97316',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{client.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {client.ordersCount} OS
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;

