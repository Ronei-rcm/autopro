import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, PackageCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/common/SkeletonLoader';

interface Product {
  id: number;
  code?: string;
  name: string;
  description?: string;
  category?: string;
  supplier_id?: number;
  supplier_name?: string;
  cost_price: number;
  sale_price: number;
  min_quantity: number;
  current_quantity: number;
  unit: string;
  active: boolean;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    supplier_id: '',
    cost_price: '0',
    sale_price: '0',
    min_quantity: '0',
    current_quantity: '0',
    unit: 'UN',
    active: true,
  });
  const [stockFormData, setStockFormData] = useState({
    quantity: '',
    type: 'adjustment' as 'entry' | 'exit' | 'adjustment',
    notes: '',
  });

  useEffect(() => {
    loadProducts();
    loadSuppliers();
    loadCategories();
  }, [search, selectedCategory, showLowStock]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (showLowStock) params.low_stock = 'true';

      const response = await api.get('/products', { params });
      setProducts(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos');
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

  const loadCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        code: formData.code || null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        cost_price: parseFloat(formData.cost_price),
        sale_price: parseFloat(formData.sale_price),
        min_quantity: parseInt(formData.min_quantity) || 0,
        current_quantity: parseInt(formData.current_quantity) || 0,
        category: formData.category || null,
        description: formData.description || null,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', data);
        toast.success('Produto criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadProducts();
      loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  const handleStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await api.post(`/products/${selectedProduct.id}/adjust-stock`, {
        quantity: parseFloat(stockFormData.quantity),
        type: stockFormData.type,
        notes: stockFormData.notes,
      });
      toast.success('Estoque ajustado com sucesso!');
      setShowStockModal(false);
      setStockFormData({ quantity: '', type: 'adjustment', notes: '' });
      setSelectedProduct(null);
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao ajustar estoque');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code || '',
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      supplier_id: product.supplier_id?.toString() || '',
      cost_price: product.cost_price.toString(),
      sale_price: product.sale_price.toString(),
      min_quantity: product.min_quantity.toString(),
      current_quantity: product.current_quantity.toString(),
      unit: product.unit,
      active: product.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Produto excluído com sucesso!');
      loadProducts();
    } catch (error: any) {
      toast.error('Erro ao excluir produto');
    }
  };

  const handleStockMovement = (product: Product) => {
    setSelectedProduct(product);
    setStockFormData({
      quantity: '',
      type: 'adjustment',
      notes: '',
    });
    setShowStockModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category: '',
      supplier_id: '',
      cost_price: '0',
      sale_price: '0',
      min_quantity: '0',
      current_quantity: '0',
      unit: 'UN',
      active: true,
    });
    setEditingProduct(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStockStatus = (product: Product) => {
    if (product.current_quantity <= 0) {
      return { color: '#ef4444', text: 'Sem estoque', icon: AlertTriangle };
    }
    if (product.current_quantity <= product.min_quantity) {
      return { color: '#f59e0b', text: 'Estoque baixo', icon: AlertTriangle };
    }
    return { color: '#10b981', text: 'Normal', icon: PackageCheck };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Estoque
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Controle de produtos e peças
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
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
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
            placeholder="Buscar por nome, código ou descrição..."
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
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: showLowStock ? '#fee2e2' : '#f1f5f9',
            color: showLowStock ? '#ef4444' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          <AlertTriangle size={18} />
          Estoque Baixo
        </button>
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
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Nenhum produto encontrado
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Produto
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Categoria
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Fornecedor
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Estoque
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Preços
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status = getStockStatus(product);
                const StatusIcon = status.icon;
                return (
                  <tr
                    key={product.id}
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
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#f97316',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Package size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{product.name}</div>
                          {product.code && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Código: {product.code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                      {product.category || '-'}
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                      {product.supplier_name || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {product.current_quantity} {product.unit}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: status.color }}>
                          <StatusIcon size={12} />
                          {status.text}
                        </div>
                        {product.min_quantity > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Mín: {product.min_quantity}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', fontSize: '0.875rem' }}>
                        <div style={{ color: '#64748b' }}>
                          Custo: {formatCurrency(product.cost_price)}
                        </div>
                        <div style={{ fontWeight: '600', color: '#10b981' }}>
                          Venda: {formatCurrency(product.sale_price)}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleStockMovement(product)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#f0fdf4',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Ajustar estoque"
                        >
                          <TrendingUp size={16} color="#10b981" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
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
                          onClick={() => handleDelete(product.id)}
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Produto */}
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Código interno"
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Peças, Óleos, Filtros"
                    list="categories"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Fornecedor
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
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
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Preço de Custo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
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
                    Preço de Venda *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
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
                    Qtd. Mínima
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
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
                    Unidade
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="UN">UN - Unidade</option>
                    <option value="KG">KG - Quilograma</option>
                    <option value="L">L - Litro</option>
                    <option value="M">M - Metro</option>
                    <option value="CX">CX - Caixa</option>
                  </select>
                </div>
              </div>

              {!editingProduct && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Quantidade Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
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
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajuste de Estoque */}
      {showStockModal && selectedProduct && (
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
            zIndex: 1001,
          }}
          onClick={() => {
            setShowStockModal(false);
            setSelectedProduct(null);
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
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Ajustar Estoque
            </h2>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Produto</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{selectedProduct.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                Estoque atual: <strong>{selectedProduct.current_quantity} {selectedProduct.unit}</strong>
              </div>
            </div>
            <form onSubmit={handleStockAdjust}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Tipo de Movimentação *
                </label>
                <select
                  value={stockFormData.type}
                  onChange={(e) => setStockFormData({ ...stockFormData, type: e.target.value as any })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="entry">Entrada (Adicionar)</option>
                  <option value="exit">Saída (Remover)</option>
                  <option value="adjustment">Ajuste (Definir quantidade)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Quantidade *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={stockFormData.quantity}
                  onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                  required
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
                {stockFormData.type === 'entry' && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#10b981' }}>
                    Novo estoque: {selectedProduct.current_quantity + parseFloat(stockFormData.quantity || '0')} {selectedProduct.unit}
                  </div>
                )}
                {stockFormData.type === 'exit' && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#f59e0b' }}>
                    Novo estoque: {Math.max(0, selectedProduct.current_quantity - parseFloat(stockFormData.quantity || '0'))} {selectedProduct.unit}
                  </div>
                )}
                {stockFormData.type === 'adjustment' && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    Estoque será definido como: {stockFormData.quantity || '0'} {selectedProduct.unit}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Observações
                </label>
                <textarea
                  value={stockFormData.notes}
                  onChange={(e) => setStockFormData({ ...stockFormData, notes: e.target.value })}
                  rows={3}
                  placeholder="Motivo da movimentação..."
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
                    setShowStockModal(false);
                    setSelectedProduct(null);
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
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

