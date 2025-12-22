import { Calendar, Users, FileText, Clock, CheckCircle, TrendingUp, Car, ArrowRight, DollarSign } from 'lucide-react';
import KPICard from './KPICard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface AttendantDashboardProps {
  data: any;
  formatCurrency: (value: number) => string;
}

const AttendantDashboard = ({ data, formatCurrency }: AttendantDashboardProps) => {
  const navigate = useNavigate();
  
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Orçamentos Pendentes */}
      {data.pendingQuotes && data.pendingQuotes.length > 0 && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#fff7ed',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '2px solid #f97316',
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
                  backgroundColor: '#f97316',
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
                  Orçamentos Pendentes de Aprovação
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  {data.pendingQuotesCount} {data.pendingQuotesCount === 1 ? 'orçamento' : 'orçamentos'} aguardando aprovação
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.pendingQuotes.slice(0, 5).map((quote: any) => (
              <div
                key={quote.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa',
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
                    <FileText size={16} color="#f97316" />
                    <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                      {quote.quote_number}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatDate(quote.created_at)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={14} />
                      {quote.client_name || 'Cliente não informado'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Car size={14} />
                      {quote.brand} {quote.model} {quote.plate ? `- ${quote.plate}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Valor Total</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                      {formatCurrency(quote.total)}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/orçamentos?approve=${quote.id}`)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f97316',
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
                      e.currentTarget.style.backgroundColor = '#ea580c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f97316';
                    }}
                  >
                    Aprovar e Agendar
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.pendingQuotesCount > 5 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={() => navigate('/orçamentos?status=open')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#f97316',
                  border: '2px solid #f97316',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                Ver todos os {data.pendingQuotesCount} orçamentos pendentes
              </button>
            </div>
          )}
        </div>
      )}

      {/* KPIs do Atendente */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <KPICard
          title="Agendamentos Hoje"
          value={data.kpis.today_appointments.toString()}
          icon={Calendar}
          bgColor="#eff6ff"
          iconColor="#3b82f6"
        />
        <KPICard
          title="Agendamentos (Semana)"
          value={data.kpis.week_appointments.toString()}
          icon={Calendar}
          bgColor="#f0fdf4"
          iconColor="#10b981"
        />
        <KPICard
          title="Clientes Novos (Mês)"
          value={data.kpis.new_clients_month.toString()}
          icon={Users}
          bgColor="#f0fdf4"
          iconColor="#10b981"
        />
        <KPICard
          title="Orçamentos Pendentes"
          value={data.kpis.pending_quotes.toString()}
          icon={FileText}
          bgColor="#fff7ed"
          iconColor="#f97316"
        />
        <KPICard
          title="OS Sem Mecânico"
          value={data.kpis.unassigned_orders.toString()}
          icon={Clock}
          bgColor="#fef3c7"
          iconColor="#f59e0b"
        />
        <KPICard
          title="Orçamentos Convertidos"
          value={data.kpis.converted_quotes_month.toString()}
          icon={CheckCircle}
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
        {/* Agendamentos por Status (Hoje) */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#3b82f6" />
            Agendamentos de Hoje por Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.appointmentsByStatus.map((s: any) => ({ status: getStatusLabel(s.status), count: s.count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agendamentos dos Próximos 7 Dias */}
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
            Agendamentos (Próximos 7 Dias)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.upcomingAppointments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

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
            Top 5 Clientes Mais Frequentes (Últimos 30 Dias)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topClients.map((client: any) => (
              <div
                key={client.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: '3px solid #3b82f6',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{client.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {client.appointmentsCount} agendamentos
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

export default AttendantDashboard;

