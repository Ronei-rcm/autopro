import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Package, Wrench, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface OrderTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  active: boolean;
  items?: OrderTemplateItem[];
}

interface OrderTemplateItem {
  id: number;
  product_id?: number;
  labor_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  item_type: 'product' | 'labor';
  product_name?: string;
  product_code?: string;
  labor_name?: string;
}

interface Product {
  id: number;
  name: string;
  sale_price: number;
  code?: string;
}

interface LaborType {
  id: number;
  name: string;
  price: number;
}

const OrderTemplates = () => {
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [laborTypes, setLaborTypes] = useState<LaborType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OrderTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; template: OrderTemplate | null }>({
    isOpen: false,
    template: null,
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    active: true,
  });
  const [templateItems, setTemplateItems] = useState<Omit<OrderTemplateItem, 'id'>[]>([]);
  const [itemFormData, setItemFormData] = useState({
    item_type: 'product' as 'product' | 'labor',
    product_id: '',
    labor_id: '',
    description: '',
    quantity: '1',
    unit_price: '0',
  });

  useEffect(() => {
    loadTemplates();
    loadProducts();
    loadLaborTypes();
  }, [search]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/order-templates');
      setTemplates(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar templates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadLaborTypes = async () => {
    try {
      const response = await api.get('/labor-types', { params: { active: 'true' } });
      setLaborTypes(response.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de mão de obra:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      active: true,
    });
    setTemplateItems([]);
    setItemFormData({
      item_type: 'product',
      product_id: '',
      labor_id: '',
      description: '',
      quantity: '1',
      unit_price: '0',
    });
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        items: templateItems,
      };

      if (editingTemplate) {
        await api.put(`/order-templates/${editingTemplate.id}`, data);
        toast.success('Template atualizado com sucesso!');
      } else {
        await api.post('/order-templates', data);
        toast.success('Template criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar template');
    }
  };

  const handleEdit = (template: OrderTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category || '',
      active: template.active,
    });
    setTemplateItems(template.items?.map(item => ({
      product_id: item.product_id,
      labor_id: item.labor_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      item_type: item.item_type,
    })) || []);
    setShowModal(true);
  };

  const handleDeleteClick = (template: OrderTemplate) => {
    setDeleteConfirm({ isOpen: true, template });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.template) return;

    try {
      await api.delete(`/order-templates/${deleteConfirm.template.id}`);
      toast.success('Template excluído com sucesso!');
      setDeleteConfirm({ isOpen: false, template: null });
      loadTemplates();
    } catch (error: any) {
      toast.error('Erro ao excluir template');
      setDeleteConfirm({ isOpen: false, template: null });
    }
  };

  const handleAddItem = () => {
    if (!itemFormData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    const quantity = parseFloat(itemFormData.quantity);
    const unitPrice = parseFloat(itemFormData.unit_price);

    if (quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (unitPrice <= 0) {
      toast.error('Preço unitário deve ser maior que zero');
      return;
    }

    const newItem: Omit<OrderTemplateItem, 'id'> = {
      item_type: itemFormData.item_type,
      product_id: itemFormData.item_type === 'product' && itemFormData.product_id ? parseInt(itemFormData.product_id) : undefined,
      labor_id: itemFormData.item_type === 'labor' && itemFormData.labor_id ? parseInt(itemFormData.labor_id) : undefined,
      description: itemFormData.description,
      quantity: quantity,
      unit_price: unitPrice,
    };

    setTemplateItems([...templateItems, newItem]);
    setItemFormData({
      item_type: 'product',
      product_id: '',
      labor_id: '',
      description: '',
      quantity: '1',
      unit_price: '0',
    });
  };

  const handleRemoveItem = (index: number) => {
    setTemplateItems(templateItems.filter((_, i) => i !== index));
  };

  const handleItemTypeChange = (itemType: 'product' | 'labor') => {
    setItemFormData({
      ...itemFormData,
      item_type: itemType,
      product_id: '',
      labor_id: '',
      description: '',
      unit_price: '0',
    });
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setItemFormData({
        ...itemFormData,
        product_id: productId,
        description: product.name,
        unit_price: product.sale_price.toString(),
      });
    }
  };

  const handleLaborSelect = (laborId: string) => {
    const labor = laborTypes.find(l => l.id === parseInt(laborId));
    if (labor) {
      setItemFormData({
        ...itemFormData,
        labor_id: laborId,
        description: labor.name,
        unit_price: labor.price.toString(),
      });
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          template.name.toLowerCase().includes(searchLower) ||
          (template.description && template.description.toLowerCase().includes(searchLower)) ||
          (template.category && template.category.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [templates, search]);

  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(start, start + itemsPerPage);
  }, [filteredTemplates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Templates de OS
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gerencie templates para criar ordens de serviço rapidamente
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
          Novo Template
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
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
            placeholder="Buscar templates..."
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
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <SkeletonLoader type="table" />
        ) : filteredTemplates.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Nenhum template encontrado
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Nome
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Descrição
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Categoria
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Itens
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTemplates.map((template) => (
                <tr
                  key={template.id}
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
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={20} color="#f97316" />
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{template.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {template.description || '-'}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {template.category || '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    {template.items?.length || 0}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        backgroundColor: template.active ? '#10b98120' : '#64748b20',
                        color: template.active ? '#10b981' : '#64748b',
                      }}
                    >
                      {template.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(template)}
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
                        onClick={() => handleDeleteClick(template)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredTemplates.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredTemplates.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o template "${deleteConfirm.template?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, template: null })}
      />

      {/* Modal */}
      {showModal && (
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
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Nome *
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Revisão, Troca de Óleo..."
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
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  Template ativo
                </label>
              </div>

              {/* Adicionar Item */}
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Adicionar Item ao Template</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Tipo
                    </label>
                    <select
                      value={itemFormData.item_type}
                      onChange={(e) => handleItemTypeChange(e.target.value as 'product' | 'labor')}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="product">Produto</option>
                      <option value="labor">Serviço</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {itemFormData.item_type === 'product' ? 'Produto' : 'Serviço'}
                    </label>
                    <select
                      value={itemFormData.item_type === 'product' ? itemFormData.product_id : itemFormData.labor_id}
                      onChange={(e) => {
                        if (itemFormData.item_type === 'product') {
                          handleProductSelect(e.target.value);
                        } else {
                          handleLaborSelect(e.target.value);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="">Selecione...</option>
                      {itemFormData.item_type === 'product'
                        ? products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.code || ''} {product.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.sale_price)}
                            </option>
                          ))
                        : laborTypes.map((labor) => (
                            <option key={labor.id} value={labor.id}>
                              {labor.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(labor.price)}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Descrição *
                    </label>
                    <input
                      type="text"
                      value={itemFormData.description}
                      onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
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
                      Quantidade
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={itemFormData.quantity}
                      onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
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
                      Preço Unitário
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemFormData.unit_price}
                      onChange={(e) => setItemFormData({ ...itemFormData, unit_price: e.target.value })}
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
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
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
                  <Plus size={16} />
                  Adicionar Item
                </button>
              </div>

              {/* Lista de Itens */}
              {templateItems.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Itens do Template ({templateItems.length})
                  </h3>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Tipo
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Descrição
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Qtd
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Preço Unit.
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Total
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {templateItems.map((item, index) => (
                          <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {item.item_type === 'product' ? (
                                  <Package size={16} color="#64748b" />
                                ) : (
                                  <Wrench size={16} color="#64748b" />
                                )}
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                  {item.item_type === 'product' ? 'Produto' : 'Serviço'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                              {item.description}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#64748b' }}>
                              {item.quantity}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#64748b' }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
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
                                title="Remover"
                              >
                                <X size={16} color="#ef4444" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                  {editingTemplate ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTemplates;
