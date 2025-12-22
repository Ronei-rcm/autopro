import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, ExternalLink, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  reference_type?: string | null;
  reference_id?: number | null;
  action_url?: string | null;
  read: boolean;
  created_at: string;
}

interface NotificationPanelProps {
  profile: string;
}

const NotificationPanel = ({ profile }: NotificationPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const handleAction = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div style={{ position: 'relative' }}>
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de Notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          {/* Painel */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              width: '380px',
              maxHeight: '500px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="#64748b" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                  Notificações
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <CheckCheck size={14} />
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: '0.25rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    color: '#64748b',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div
              style={{
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Carregando...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <Bell size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleAction(notification)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: notification.action_url ? 'pointer' : 'default',
                      backgroundColor: notification.read ? 'white' : '#f8fafc',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (notification.action_url) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f8fafc';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div
                        style={{
                          flexShrink: 0,
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: notification.type === 'order_finished' ? '#fef3c7' : '#e0e7ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {notification.type === 'order_finished' ? (
                          <FileText size={20} color="#f59e0b" />
                        ) : (
                          <Bell size={20} color="#6366f1" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <h4
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: notification.read ? '500' : '600',
                              color: '#1e293b',
                              margin: 0,
                            }}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              style={{
                                padding: '0.25rem',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                color: '#64748b',
                                flexShrink: 0,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e2e8f0';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: '#64748b',
                            margin: '0.25rem 0',
                            lineHeight: '1.4',
                          }}
                        >
                          {notification.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {notification.action_url && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontWeight: '500',
                              }}
                            >
                              Ação rápida
                              <ExternalLink size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;

