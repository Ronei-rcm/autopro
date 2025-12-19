import { useState, useEffect } from 'react';
import { X, Printer, Clock, User, Car, DollarSign, Package, Wrench, Play, CheckCircle, AlertCircle, XCircle, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  client_id: number;
  client_name?: string;
  vehicle_id: number;
  brand?: string;
  model?: string;
  plate?: string;
  mechanic_id?: number;
  mechanic_name?: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  started_at?: string;
  finished_at?: string;
  technical_notes?: string;
  created_at: string;
  items?: OrderItem[];
  history?: OrderHistory[];
}

interface OrderItem {
  id: number;
  product_id?: number;
  labor_id?: number;
  product_name?: string;
  labor_name?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'product' | 'labor';
}

interface OrderHistory {
  id: number;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  changed_by_name?: string;
  notes?: string;
  created_at: string;
}

interface OrderDetailModalProps {
  orderId: number | null;
  onClose: () => void;
  onUpdate: () => void;
}

const OrderDetailModal = ({ orderId, onClose, onUpdate }: OrderDetailModalProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'history'>('details');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar ordem de serviço');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!orderId) return;

    try {
      await api.post(`/orders/${orderId}/quick-action`, { action });
      toast.success('Ação executada com sucesso!');
      loadOrder();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao executar ação');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#64748b',
      in_progress: '#3b82f6',
      waiting_parts: '#f59e0b',
      finished: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Aberta',
      in_progress: 'Em Andamento',
      waiting_parts: 'Aguardando Peças',
      finished: 'Finalizada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getQuickActions = () => {
    if (!order) return [];

    const actions = [];
    if (order.status === 'open') {
      actions.push({ action: 'start', label: 'Iniciar OS', icon: Play, color: '#3b82f6' });
    }
    if (order.status === 'in_progress') {
      actions.push({ action: 'finish', label: 'Finalizar OS', icon: CheckCircle, color: '#10b981' });
      actions.push({ action: 'wait_parts', label: 'Aguardar Peças', icon: AlertCircle, color: '#f59e0b' });
    }
    if (order.status === 'waiting_parts') {
      actions.push({ action: 'start', label: 'Retomar OS', icon: Play, color: '#3b82f6' });
    }
    if (order.status === 'finished' || order.status === 'cancelled') {
      actions.push({ action: 'reopen', label: 'Reabrir OS', icon: RotateCcw, color: '#64748b' });
    }
    if (order.status !== 'cancelled' && order.status !== 'finished') {
      actions.push({ action: 'cancel', label: 'Cancelar OS', icon: XCircle, color: '#ef4444' });
    }

    return actions;
  };

  if (!orderId) return null;

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002,
        }}
      >
        <div style={{ color: 'white' }}>Carregando...</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1002,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {order.order_number}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(order.status) + '20',
                  color: getStatusColor(order.status),
                }}
              >
                {getStatusLabel(order.status)}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Criada em {formatDate(order.created_at)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              title="Imprimir"
            >
              <Printer size={20} color="#64748b" />
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <X size={20} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {getQuickActions().length > 0 && (
          <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {getQuickActions().map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: action.color + '20',
                    color: action.color,
                    border: `1px solid ${action.color}40`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  <Icon size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'details', label: 'Detalhes' },
            { id: 'items', label: 'Itens' },
            { id: 'history', label: 'Histórico' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : '#f8fafc',
                borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? '#1e293b' : '#64748b',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeTab === 'details' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="#64748b" />
                  Cliente
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{order.client_name}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Car size={18} color="#64748b" />
                  Veículo
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {order.brand} {order.model}
                  </div>
                  {order.plate && (
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Placa: {order.plate}</div>
                  )}
                </div>
              </div>

              {order.mechanic_name && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={18} color="#64748b" />
                    Mecânico
                  </h3>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600' }}>{order.mechanic_name}</div>
                  </div>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="#64748b" />
                  Datas
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  {order.started_at && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Iniciada em:</div>
                      <div style={{ fontWeight: '600' }}>{formatDate(order.started_at)}</div>
                    </div>
                  )}
                  {order.finished_at && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Finalizada em:</div>
                      <div style={{ fontWeight: '600' }}>{formatDate(order.finished_at)}</div>
                    </div>
                  )}
                </div>
              </div>

              {order.technical_notes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Observações Técnicas
                  </h3>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                    {order.technical_notes}
                  </div>
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="#64748b" />
                  Valores
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Desconto:</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(order.discount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Total:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#10b981' }}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div>
              {order.items && order.items.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Item
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Qtd
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Unit.
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.item_type === 'product' ? (
                              <Package size={16} color="#3b82f6" />
                            ) : (
                              <Wrench size={16} color="#f97316" />
                            )}
                            <span style={{ fontWeight: '600' }}>{item.description}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Nenhum item adicionado
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {order.history && order.history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.history.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        borderLeft: '3px solid #f97316',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '600' }}>{entry.field_changed}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {formatDate(entry.created_at)}
                        </div>
                      </div>
                      {entry.old_value && entry.new_value && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                          {entry.old_value} → {entry.new_value}
                        </div>
                      )}
                      {entry.notes && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                          {entry.notes}
                        </div>
                      )}
                      {entry.changed_by_name && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                          Por: {entry.changed_by_name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Nenhum histórico registrado
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

