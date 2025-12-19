import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Search, Plus, Edit, Trash2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Payable {
  id: number;
  supplier_id?: number;
  supplier_name?: string;
  description: string;
  category?: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  payment_date?: string;
  payment_method?: string;
  status: string;
  notes?: string;
}

interface Receivable {
  id: number;
  order_id?: number;
  client_id: number;
  client_name?: string;
  description: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  payment_date?: string;
  payment_method?: string;
  status: string;
  notes?: string;
}

interface DashboardData {
  payables: any;
  receivables: any;
  cashFlow: any;
}

const Financial = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payables' | 'receivables' | 'cashflow'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayableModal, setShowPayableModal] = useState(false);
  const [showReceivableModal, setShowReceivableModal] = useState(false);
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [payableFormData, setPayableFormData] = useState({
    supplier_id: '',
    description: '',
    category: '',
    due_date: '',
    amount: '',
    paid_amount: '0',
    payment_date: '',
    payment_method: '',
    status: 'open',
    notes: '',
  });
  const [receivableFormData, setReceivableFormData] = useState({
    client_id: '',
    description: '',
    due_date: '',
    amount: '',
    paid_amount: '0',
    payment_date: '',
    payment_method: '',
    status: 'open',
    notes: '',
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'payables') {
      loadPayables();
      loadSuppliers();
    } else if (activeTab === 'receivables') {
      loadReceivables();
      loadClients();
    }
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financial/dashboard');
      setDashboardData(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar dashboard financeiro');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financial/payables');
      setPayables(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar contas a pagar');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadReceivables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financial/receivables');
      setReceivables(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar contas a receber');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handlePayableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...payableFormData,
        supplier_id: payableFormData.supplier_id ? parseInt(payableFormData.supplier_id) : null,
        amount: parseFloat(payableFormData.amount),
        paid_amount: parseFloat(payableFormData.paid_amount) || 0,
        due_date: new Date(payableFormData.due_date).toISOString(),
        payment_date: payableFormData.payment_date ? new Date(payableFormData.payment_date).toISOString() : null,
        category: payableFormData.category || null,
        payment_method: payableFormData.payment_method || null,
        notes: payableFormData.notes || null,
      };

      if (editingPayable) {
        await api.put(`/financial/payables/${editingPayable.id}`, data);
        toast.success('Conta a pagar atualizada com sucesso!');
      } else {
        await api.post('/financial/payables', data);
        toast.success('Conta a pagar criada com sucesso!');
      }
      setShowPayableModal(false);
      resetPayableForm();
      loadPayables();
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar conta a pagar');
    }
  };

  const handleReceivableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...receivableFormData,
        client_id: parseInt(receivableFormData.client_id),
        amount: parseFloat(receivableFormData.amount),
        paid_amount: parseFloat(receivableFormData.paid_amount) || 0,
        due_date: new Date(receivableFormData.due_date).toISOString(),
        payment_date: receivableFormData.payment_date ? new Date(receivableFormData.payment_date).toISOString() : null,
        payment_method: receivableFormData.payment_method || null,
        notes: receivableFormData.notes || null,
      };

      if (editingReceivable) {
        await api.put(`/financial/receivables/${editingReceivable.id}`, data);
        toast.success('Conta a receber atualizada com sucesso!');
      } else {
        await api.post('/financial/receivables', data);
        toast.success('Conta a receber criada com sucesso!');
      }
      setShowReceivableModal(false);
      resetReceivableForm();
      loadReceivables();
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar conta a receber');
    }
  };

  const handleDeletePayable = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta conta a pagar?')) return;

    try {
      await api.delete(`/financial/payables/${id}`);
      toast.success('Conta a pagar excluída com sucesso!');
      loadPayables();
      loadDashboard();
    } catch (error: any) {
      toast.error('Erro ao excluir conta a pagar');
    }
  };

  const handleDeleteReceivable = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta conta a receber?')) return;

    try {
      await api.delete(`/financial/receivables/${id}`);
      toast.success('Conta a receber excluída com sucesso!');
      loadReceivables();
      loadDashboard();
    } catch (error: any) {
      toast.error('Erro ao excluir conta a receber');
    }
  };

  const resetPayableForm = () => {
    setPayableFormData({
      supplier_id: '',
      description: '',
      category: '',
      due_date: '',
      amount: '',
      paid_amount: '0',
      payment_date: '',
      payment_method: '',
      status: 'open',
      notes: '',
    });
    setEditingPayable(null);
  };

  const resetReceivableForm = () => {
    setReceivableFormData({
      client_id: '',
      description: '',
      due_date: '',
      amount: '',
      paid_amount: '0',
      payment_date: '',
      payment_method: '',
      status: 'open',
      notes: '',
    });
    setEditingReceivable(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#f59e0b',
      paid: '#10b981',
      overdue: '#ef4444',
      cancelled: '#64748b',
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Aberta',
      paid: 'Paga',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          Financeiro
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Controle financeiro completo da oficina
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'payables', label: 'Contas a Pagar' },
          { id: 'receivables', label: 'Contas a Receber' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#f97316' : '#64748b',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando...</div>
          ) : dashboardData ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Contas a Pagar */}
              <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#fee2e220', borderRadius: '8px' }}>
                    <TrendingDown size={24} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Contas a Pagar</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {formatCurrency(parseFloat(dashboardData.payables?.total_open || '0'))}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Vencidas: {formatCurrency(parseFloat(dashboardData.payables?.total_overdue || '0'))}
                </div>
              </div>

              {/* Contas a Receber */}
              <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf420', borderRadius: '8px' }}>
                    <TrendingUp size={24} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Contas a Receber</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {formatCurrency(parseFloat(dashboardData.receivables?.total_open || '0'))}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Vencidas: {formatCurrency(parseFloat(dashboardData.receivables?.total_overdue || '0'))}
                </div>
              </div>

              {/* Saldo do Mês */}
              <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff20', borderRadius: '8px' }}>
                    <DollarSign size={24} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Saldo do Mês</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {formatCurrency(parseFloat(dashboardData.cashFlow?.balance || '0'))}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Receitas: {formatCurrency(parseFloat(dashboardData.cashFlow?.total_income || '0'))} | 
                  Despesas: {formatCurrency(parseFloat(dashboardData.cashFlow?.total_expense || '0'))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Contas a Pagar Tab */}
      {activeTab === 'payables' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => {
                resetPayableForm();
                setShowPayableModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              <Plus size={20} />
              Nova Conta a Pagar
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando...</div>
            ) : payables.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Nenhuma conta a pagar encontrada</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Descrição</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Fornecedor</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Vencimento</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Valor</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Pago</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {payables.map((payable) => {
                    const overdue = isOverdue(payable.due_date, payable.status);
                    return (
                      <tr
                        key={payable.id}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: overdue ? '#fef2f2' : 'white',
                        }}
                      >
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{payable.description}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{payable.supplier_name || '-'}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{formatDate(payable.due_date)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(payable.amount)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>{formatCurrency(payable.paid_amount)}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: getStatusColor(overdue ? 'overdue' : payable.status) + '20',
                              color: getStatusColor(overdue ? 'overdue' : payable.status),
                            }}
                          >
                            {overdue ? 'Vencida' : getStatusLabel(payable.status)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setEditingPayable(payable);
                                setPayableFormData({
                                  supplier_id: payable.supplier_id?.toString() || '',
                                  description: payable.description,
                                  category: payable.category || '',
                                  due_date: new Date(payable.due_date).toISOString().split('T')[0],
                                  amount: payable.amount.toString(),
                                  paid_amount: payable.paid_amount.toString(),
                                  payment_date: payable.payment_date ? new Date(payable.payment_date).toISOString().split('T')[0] : '',
                                  payment_method: payable.payment_method || '',
                                  status: payable.status,
                                  notes: payable.notes || '',
                                });
                                setShowPayableModal(true);
                              }}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#f1f5f9',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit size={16} color="#64748b" />
                            </button>
                            <button
                              onClick={() => handleDeletePayable(payable.id)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#fee2e2',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={16} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Contas a Receber Tab */}
      {activeTab === 'receivables' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => {
                resetReceivableForm();
                setShowReceivableModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              <Plus size={20} />
              Nova Conta a Receber
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando...</div>
            ) : receivables.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Nenhuma conta a receber encontrada</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Descrição</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Cliente</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Vencimento</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Valor</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Recebido</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {receivables.map((receivable) => {
                    const overdue = isOverdue(receivable.due_date, receivable.status);
                    return (
                      <tr
                        key={receivable.id}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: overdue ? '#fef2f2' : 'white',
                        }}
                      >
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{receivable.description}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{receivable.client_name || '-'}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{formatDate(receivable.due_date)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(receivable.amount)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>{formatCurrency(receivable.paid_amount)}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: getStatusColor(overdue ? 'overdue' : receivable.status) + '20',
                              color: getStatusColor(overdue ? 'overdue' : receivable.status),
                            }}
                          >
                            {overdue ? 'Vencida' : getStatusLabel(receivable.status)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setEditingReceivable(receivable);
                                setReceivableFormData({
                                  client_id: receivable.client_id.toString(),
                                  description: receivable.description,
                                  due_date: new Date(receivable.due_date).toISOString().split('T')[0],
                                  amount: receivable.amount.toString(),
                                  paid_amount: receivable.paid_amount.toString(),
                                  payment_date: receivable.payment_date ? new Date(receivable.payment_date).toISOString().split('T')[0] : '',
                                  payment_method: receivable.payment_method || '',
                                  status: receivable.status,
                                  notes: receivable.notes || '',
                                });
                                setShowReceivableModal(true);
                              }}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#f1f5f9',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit size={16} color="#64748b" />
                            </button>
                            <button
                              onClick={() => handleDeleteReceivable(receivable.id)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#fee2e2',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={16} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal Conta a Pagar */}
      {showPayableModal && (
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
            zIndex: 1000,
          }}
          onClick={() => {
            setShowPayableModal(false);
            resetPayableForm();
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingPayable ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
            </h2>
            <form onSubmit={handlePayableSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Fornecedor
                </label>
                <select
                  value={payableFormData.supplier_id}
                  onChange={(e) => setPayableFormData({ ...payableFormData, supplier_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Descrição *
                </label>
                <input
                  type="text"
                  value={payableFormData.description}
                  onChange={(e) => setPayableFormData({ ...payableFormData, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={payableFormData.due_date}
                    onChange={(e) => setPayableFormData({ ...payableFormData, due_date: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={payableFormData.amount}
                    onChange={(e) => setPayableFormData({ ...payableFormData, amount: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Valor Pago
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payableFormData.paid_amount}
                    onChange={(e) => setPayableFormData({ ...payableFormData, paid_amount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Data de Pagamento
                  </label>
                  <input
                    type="date"
                    value={payableFormData.payment_date}
                    onChange={(e) => setPayableFormData({ ...payableFormData, payment_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={payableFormData.category}
                    onChange={(e) => setPayableFormData({ ...payableFormData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Método de Pagamento
                  </label>
                  <select
                    value={payableFormData.payment_method}
                    onChange={(e) => setPayableFormData({ ...payableFormData, payment_method: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="">Selecione</option>
                    <option value="cash">Dinheiro</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="bank_transfer">Transferência Bancária</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Observações
                </label>
                <textarea
                  value={payableFormData.notes}
                  onChange={(e) => setPayableFormData({ ...payableFormData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPayableModal(false);
                    resetPayableForm();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {editingPayable ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Conta a Receber */}
      {showReceivableModal && (
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
            zIndex: 1000,
          }}
          onClick={() => {
            setShowReceivableModal(false);
            resetReceivableForm();
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingReceivable ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
            </h2>
            <form onSubmit={handleReceivableSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Cliente *
                </label>
                <select
                  value={receivableFormData.client_id}
                  onChange={(e) => setReceivableFormData({ ...receivableFormData, client_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Descrição *
                </label>
                <input
                  type="text"
                  value={receivableFormData.description}
                  onChange={(e) => setReceivableFormData({ ...receivableFormData, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={receivableFormData.due_date}
                    onChange={(e) => setReceivableFormData({ ...receivableFormData, due_date: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={receivableFormData.amount}
                    onChange={(e) => setReceivableFormData({ ...receivableFormData, amount: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Valor Recebido
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={receivableFormData.paid_amount}
                    onChange={(e) => setReceivableFormData({ ...receivableFormData, paid_amount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Data de Recebimento
                  </label>
                  <input
                    type="date"
                    value={receivableFormData.payment_date}
                    onChange={(e) => setReceivableFormData({ ...receivableFormData, payment_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Método de Pagamento
                </label>
                <select
                  value={receivableFormData.payment_method}
                  onChange={(e) => setReceivableFormData({ ...receivableFormData, payment_method: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Selecione</option>
                  <option value="cash">Dinheiro</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Observações
                </label>
                <textarea
                  value={receivableFormData.notes}
                  onChange={(e) => setReceivableFormData({ ...receivableFormData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowReceivableModal(false);
                    resetReceivableForm();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {editingReceivable ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;

