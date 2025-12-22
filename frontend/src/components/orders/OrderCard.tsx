import { Edit, Trash2, Eye, FileText, Car, User, Clock, DollarSign, Wrench, UserCheck, ArrowRightLeft } from 'lucide-react';
import OrderStatusChip from './OrderStatusChip';
import QuickActionsMenu from './QuickActionsMenu';

interface OrderCardProps {
  order: any;
  onEdit: (order: any) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onViewItems: (order: any) => void;
  onQuickAction?: (orderId: number, action: string) => void;
  onAssume?: (orderId: number) => void;
  onTransfer?: (order: any) => void;
  currentUserId?: number;
  currentUserProfile?: string;
  formatCurrency: (value: number) => string;
  getStatusLabel: (status: string) => string;
  loading?: boolean;
}

const OrderCard = ({
  order,
  onEdit,
  onDelete,
  onView,
  onViewItems,
  onQuickAction,
  onAssume,
  onTransfer,
  currentUserId,
  currentUserProfile,
  formatCurrency,
  getStatusLabel,
  loading = false,
}: OrderCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onClick={() => onView(order.id)}
    >
      {/* Header com número e status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <FileText size={20} color="#f97316" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              {order.order_number}
            </h3>
          </div>
          <OrderStatusChip status={order.status} size="sm" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(order.id);
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: '#eff6ff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Ver detalhes"
          >
            <Eye size={16} color="#3b82f6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(order);
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Editar"
          >
            <Edit size={16} color="#64748b" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order.id);
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Excluir"
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Informações do cliente e veículo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} color="#64748b" />
          <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>
            {order.client_name || 'Cliente não informado'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Car size={16} color="#64748b" />
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {order.brand} {order.model} {order.plate ? `- ${order.plate}` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {order.mechanic_name ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={16} color="#64748b" />
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{order.mechanic_name}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={16} color="#94a3b8" />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>Sem mecânico</span>
            </div>
          )}
          {(currentUserProfile === 'admin' || currentUserProfile === 'mechanic' || currentUserProfile === 'attendant') && order.status !== 'finished' && order.status !== 'cancelled' && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {(!order.mechanic_id || order.mechanic_id !== currentUserId) && onAssume && (currentUserProfile === 'admin' || currentUserProfile === 'mechanic') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssume(order.id);
                  }}
                  disabled={loading}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#e0e7ff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6366f1',
                    opacity: loading ? 0.5 : 1,
                  }}
                  title="Assumir OS"
                >
                  <UserCheck size={14} />
                  Assumir
                </button>
              )}
              {onTransfer && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransfer(order);
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#fef3c7',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#f59e0b',
                  }}
                  title="Transferir OS"
                >
                  <ArrowRightLeft size={14} />
                  Transferir
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Valores e datas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Total</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>
            {formatCurrency(order.total)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Criada em</div>
          <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>{formatDate(order.created_at)}</div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewItems(order);
          }}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={14} />
          Ver Itens
        </button>
        {onQuickAction && (
          <QuickActionsMenu order={order} onAction={onQuickAction} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default OrderCard;

