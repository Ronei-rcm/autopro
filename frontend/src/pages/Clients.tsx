import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, User, Building2, Phone, Mail, Eye, Car, MapPin, Loader2, FileText, DollarSign, Shield, TrendingUp, Calendar } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../components/common/ToastEnhancer';
import AdvancedFilters from '../components/common/AdvancedFilters';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ResponsiveTable } from '../components/common/ResponsiveTable';
import { ResponsiveModal } from '../components/common/ResponsiveModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { formatCPF, formatCNPJ, formatPhone, formatCEP, validateCPF, validateCNPJ, removeNonNumeric, fetchAddressByCEP } from '../utils/formatters';

interface Client {
  id: number;
  name: string;
  type: 'PF' | 'PJ';
  cpf?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  notes?: string;
  active: boolean;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; client: Client | null }>({
    isOpen: false,
    client: null,
  });
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [clientVehicles, setClientVehicles] = useState<any[]>([]);
  const [clientStatistics, setClientStatistics] = useState<any>(null);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PF' as 'PF' | 'PJ',
    cpf: '',
    cnpj: '',
    phone: '',
    email: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zipcode: '',
    notes: '',
    active: true,
  });

  useEffect(() => {
    loadClients();
  }, [search, filters]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const response = await api.get('/clients', { params });
      setClients(response.data);
    } catch (error: any) {
      showErrorToast('Erro ao carregar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes localmente também (para filtros que não estão no backend)
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (filters.type && client.type !== filters.type) return false;
      if (filters.active !== undefined) {
        const isActive = filters.active === 'true';
        if (client.active !== isActive) return false;
      }
      return true;
    });
  }, [clients, filters]);

  // Paginação
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset para primeira página quando filtros mudarem
  }, [filters, search]);

  // Atalhos de teclado
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      action: () => {
        resetForm();
        setShowModal(true);
      },
      description: 'Novo cliente',
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      // Preparar dados para envio (remover formatação)
      const submitData = {
        ...formData,
        cpf: formData.type === 'PF' ? removeNonNumeric(formData.cpf) : undefined,
        cnpj: formData.type === 'PJ' ? removeNonNumeric(formData.cnpj) : undefined,
        phone: formData.phone ? removeNonNumeric(formData.phone) : undefined,
        address_zipcode: formData.address_zipcode ? removeNonNumeric(formData.address_zipcode) : undefined,
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, submitData);
        showSuccessToast(`Cliente "${formData.name}" atualizado com sucesso!`);
      } else {
        await api.post('/clients', submitData);
        showSuccessToast(`Cliente "${formData.name}" criado com sucesso!`);
      }
      setShowModal(false);
      resetForm();
      setFormErrors({});
      loadClients();
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Erro ao salvar cliente');
    }
  };

  const handleEdit = async (client: Client) => {
    try {
      // Carregar dados completos do cliente
      const response = await api.get(`/clients/${client.id}`);
      const fullClient = response.data;
      
      setEditingClient(fullClient);
      setFormData({
        name: fullClient.name,
        type: fullClient.type,
        cpf: fullClient.cpf || '',
        cnpj: fullClient.cnpj || '',
        phone: fullClient.phone || '',
        email: fullClient.email || '',
        address_street: fullClient.address_street || '',
        address_number: fullClient.address_number || '',
        address_complement: fullClient.address_complement || '',
        address_neighborhood: fullClient.address_neighborhood || '',
        address_city: fullClient.address_city || '',
        address_state: fullClient.address_state || '',
        address_zipcode: fullClient.address_zipcode || '',
        notes: fullClient.notes || '',
        active: fullClient.active,
      });
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      showErrorToast('Erro ao carregar dados do cliente');
    }
  };

  const handleDeleteClick = (client: Client) => {
    setDeleteConfirm({ isOpen: true, client });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.client) return;

    try {
      await api.delete(`/clients/${deleteConfirm.client.id}`);
      showSuccessToast(`Cliente "${deleteConfirm.client.name}" excluído com sucesso!`);
      setDeleteConfirm({ isOpen: false, client: null });
      loadClients();
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Erro ao excluir cliente');
      setDeleteConfirm({ isOpen: false, client: null });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'PF',
      cpf: '',
      cnpj: '',
      phone: '',
      email: '',
      address_street: '',
      address_number: '',
      address_complement: '',
      address_neighborhood: '',
      address_city: '',
      address_state: '',
      address_zipcode: '',
      notes: '',
      active: true,
    });
    setEditingClient(null);
    setFormErrors({});
  };

  const handleViewClient = async (client: Client) => {
    try {
      // Carregar dados completos do cliente
      const response = await api.get(`/clients/${client.id}`);
      const fullClient = response.data;
      setViewClient(fullClient);

      // Carregar veículos do cliente
      try {
        const vehiclesResponse = await api.get(`/vehicles/client/${client.id}`);
        setClientVehicles(vehiclesResponse.data);
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        setClientVehicles([]);
      }

      // Carregar estatísticas do cliente
      setLoadingStatistics(true);
      try {
        const statsResponse = await api.get(`/clients/${client.id}/statistics`);
        setClientStatistics(statsResponse.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setClientStatistics(null);
      } finally {
        setLoadingStatistics(false);
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      showErrorToast('Erro ao carregar dados do cliente');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.type === 'PF' && formData.cpf) {
      const cpfNumbers = removeNonNumeric(formData.cpf);
      if (cpfNumbers.length !== 11) {
        errors.cpf = 'CPF deve ter 11 dígitos';
      } else if (!validateCPF(formData.cpf)) {
        errors.cpf = 'CPF inválido';
      }
    }

    if (formData.type === 'PJ' && formData.cnpj) {
      const cnpjNumbers = removeNonNumeric(formData.cnpj);
      if (cnpjNumbers.length !== 14) {
        errors.cnpj = 'CNPJ deve ter 14 dígitos';
      } else if (!validateCNPJ(formData.cnpj)) {
        errors.cnpj = 'CNPJ inválido';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatDocument = (type: string, cpf?: string, cnpj?: string) => {
    if (type === 'PF' && cpf) {
      const numbers = removeNonNumeric(cpf);
      if (numbers.length === 11) {
        return formatCPF(cpf);
      }
      return cpf;
    }
    if (type === 'PJ' && cnpj) {
      const numbers = removeNonNumeric(cnpj);
      if (numbers.length === 14) {
        return formatCNPJ(cnpj);
      }
      return cnpj;
    }
    return '-';
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData({ ...formData, cpf: formatted });
    if (formErrors.cpf) {
      const newErrors = { ...formErrors };
      delete newErrors.cpf;
      setFormErrors(newErrors);
    }
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setFormData({ ...formData, cnpj: formatted });
    if (formErrors.cnpj) {
      const newErrors = { ...formErrors };
      delete newErrors.cnpj;
      setFormErrors(newErrors);
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value);
    setFormData({ ...formData, address_zipcode: formatted });

    // Buscar endereço quando CEP estiver completo (8 dígitos)
    const cleanCEP = removeNonNumeric(value);
    if (cleanCEP.length === 8) {
      setLoadingCEP(true);
      try {
        const addressData = await fetchAddressByCEP(formatted);
        
        if (addressData) {
          // Preencher campos de endereço com dados retornados
          setFormData(prev => ({
            ...prev,
            address_zipcode: formatted,
            address_street: addressData.logradouro || prev.address_street,
            address_neighborhood: addressData.bairro || prev.address_neighborhood,
            address_city: addressData.localidade || prev.address_city,
            address_state: addressData.uf || prev.address_state,
            // Complemento não é preenchido automaticamente para permitir que o usuário adicione
          }));
          
          // Limpar erro de CEP se existir
          if (formErrors.address_zipcode) {
            const newErrors = { ...formErrors };
            delete newErrors.address_zipcode;
            setFormErrors(newErrors);
          }
        } else {
          // CEP não encontrado
          setFormErrors(prev => ({
            ...prev,
            address_zipcode: 'CEP não encontrado',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setFormErrors(prev => ({
          ...prev,
          address_zipcode: 'Erro ao buscar CEP. Tente novamente.',
        }));
      } finally {
        setLoadingCEP(false);
      }
    } else {
      // Limpar erro se CEP não estiver completo
      if (formErrors.address_zipcode) {
        const newErrors = { ...formErrors };
        delete newErrors.address_zipcode;
        setFormErrors(newErrors);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Clientes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gerencie o cadastro de clientes
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
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
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '1rem' }}>
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
            placeholder="Buscar por nome, email, telefone, CPF ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={{
            type: {
              label: 'Tipo',
              type: 'select',
              options: [
                { label: 'Pessoa Física', value: 'PF' },
                { label: 'Pessoa Jurídica', value: 'PJ' },
              ],
            },
            active: {
              label: 'Status',
              type: 'select',
              options: [
                { label: 'Ativo', value: 'true' },
                { label: 'Inativo', value: 'false' },
              ],
            },
          }}
          onFilterChange={setFilters}
        />
      </div>

      {/* Table */}
      <ResponsiveTable
        columns={[
          {
            key: 'client',
            label: 'Cliente',
            render: (client: Client) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: client.type === 'PF' ? '#f97316' : '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {client.type === 'PF' ? <User size={20} /> : <Building2 size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{client.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {client.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'document',
            label: 'Documento',
            render: (client: Client) => formatDocument(client.type, client.cpf, client.cnpj),
          },
          {
            key: 'contact',
            label: 'Contato',
            render: (client: Client) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {client.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Phone size={14} color="#64748b" />
                    <span style={{ color: '#64748b' }}>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Mail size={14} color="#64748b" />
                    <span style={{ color: '#64748b' }}>{client.email}</span>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'location',
            label: 'Localização',
            render: (client: Client) =>
              client.address_city && client.address_state
                ? `${client.address_city}/${client.address_state}`
                : '-',
          },
          {
            key: 'actions',
            label: 'Ações',
            align: 'center',
            render: (client: Client) => (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClient(client);
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
                    minWidth: '36px',
                    minHeight: '36px',
                  }}
                  title="Ver detalhes"
                >
                  <Eye size={16} color="#3b82f6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(client);
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
                    minWidth: '36px',
                    minHeight: '36px',
                  }}
                  title="Editar"
                >
                  <Edit size={16} color="#64748b" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(client);
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
                    minWidth: '36px',
                    minHeight: '36px',
                  }}
                  title="Excluir"
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>
            ),
          },
        ]}
        data={paginatedClients}
        loading={loading}
        emptyMessage="Nenhum cliente encontrado"
        keyExtractor={(client) => client.id}
      />

      {/* Pagination */}
      {!loading && filteredClients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredClients.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal */}
      <ResponsiveModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PF' | 'PJ' })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                {formData.type === 'PF' ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      CPF *
                    </label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      required
                      maxLength={14}
                      placeholder="000.000.000-00"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: formErrors.cpf ? '1px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                    {formErrors.cpf && (
                      <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                        {formErrors.cpf}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      required
                      maxLength={18}
                      placeholder="00.000.000/0000-00"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: formErrors.cnpj ? '1px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                    {formErrors.cnpj && (
                      <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                        {formErrors.cnpj}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={15}
                    placeholder="(00) 00000-0000"
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
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      const newErrors = { ...formErrors };
                      delete newErrors.email;
                      setFormErrors(newErrors);
                    }
                  }}
                  onBlur={() => {
                    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                      setFormErrors({ ...formErrors, email: 'Email inválido' });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: formErrors.email ? '1px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
                {formErrors.email && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Endereço Completo */}
              <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                  Endereço
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    CEP
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={formData.address_zipcode}
                      onChange={(e) => handleCEPChange(e.target.value)}
                      onBlur={(e) => {
                        const cleanCEP = removeNonNumeric(e.target.value);
                        if (cleanCEP.length > 0 && cleanCEP.length !== 8) {
                          setFormErrors(prev => ({
                            ...prev,
                            address_zipcode: 'CEP deve ter 8 dígitos',
                          }));
                        }
                      }}
                      maxLength={9}
                      placeholder="00000-000"
                      disabled={loadingCEP}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        paddingRight: loadingCEP ? '2.5rem' : '0.75rem',
                        border: formErrors.address_zipcode 
                          ? '1px solid #ef4444' 
                          : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        backgroundColor: loadingCEP ? '#f8fafc' : 'white',
                      }}
                    />
                    {loadingCEP && (
                      <div style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        <Loader2 size={16} className="spinning" color="#64748b" />
                      </div>
                    )}
                  </div>
                  {formErrors.address_zipcode && (
                    <div style={{
                      marginTop: '0.25rem',
                      fontSize: '0.75rem',
                      color: '#ef4444',
                    }}>
                      {formErrors.address_zipcode}
                    </div>
                  )}
                  {formData.address_zipcode && removeNonNumeric(formData.address_zipcode).length === 8 && !loadingCEP && !formErrors.address_zipcode && (
                    <div style={{
                      marginTop: '0.25rem',
                      fontSize: '0.75rem',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      <MapPin size={12} />
                      Endereço preenchido automaticamente
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Rua
                    </label>
                    <input
                      type="text"
                      value={formData.address_street}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
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
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.address_number}
                      onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
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
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.address_complement}
                    onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.address_neighborhood}
                    onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
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
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.address_state}
                      onChange={(e) => setFormData({ ...formData, address_state: e.target.value.toUpperCase() })}
                      maxLength={2}
                      placeholder="RS"
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
              </div>

              {/* Observações */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {editingClient && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                      Cliente ativo
                    </span>
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
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
                  {editingClient ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
      </ResponsiveModal>

      {/* View Client Modal */}
      {viewClient && (
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
            padding: '1rem',
          }}
          onClick={() => setViewClient(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                Detalhes do Cliente
              </h2>
              <button
                onClick={() => {
                  setViewClient(null);
                  setClientStatistics(null);
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            {/* Dashboard/Estatísticas */}
            {clientStatistics && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                  Estatísticas do Cliente
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={18} color="#3b82f6" />
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total de OS</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {clientStatistics.total_orders || 0}
                    </div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <DollarSign size={18} color="#10b981" />
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Valor Total Gasto</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clientStatistics.total_spent || 0)}
                    </div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Shield size={18} color="#f59e0b" />
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Garantias Ativas</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {clientStatistics.active_warranties || 0}
                    </div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Car size={18} color="#64748b" />
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Veículos</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {clientStatistics.total_vehicles || 0}
                    </div>
                  </div>
                </div>

                {clientStatistics.last_visit && (
                  <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="#64748b" />
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Última visita: <strong style={{ color: '#1e293b' }}>{new Date(clientStatistics.last_visit).toLocaleDateString('pt-BR')}</strong>
                    </div>
                  </div>
                )}

                {clientStatistics.pending_receivables && clientStatistics.pending_receivables.count > 0 && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde047', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={16} color="#f59e0b" />
                    <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                      <strong>{clientStatistics.pending_receivables.count}</strong> conta(s) pendente(s) - 
                      Total: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clientStatistics.pending_receivables.amount || 0)}</strong>
                    </div>
                  </div>
                )}

                {clientStatistics.recent_orders && clientStatistics.recent_orders.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                      Últimas Ordens de Serviço
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {clientStatistics.recent_orders.map((order: any) => (
                        <div
                          key={order.id}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                              {order.order_number}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {order.brand} {order.model} {order.plate && `- ${order.plate}`}
                            </div>
                            {order.finished_at && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {new Date(order.finished_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total || 0)}
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor:
                                  order.status === 'finished' ? '#10b98120' :
                                  order.status === 'in_progress' ? '#f59e0b20' :
                                  '#64748b20',
                                color:
                                  order.status === 'finished' ? '#10b981' :
                                  order.status === 'in_progress' ? '#f59e0b' :
                                  '#64748b',
                                fontWeight: '600',
                                display: 'inline-block',
                                marginTop: '0.25rem',
                              }}
                            >
                              {order.status === 'finished' ? 'Finalizada' :
                               order.status === 'in_progress' ? 'Em Andamento' :
                               order.status === 'open' ? 'Aberta' :
                               order.status === 'cancelled' ? 'Cancelada' : order.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {loadingStatistics && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
                Carregando estatísticas...
              </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Informações Básicas */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                  Informações Básicas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Nome</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>{viewClient.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Tipo</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>
                      {viewClient.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      {viewClient.type === 'PF' ? 'CPF' : 'CNPJ'}
                    </p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>
                      {formatDocument(viewClient.type, viewClient.cpf, viewClient.cnpj)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Status</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', color: viewClient.active ? '#10b981' : '#ef4444' }}>
                      {viewClient.active ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contato */}
              {(viewClient.phone || viewClient.email) && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                    Contato
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {viewClient.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={16} color="#64748b" />
                        <p style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                          {viewClient.phone.includes('(') ? viewClient.phone : formatPhone(viewClient.phone)}
                        </p>
                      </div>
                    )}
                    {viewClient.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={16} color="#64748b" />
                        <p style={{ fontSize: '0.9rem', color: '#1e293b' }}>{viewClient.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Endereço Completo */}
              {(viewClient.address_street || viewClient.address_city || viewClient.address_state) && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} />
                    Endereço
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {viewClient.address_street && (
                      <p style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                        {viewClient.address_street}
                        {viewClient.address_number && `, ${viewClient.address_number}`}
                        {viewClient.address_complement && ` - ${viewClient.address_complement}`}
                      </p>
                    )}
                    {viewClient.address_neighborhood && (
                      <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        {viewClient.address_neighborhood}
                      </p>
                    )}
                    {(viewClient.address_city || viewClient.address_state) && (
                      <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        {viewClient.address_city && viewClient.address_state
                          ? `${viewClient.address_city}/${viewClient.address_state}`
                          : viewClient.address_city || viewClient.address_state}
                      </p>
                    )}
                    {viewClient.address_zipcode && (
                      <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        CEP: {formatCEP(viewClient.address_zipcode)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Observações */}
              {viewClient.notes && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                    Observações
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                    {viewClient.notes}
                  </p>
                </div>
              )}

              {/* Veículos */}
              {clientVehicles.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Car size={18} />
                    Veículos ({clientVehicles.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {clientVehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>
                          {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                        </p>
                        {vehicle.plate && (
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Placa: {vehicle.plate}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {clientVehicles.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  Nenhum veículo cadastrado para este cliente
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  handleEdit(viewClient);
                  setViewClient(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Edit size={18} />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o cliente "${deleteConfirm.client?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, client: null })}
      />
    </div>
  );
};

export default Clients;

