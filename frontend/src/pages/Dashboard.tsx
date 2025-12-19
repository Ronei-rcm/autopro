import { Users, FileText, DollarSign, Package, Calendar } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ServicesChart from '../components/dashboard/ServicesChart';

const Dashboard = () => {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Visão geral do seu negócio
        </p>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <KPICard
          title="Clientes"
          value="156"
          icon={Users}
          trend="+12% vs mês anterior"
          trendColor="#10b981"
          iconColor="#10b981"
        />
        <KPICard
          title="OS Ativas"
          value="12"
          icon={FileText}
          bgColor="#fff7ed"
          iconColor="#f97316"
        />
        <KPICard
          title="Faturamento"
          value="R$ 45.680,00"
          icon={DollarSign}
          trend="+8% vs mês anterior"
          trendColor="#10b981"
          bgColor="#f0fdf4"
          iconColor="#10b981"
        />
        <KPICard
          title="A Receber"
          value="R$ 8.450,00"
          icon={DollarSign}
          bgColor="#fefce8"
          iconColor="#eab308"
        />
        <KPICard
          title="Estoque Baixo"
          value="3"
          icon={Package}
          bgColor="#fff7ed"
          iconColor="#f97316"
        />
        <KPICard
          title="Agendamentos"
          value="5"
          icon={Calendar}
          iconColor="#3b82f6"
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
        }}
      >
        <RevenueChart />
        <ServicesChart />
      </div>
    </div>
  );
};

export default Dashboard;
