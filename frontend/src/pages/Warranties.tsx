import { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, XCircle, Calendar, Package, User, Search, Filter, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/common/SkeletonLoader';

interface Warranty {
  id: number;
  order_id: number;
  order_item_id: number;
  order_number?: string;
  client_id?: number;
  client_name?: string;
  item_description?: string;
  product_id?: number;
  labor_id?: number;
  description: string;
  warranty_period_days: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'used' | 'cancelled';
  notes?: string;
}

const Warranties = () => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadWarranties();
    loadSummary();
  }, [statusFilter]);

  const loadWarranties = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await api.get('/warranties', { params });
      setWarranties(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar garantias');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await api.get('/warranties/summary');
      setSummary(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar resumo de garantias');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#10b981',
      expired: '#ef4444',
      used: '#64748b',
      cancelled: '#94a3b8',
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativa',
      expired: 'Expirada',
      used: 'Utilizada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} color="#10b981" />;
      case 'expired':
        return <XCircle size={16} color="#ef4444" />;
      case 'used':
        return <CheckCircle size={16} color="#64748b" />;
      case 'cancelled':
        return <XCircle size={16} color="#94a3b8" />;
      default:
        return <AlertCircle size={16} color="#64748b" />;
    }
  };

  const isExpiringSoon = (endDate: string, days: number = 30) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= days;
  };

  const filteredWarranties = warranties.filter((warranty) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      warranty.description.toLowerCase().includes(searchLower) ||
      warranty.order_number?.toLowerCase().includes(searchLower) ||
      warranty.client_name?.toLowerCase().includes(searchLower) ||
      warranty.item_description?.toLowerCase().includes(searchLower)
    );
  });

  const handleStatusChange = async (warrantyId: number, newStatus: string) => {
    try {
      await api.put(`/warranties/${warrantyId}`, { status: newStatus });
      toast.success('Status da garantia atualizado!');
      loadWarranties();
      loadSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={32} color="#3b82f6" />
          Garantias
        </h1>
        <p style={{ color: '#64748b' }}>Gerencie as garantias dos serviços realizados</p>
      </div>

      {/* Resumo */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total de Garantias</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{summary.total || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Ativas</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{summary.active_count || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Expiradas</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{summary.expired_count || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Expirando em 30 dias</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{summary.expiring_soon_count || 0}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por descrição, OS, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} color="#94a3b8" />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} color="#64748b" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="expired">Expiradas</option>
            <option value="used">Utilizadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Lista de Garantias */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        {loading ? (
          <SkeletonLoader type="table" />
        ) : filteredWarranties.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            {searchTerm || statusFilter !== 'all' ? 'Nenhuma garantia encontrada com os filtros aplicados' : 'Nenhuma garantia cadastrada'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>OS</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Cliente</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Item</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Descrição</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Período</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Vencimento</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarranties.map((warranty) => {
                  const expiringSoon = warranty.status === 'active' && isExpiringSoon(warranty.end_date);
                  return (
                    <tr
                      key={warranty.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: expiringSoon ? '#fffbeb' : 'white',
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{warranty.order_number || `OS #${warranty.order_id}`}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{warranty.client_name || '-'}</td>
                      <td style={{ padding: '1rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {warranty.item_description || '-'}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{warranty.description}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>
                        {warranty.warranty_period_days} dia{warranty.warranty_period_days !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} color={expiringSoon ? '#f59e0b' : '#64748b'} />
                          <span style={{ color: expiringSoon ? '#f59e0b' : '#1e293b', fontWeight: expiringSoon ? '600' : '400' }}>
                            {formatDate(warranty.end_date)}
                          </span>
                          {expiringSoon && (
                            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>
                              (Expira em breve)
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          {getStatusIcon(warranty.status)}
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: getStatusColor(warranty.status) + '20',
                              color: getStatusColor(warranty.status),
                            }}
                          >
                            {getStatusLabel(warranty.status)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {warranty.status === 'active' && (
                          <select
                            value={warranty.status}
                            onChange={(e) => handleStatusChange(warranty.id, e.target.value)}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              backgroundColor: 'white',
                            }}
                          >
                            <option value="active">Ativa</option>
                            <option value="used">Marcar como Utilizada</option>
                            <option value="cancelled">Cancelar</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Warranties;
