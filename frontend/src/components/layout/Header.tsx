import { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
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
        marginLeft: '260px',
      }}
    >
      {/* Search */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          maxWidth: '400px',
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
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#f97316';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
          }}
        />
      </div>

      {/* Right side */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
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
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f97316',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}
          >
            {user ? getInitials(user.name) : 'AD'}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {user?.profile === 'admin' ? 'Administrador' : user?.profile}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

