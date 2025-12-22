import { useState, useEffect } from 'react';
import { Wrench, Package, DollarSign, Plus, Edit, Trash2, Building2, Upload, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCNPJ, formatCEP, formatPhone, removeNonNumeric, fetchAddressByCEP } from '../utils/formatters';

interface LaborType {
  id: number;
  name: string;
  description?: string;
  price: number;
  estimated_hours?: number;
  active: boolean;
}

interface WorkshopInfo {
  id: number;
  name: string;
  trade_name?: string | null;
  cnpj?: string | null;
  state_registration?: string | null;
  municipal_registration?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zipcode?: string | null;
  logo_path?: string | null;
  logo_base64?: string | null;
  notes?: string | null;
  terms_and_conditions?: string | null;
  footer_text?: string | null;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'labor' | 'categories' | 'workshop'>('labor');
  const [laborTypes, setLaborTypes] = useState<LaborType[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingLabor, setEditingLabor] = useState<LaborType | null>(null);
  const [categoryType, setCategoryType] = useState<'product' | 'expense'>('product');
  const [laborFormData, setLaborFormData] = useState({
    name: '',
    description: '',
    price: '',
    estimated_hours: '',
    active: true,
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
  });
  const [workshopInfo, setWorkshopInfo] = useState<WorkshopInfo | null>(null);
  const [workshopFormData, setWorkshopFormData] = useState({
    name: '',
    trade_name: '',
    cnpj: '',
    state_registration: '',
    municipal_registration: '',
    phone: '',
    email: '',
    website: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zipcode: '',
    notes: '',
    terms_and_conditions: '',
    footer_text: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [savingWorkshop, setSavingWorkshop] = useState(false);

  useEffect(() => {
    if (activeTab === 'labor') {
      loadLaborTypes();
    } else if (activeTab === 'categories') {
      loadCategories();
    } else if (activeTab === 'workshop') {
      loadWorkshopInfo();
    }
  }, [activeTab]);

  const loadLaborTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/labor-types');
      setLaborTypes(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar tipos de mão de obra');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [productsRes, expensesRes] = await Promise.all([
        api.get('/categories/products'),
        api.get('/categories/expenses'),
      ]);
      setProductCategories(productsRes.data);
      setExpenseCategories(expensesRes.data);
    } catch (error: any) {
      toast.error('Erro ao carregar categorias');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaborSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...laborFormData,
        price: parseFloat(laborFormData.price),
        estimated_hours: laborFormData.estimated_hours ? parseFloat(laborFormData.estimated_hours) : null,
        description: laborFormData.description || null,
      };

