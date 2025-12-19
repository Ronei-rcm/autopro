import { useState } from 'react';
import { Search, Bell, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
}

const Header = ({ isCollapsed, onToggleSidebar, isMobile = false, isMobileMenuOpen = false }: HeaderProps) => {
  const { user } = useAuth();
  const [notifications] = useState(3); // Mock - depois virá da API

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        marginLeft: 0,
        transition: 'margin-left 0.3s ease-in-out',
      }}
    >
      {/* Menu Toggle Button */}
      <button
        onClick={onToggleSidebar}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? '44px' : '40px',
          height: isMobile ? '44px' : '40px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          backgroundColor: 'white',
          cursor: 'pointer',
          color: '#64748b',
          transition: 'all 0.2s',
          marginRight: '1rem',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#f97316';
            e.currentTarget.style.color = '#f97316';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#64748b';
          }
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.backgroundColor = '#f8fafc';
        }}
        onTouchEnd={(e) => {
          setTimeout(() => {
            e.currentTarget.style.backgroundColor = 'white';
          }, 200);
        }}
        title={isMobile ? 'Abrir menu' : (isCollapsed ? 'Expandir menu' : 'Recolher menu')}
        aria-label={isMobile ? 'Abrir menu de navegação' : (isCollapsed ? 'Expandir menu' : 'Recolher menu')}
        aria-expanded={isMobile ? isMobileMenuOpen : undefined}
      >
        {isMobile ? (
          <Menu size={20} />
        ) : (
          isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
        )}
      </button>
      {/* Search */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          maxWidth: isMobile ? '100%' : '400px',
          marginLeft: '0',
          minWidth: 0, // Prevents flex item from overflowing
        }}
      >
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
          }}
        />
        <input
          type="text"
          placeholder="Buscar..."
          style={{
            width: '100%',
            padding: isMobile ? '0.875rem 1rem 0.875rem 2.5rem' : '0.75rem 1rem 0.75rem 2.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: isMobile ? '16px' : '0.9rem', // Prevents zoom on iOS
            outline: 'none',
            minHeight: '44px', // Touch-friendly
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#f97316';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
          }}
          aria-label="Buscar"
        />
      </div>

      {/* Right side */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.75rem' : '1.5rem',
          flexShrink: 0,
        }}
      >
        {/* Notifications */}
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          <Bell size={22} color="#64748b" />
          {notifications > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold',
              }}
            >
              {notifications}
            </span>
          )}
        </div>

        {/* User */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              borderRadius: '50%',
              backgroundColor: '#f97316',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              flexShrink: 0,
            }}
            aria-label={`Usuário: ${user?.name || 'Admin'}`}
          >
            {user ? getInitials(user.name) : 'AD'}
          </div>
          {!isMobile && (
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {user?.profile === 'admin' ? 'Administrador' : user?.profile}
            </div>
          </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

