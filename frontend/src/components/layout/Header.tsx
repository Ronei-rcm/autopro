import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronRight, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from '../common/GlobalSearch';
import toast from 'react-hot-toast';

interface HeaderProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
}

const Header = ({ isCollapsed, onToggleSidebar, isMobile = false, isMobileMenuOpen = false }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications] = useState(3); // Mock - depois virá da API
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, redirecionar para login
      navigate('/login');
    }
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

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
      {/* Global Search */}
      {!isMobile && <GlobalSearch />}

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

        {/* User Menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              backgroundColor: showUserMenu ? '#f8fafc' : 'transparent',
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            onMouseEnter={(e) => {
              if (!showUserMenu) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }
            }}
            onMouseLeave={(e) => {
              if (!showUserMenu) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
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
              <>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {user?.name || 'Admin'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {user?.profile === 'admin' ? 'Administrador' : 
                     user?.profile === 'mechanic' ? 'Mecânico' :
                     user?.profile === 'financial' ? 'Financeiro' :
                     user?.profile === 'attendant' ? 'Atendente' : user?.profile}
                  </div>
                </div>
                <ChevronDown 
                  size={18} 
                  color="#64748b" 
                  style={{ 
                    transition: 'transform 0.2s',
                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </>
            )}
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                minWidth: '200px',
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>
                  {user?.name || 'Usuário'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {user?.email || ''}
                </div>
              </div>
              
              <div
                style={{
                  padding: '0.5rem',
                }}
              >
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // TODO: Navegar para página de perfil quando criada
                    // navigate('/perfil');
                    toast.info('Página de perfil em desenvolvimento');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <User size={18} color="#64748b" />
                  Meu Perfil
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={18} color="#ef4444" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