      if (editingLabor) {
        await api.put(`/labor-types/${editingLabor.id}`, data);
        toast.success('Tipo de mão de obra atualizado com sucesso!');
      } else {
        await api.post('/labor-types', data);
        toast.success('Tipo de mão de obra criado com sucesso!');
      }
      setShowLaborModal(false);
      resetLaborForm();
      loadLaborTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar tipo de mão de obra');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = categoryType === 'product' ? '/categories/products' : '/categories/expenses';
      await api.post(endpoint, categoryFormData);
      toast.success('Categoria criada com sucesso!');
      setShowCategoryModal(false);
      setCategoryFormData({ name: '' });
      loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar categoria');
    }
  };

  const handleDeleteLabor = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de mão de obra?')) return;

    try {
      await api.delete(`/labor-types/${id}`);
      toast.success('Tipo de mão de obra excluído com sucesso!');
      loadLaborTypes();
    } catch (error: any) {
      toast.error('Erro ao excluir tipo de mão de obra');
    }
  };

  const handleDeleteCategory = async (name: string, type: 'product' | 'expense') => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os produtos/contas com esta categoria terão a categoria removida.')) return;

    try {
      const endpoint = type === 'product' ? `/categories/products/${encodeURIComponent(name)}` : `/categories/expenses/${encodeURIComponent(name)}`;
      await api.delete(endpoint);
      toast.success('Categoria excluída com sucesso!');
      loadCategories();
    } catch (error: any) {
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleEditLabor = (labor: LaborType) => {
    setEditingLabor(labor);
    setLaborFormData({
      name: labor.name,
      description: labor.description || '',
      price: labor.price.toString(),
      estimated_hours: labor.estimated_hours?.toString() || '',
      active: labor.active,
    });
    setShowLaborModal(true);
  };

  const resetLaborForm = () => {
    setLaborFormData({
      name: '',
      description: '',
      price: '',
      estimated_hours: '',
      active: true,
    });
    setEditingLabor(null);
  };

  const loadWorkshopInfo = async () => {
    try {
      const response = await api.get('/workshop-info');
      const info = response.data;
      setWorkshopInfo(info);
      setWorkshopFormData({
        name: info.name || '',
        trade_name: info.trade_name || '',
        cnpj: info.cnpj || '',
        state_registration: info.state_registration || '',
        municipal_registration: info.municipal_registration || '',
        phone: info.phone || '',
        email: info.email || '',
        website: info.website || '',
        address_street: info.address_street || '',
        address_number: info.address_number || '',
        address_complement: info.address_complement || '',
        address_neighborhood: info.address_neighborhood || '',
        address_city: info.address_city || '',
        address_state: info.address_state || '',
        address_zipcode: info.address_zipcode || '',
        notes: info.notes || '',
        terms_and_conditions: info.terms_and_conditions || '',
        footer_text: info.footer_text || '',
      });
      if (info.logo_base64) {
        setLogoPreview(info.logo_base64);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar informações da oficina');
      console.error(error);
    }
  };

  const handleWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingWorkshop(true);
      const data = {
        ...workshopFormData,
        cnpj: workshopFormData.cnpj ? removeNonNumeric(workshopFormData.cnpj) : null,
        address_zipcode: workshopFormData.address_zipcode ? removeNonNumeric(workshopFormData.address_zipcode) : null,
        logo_base64: logoPreview,
      };
      await api.put('/workshop-info', data);
      toast.success('Informações da oficina atualizadas com sucesso!');
      loadWorkshopInfo();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar informações da oficina');
    } finally {
      setSavingWorkshop(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
  };

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value);
    setWorkshopFormData({ ...workshopFormData, address_zipcode: formatted });

    const cleanCEP = removeNonNumeric(value);
    if (cleanCEP.length === 8) {
      setLoadingCEP(true);
      try {
        const addressData = await fetchAddressByCEP(formatted);
        if (addressData) {
          setWorkshopFormData((prev) => ({
            ...prev,
            address_zipcode: formatted,
            address_street: addressData.logradouro || prev.address_street,
            address_neighborhood: addressData.bairro || prev.address_neighborhood,
            address_city: addressData.localidade || prev.address_city,
            address_state: addressData.uf || prev.address_state,
          }));
          toast.success('Endereço preenchido automaticamente!');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP. Tente novamente.');
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          Configurações
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('labor')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'labor' ? '2px solid #f97316' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'labor' ? '600' : '400',
            color: activeTab === 'labor' ? '#f97316' : '#64748b',
          }}
        >
          <Wrench size={18} />
          Tipos de Mão de Obra
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'categories' ? '2px solid #f97316' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'categories' ? '600' : '400',
            color: activeTab === 'categories' ? '#f97316' : '#64748b',
          }}
        >
          <Package size={18} />
          Categorias
        </button>
        <button
          onClick={() => setActiveTab('workshop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'workshop' ? '2px solid #f97316' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'workshop' ? '600' : '400',
            color: activeTab === 'workshop' ? '#f97316' : '#64748b',
          }}
        >
          <Building2 size={18} />
          Informações da Oficina
        </button>
      </div>

      {/* Tipos de Mão de Obra Tab */}
      {activeTab === 'labor' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => {
                resetLaborForm();
                setShowLaborModal(true);
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
              Novo Tipo de Mão de Obra
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando...</div>
            ) : laborTypes.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Nenhum tipo de mão de obra cadastrado</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Nome</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Descrição</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Preço</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Horas Est.</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {laborTypes.map((labor) => (
                    <tr
                      key={labor.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{labor.name}</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>{labor.description || '-'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(labor.price)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>{labor.estimated_hours ? `${labor.estimated_hours}h` : '-'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: labor.active ? '#10b98220' : '#64748b20',
                            color: labor.active ? '#10b981' : '#64748b',
                          }}
                        >
                          {labor.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditLabor(labor)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#f1f5f9',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                            title="Editar"
                          >
                            <Edit size={16} color="#64748b" />
                          </button>
                          <button
                            onClick={() => handleDeleteLabor(labor.id)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#fee2e2',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                            title="Excluir"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Categorias Tab */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ flex: 1, marginRight: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={18} color="#3b82f6" />
                  Categorias de Produtos
                </h3>
                <button
                  onClick={() => {
                    setCategoryType('product');
                    setCategoryFormData({ name: '' });
                    setShowCategoryModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  <Plus size={16} />
                  Nova Categoria
                </button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Carregando...</div>
                ) : productCategories.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Nenhuma categoria cadastrada</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {productCategories.map((category) => (
                      <div
                        key={category}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{category}</span>
                        <button
                          onClick={() => handleDeleteCategory(category, 'product')}
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Excluir"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, marginLeft: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="#10b981" />
                  Categorias de Despesas
                </h3>
                <button
                  onClick={() => {
                    setCategoryType('expense');
                    setCategoryFormData({ name: '' });
                    setShowCategoryModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  <Plus size={16} />
                  Nova Categoria
                </button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Carregando...</div>
                ) : expenseCategories.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Nenhuma categoria cadastrada</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {expenseCategories.map((category) => (
                      <div
                        key={category}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{category}</span>
                        <button
                          onClick={() => handleDeleteCategory(category, 'expense')}
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Excluir"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informações da Oficina Tab */}
      {activeTab === 'workshop' && (
        <div>
          <form onSubmit={handleWorkshopSubmit}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="#f97316" />
                Dados da Oficina
              </h3>

              {/* Logo */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '2px dashed #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Logo da Oficina
                </label>
                {logoPreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={logoPreview}
                      alt="Logo da oficina"
                      style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        padding: '0.25rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f97316';
                      e.currentTarget.style.backgroundColor = '#fff7ed';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <Upload size={32} color="#64748b" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>
                      Clique para fazer upload do logo
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      PNG, JPG ou SVG (máx. 2MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {/* Dados Básicos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Nome da Oficina *
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.name}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, name: e.target.value })}
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
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.trade_name}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, trade_name: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.cnpj}
                    onChange={(e) => {
                      const formatted = formatCNPJ(e.target.value);
                      setWorkshopFormData({ ...workshopFormData, cnpj: formatted });
                    }}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
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
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.state_registration}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, state_registration: e.target.value })}
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
                    Inscrição Municipal
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.municipal_registration}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, municipal_registration: e.target.value })}
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

              {/* Contato */}
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem' }}>Contato</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.phone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setWorkshopFormData({ ...workshopFormData, phone: formatted });
                    }}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={workshopFormData.email}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, email: e.target.value })}
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
                    Website
                  </label>
                  <input
                    type="url"
                    value={workshopFormData.website}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, website: e.target.value })}
                    placeholder="https://www.exemplo.com.br"
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

              {/* Endereço */}
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem' }}>Endereço</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  CEP
                </label>
                <input
                  type="text"
                  value={workshopFormData.address_zipcode}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={loadingCEP}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: loadingCEP ? '#f8fafc' : 'white',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Rua
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.address_street}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, address_street: e.target.value })}
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
                    value={workshopFormData.address_number}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, address_number: e.target.value })}
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
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.address_complement}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, address_complement: e.target.value })}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.address_neighborhood}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, address_neighborhood: e.target.value })}
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
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={workshopFormData.address_city}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, address_city: e.target.value })}
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
                    value={workshopFormData.address_state}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, address_state: e.target.value.toUpperCase() })}
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

              {/* Textos para Documentos */}
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem' }}>Textos para Documentos</h4>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Texto do Rodapé
                </label>
                <textarea
                  value={workshopFormData.footer_text}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, footer_text: e.target.value })}
                  rows={3}
                  placeholder="Este documento foi gerado automaticamente pelo sistema de gestão."
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Termos e Condições Padrão
                </label>
                <textarea
                  value={workshopFormData.terms_and_conditions}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, terms_and_conditions: e.target.value })}
                  rows={5}
                  placeholder="Termos e condições que aparecerão nos documentos..."
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Observações Gerais
                </label>
                <textarea
                  value={workshopFormData.notes}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, notes: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={savingWorkshop}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: savingWorkshop ? '#cbd5e1' : '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: savingWorkshop ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                  }}
                >
                  {savingWorkshop ? 'Salvando...' : 'Salvar Informações'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tipo de Mão de Obra */}
      {showLaborModal && (
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
            setShowLaborModal(false);
            resetLaborForm();
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingLabor ? 'Editar Tipo de Mão de Obra' : 'Novo Tipo de Mão de Obra'}
            </h2>
            <form onSubmit={handleLaborSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={laborFormData.name}
                  onChange={(e) => setLaborFormData({ ...laborFormData, name: e.target.value })}
                  required
                  placeholder="Ex: Troca de óleo, Revisão completa..."
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
                  Descrição
                </label>
                <textarea
                  value={laborFormData.description}
                  onChange={(e) => setLaborFormData({ ...laborFormData, description: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Preço *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={laborFormData.price}
                    onChange={(e) => setLaborFormData({ ...laborFormData, price: e.target.value })}
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
                    Horas Estimadas
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={laborFormData.estimated_hours}
                    onChange={(e) => setLaborFormData({ ...laborFormData, estimated_hours: e.target.value })}
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={laborFormData.active}
                    onChange={(e) => setLaborFormData({ ...laborFormData, active: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Ativo</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowLaborModal(false);
                    resetLaborForm();
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
                  {editingLabor ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categoria */}
      {showCategoryModal && (
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
            setShowCategoryModal(false);
            setCategoryFormData({ name: '' });
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Nova Categoria de {categoryType === 'product' ? 'Produtos' : 'Despesas'}
            </h2>
            <form onSubmit={handleCategorySubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ name: e.target.value })}
                  required
                  placeholder="Ex: Peças, Óleos, Manutenção..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryFormData({ name: '' });
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
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

