import { useState, useEffect } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { usePermission } from '../hooks/usePermission';
import { useAuth } from '../contexts/AuthContext';
import MechanicDashboard from '../components/dashboard/MechanicDashboard';
import FinancialDashboard from '../components/dashboard/FinancialDashboard';
import AttendantDashboard from '../components/dashboard/AttendantDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

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
  const { hasPermission, loading: permissionLoading } = usePermission('dashboard', 'view');
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin sempre tem acesso, outros perfis precisam de permissão
    if (!permissionLoading) {
      if (user?.profile === 'admin' || hasPermission) {
        loadDashboard();
      } else {
        setLoading(false);
      }
    }
  }, [hasPermission, permissionLoading, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Usar endpoint personalizado por perfil
      const endpoint = user?.profile === 'admin' ? '/dashboard/overview' : '/dashboard/profile';
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error(error.response?.data?.error || 'Erro ao carregar dados do dashboard');
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

  // Se está carregando permissões, mostrar loading
  if (permissionLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #f97316', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem permissão e não é admin, mostrar acesso negado
  if (user?.profile !== 'admin' && !hasPermission) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '2rem',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <Shield size={48} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Acesso Negado</h2>
          <p style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '1rem' }}>
            Você não tem permissão para acessar o Dashboard.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Entre em contato com o administrador para solicitar acesso.
          </p>
        </div>
      </div>
    );
  }

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

  const getProfileTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      admin: { title: 'Dashboard', subtitle: 'Visão geral do seu negócio' },
      mechanic: { title: 'Meu Dashboard', subtitle: 'Suas ordens de serviço e desempenho' },
      financial: { title: 'Dashboard Financeiro', subtitle: 'Contas, receitas e despesas' },
      attendant: { title: 'Dashboard de Atendimento', subtitle: 'Agendamentos e clientes' },
    };
    return titles[user?.profile || 'admin'] || titles.admin;
  };

  const profileInfo = getProfileTitle();

  const renderDashboard = () => {
    if (!data) return null;

    const commonProps = {
      data,
      formatCurrency,
    };

    switch (user?.profile) {
      case 'admin':
        return (
          <AdminDashboard
            {...commonProps}
            calculateTrend={calculateTrend}
            getTrendColor={getTrendColor}
            getStatusLabel={getStatusLabel}
          />
        );
      case 'mechanic':
        return <MechanicDashboard {...commonProps} />;
      case 'financial':
        return <FinancialDashboard {...commonProps} />;
      case 'attendant':
        return <AttendantDashboard {...commonProps} />;
      default:
        return (
          <AdminDashboard
            {...commonProps}
            calculateTrend={calculateTrend}
            getTrendColor={getTrendColor}
            getStatusLabel={getStatusLabel}
          />
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', 
            fontWeight: 'bold', 
            color: '#1e293b', 
            marginBottom: '0.5rem',
            lineHeight: '1.2',
          }}>
            {profileInfo.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: 'clamp(0.875rem, 2vw, 0.9rem)' }}>
            {profileInfo.subtitle}
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
          title="Atualizar dados"
        >
          <RefreshCw 
            size={16} 
            className={loading ? 'spinning' : ''}
          />
          Atualizar
        </button>
      </header>

      {/* Renderizar dashboard específico do perfil */}
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
