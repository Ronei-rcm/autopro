import { useState, useEffect } from 'react';
import { Wrench, Package, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface LaborType {
  id: number;
  name: string;
  description?: string;
  price: number;
  estimated_hours?: number;
  active: boolean;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'labor' | 'categories'>('labor');
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

  useEffect(() => {
    if (activeTab === 'labor') {
      loadLaborTypes();
    } else {
      loadCategories();
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

