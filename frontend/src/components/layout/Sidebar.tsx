import { NavLink } from 'react-router-dom';
import { useState } from 'react';
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
  Wrench,
  X,
  UserPlus,
  Shield,
  Layers,
  CheckSquare
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
  { path: '/garantias', label: 'Garantias', icon: Shield },
  { path: '/templates-os', label: 'Templates de OS', icon: Layers },
  { path: '/checklists', label: 'Checklists', icon: CheckSquare },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/usuarios', label: 'Usuários', icon: UserPlus },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

interface MenuItemProps {
  item: { path: string; label: string; icon: any };
  isCollapsed: boolean;
  onItemClick?: () => void;
}

const MenuItem = ({ item, isCollapsed, onItemClick }: MenuItemProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <div style={{ position: 'relative' }}>
      <NavLink
        to={item.path}
        onClick={onItemClick}
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '0.75rem',
          padding: isCollapsed ? '0.75rem' : '0.75rem 1.5rem',
          color: isActive ? '#f97316' : 'rgba(255, 255, 255, 0.8)',
          backgroundColor: isActive 
            ? 'rgba(249, 115, 22, 0.1)' 
            : isHovered 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'transparent',
          borderLeft: isActive ? '3px solid #f97316' : '3px solid transparent',
          textDecoration: 'none',
          transition: 'all 0.2s',
          cursor: 'pointer',
          position: 'relative',
          minHeight: '44px', // Touch-friendly
        })}
        onMouseEnter={() => {
          setIsHovered(true);
          if (isCollapsed) {
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        aria-label={isCollapsed ? item.label : undefined}
      >
        <Icon size={20} style={{ flexShrink: 0 }} aria-hidden="true" />
        {!isCollapsed && (
          <span style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
        )}
      </NavLink>
      {isCollapsed && showTooltip && (
        <div
          style={{
            position: 'absolute',
            left: '100%',
            marginLeft: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#1e293b',
            color: 'white',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            zIndex: 10000,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {item.label}
          <div
            style={{
              position: 'absolute',
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              border: '6px solid transparent',
              borderRightColor: '#1e293b',
            }}
          />
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isCollapsed, isMobile = false, isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) => {
  const sidebarWidth = isCollapsed ? 80 : 260;
  const mobileWidth = 280;

  // Mobile: drawer behavior
  if (isMobile) {
    return (
      <>
        <aside
          style={{
            width: `${mobileWidth}px`,
            height: '100vh',
            backgroundColor: '#1e293b',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: isMobileMenuOpen ? 0 : `-${mobileWidth}px`,
            top: 0,
            zIndex: 1000,
            transition: 'left 0.3s ease-in-out',
            overflow: 'hidden',
            boxShadow: isMobileMenuOpen ? '2px 0 8px rgba(0, 0, 0, 0.15)' : 'none',
          }}
          role="navigation"
          aria-label="Menu principal"
        >
          <SidebarContent 
            isCollapsed={false} 
            isMobile={true}
            onCloseMobileMenu={onCloseMobileMenu}
          />
        </aside>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside
      style={{
        width: `${sidebarWidth}px`,
        height: '100vh',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
      }}
      role="navigation"
      aria-label="Menu principal"
    >
      <SidebarContent isCollapsed={isCollapsed} isMobile={false} />
    </aside>
  );
};

interface SidebarContentProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onCloseMobileMenu?: () => void;
}

const SidebarContent = ({ isCollapsed, isMobile, onCloseMobileMenu }: SidebarContentProps) => {
  return (
    <>
      {/* Logo */}
      <div
        style={{
          padding: isCollapsed ? '1.5rem 0.75rem' : '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: '70px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#f97316',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
              flexShrink: 0,
          }}
        >
          <Wrench size={24} color="white" />
        </div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>AutoPro</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            Sistema de Gestão
          </div>
        </div>
          )}
        </div>
        {isMobile && onCloseMobileMenu && (
          <button
            onClick={onCloseMobileMenu}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => {
          return (
            <MenuItem
              key={item.path}
              item={item}
              isCollapsed={isCollapsed}
              onItemClick={isMobile ? onCloseMobileMenu : undefined}
            />
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
      <div
        style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
          opacity: 0.7,
          textAlign: 'center',
            overflow: 'hidden',
        }}
      >
        <div>Versão 1.0.0</div>
        <div style={{ marginTop: '0.25rem' }}>© 2024 AutoPro</div>
      </div>
      )}
    </>
  );
};

export default Sidebar;

