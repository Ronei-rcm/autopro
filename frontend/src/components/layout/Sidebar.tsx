import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Truck, 
  Package, 
  FileText, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Settings,
  Wrench
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/veiculos', label: 'Veículos', icon: Car },
  { path: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { path: '/estoque', label: 'Estoque', icon: Package },
  { path: '/ordens-servico', label: 'Ordens de Serviço', icon: FileText },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#f97316',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Wrench size={24} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>AutoPro</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            Sistema de Gestão
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: isActive ? '#f97316' : 'rgba(255, 255, 255, 0.8)',
                backgroundColor: isActive ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #f97316' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
          opacity: 0.7,
          textAlign: 'center',
        }}
      >
        <div>Versão 1.0.0</div>
        <div style={{ marginTop: '0.25rem' }}>© 2024 AutoPro</div>
      </div>
    </aside>
  );
};

export default Sidebar;

