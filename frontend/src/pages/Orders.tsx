import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Car, Wrench, Package, DollarSign, X, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import SkeletonLoader from '../components/common/SkeletonLoader';
import AdvancedFilters from '../components/common/AdvancedFilters';
import Pagination from '../components/common/Pagination';

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

interface Client {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate?: string;
  client_id: number;
}

interface Product {
  id: number;
  name: string;
  sale_price: number;
  current_quantity: number;
  unit: string;
}

interface LaborType {
  id: number;
  name: string;
  price: number;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [laborTypes, setLaborTypes] = useState<LaborType[]>([]);
  const [orderTemplates, setOrderTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    mechanic_id: '',
    status: 'open',
    discount: '0',
    technical_notes: '',
    template_id: '',
  });
  const [itemFormData, setItemFormData] = useState({
    item_type: 'product' as 'product' | 'labor',
    product_id: '',
    labor_id: '',
    description: '',
    quantity: '1',
    unit_price: '0',
  });
  const [itemTotal, setItemTotal] = useState(0);

  useEffect(() => {
    loadOrders();
    loadClients();
    loadProducts();
    loadLaborTypes();
    loadOrderTemplates();
    loadStatistics();
  }, [search, selectedStatus, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search, selectedStatus]);

  const loadStatistics = async () => {
    try {
      const response = await api.get('/orders/statistics/overview');
      setStatistics(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.get('/orders', { params });
      setOrders(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar ordens de serviço');
      console.error(error);
    } finally {
      setLoading(false);
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

  const loadVehicles = async (clientId?: number) => {
    try {
      const params = clientId ? { client_id: clientId } : {};
      const response = await api.get('/vehicles', { params });
      setVehicles(response.data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      // Carregar todos os produtos, não filtrar aqui (mostraremos todos com avisos para sem estoque)
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

  const loadOrderTemplates = async () => {
    try {
      const response = await api.get('/order-templates?active_only=true');
      setOrderTemplates(response.data);
    } catch (error) {
      console.error('Erro ao carregar templates de OS:', error);
    }
  };

  const loadOrderItems = async (orderId: number) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrderItems(response.data.items || []);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        client_id: parseInt(formData.client_id),
        vehicle_id: parseInt(formData.vehicle_id),
        mechanic_id: formData.mechanic_id ? parseInt(formData.mechanic_id) : null,
        discount: parseFloat(formData.discount) || 0,
        status: formData.status,
        technical_notes: formData.technical_notes,
      };

      // Adicionar template_id apenas se estiver criando nova OS e template foi selecionado
      if (!editingOrder && formData.template_id) {
        data.template_id = parseInt(formData.template_id);
      }

      if (editingOrder) {
        await api.put(`/orders/${editingOrder.id}`, data);
        toast.success('Ordem de serviço atualizada com sucesso!');
      } else {
        await api.post('/orders', data);
        toast.success('Ordem de serviço criada com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadOrders();
      loadStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar ordem de serviço');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    // Validações
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

    try {
      const data = {
        ...itemFormData,
        product_id: itemFormData.item_type === 'product' && itemFormData.product_id ? parseInt(itemFormData.product_id) : null,
        labor_id: itemFormData.item_type === 'labor' && itemFormData.labor_id ? parseInt(itemFormData.labor_id) : null,
        quantity: quantity,
        unit_price: unitPrice,
      };

      await api.post(`/orders/${currentOrder.id}/items`, data);
      toast.success('Item adicionado com sucesso!');
      resetItemForm();
      await loadOrderItems(currentOrder.id);
      // Recarregar ordem atualizada
      const orderResponse = await api.get(`/orders/${currentOrder.id}`);
      setCurrentOrder(orderResponse.data);
      loadOrders();
      loadProducts(); // Recarregar produtos para atualizar estoque
      loadStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar item');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !editingItem) return;

    // Validações
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

    try {
      const data = {
        description: itemFormData.description,
        quantity: quantity,
        unit_price: unitPrice,
      };

      await api.put(`/orders/${currentOrder.id}/items/${editingItem.id}`, data);
      toast.success('Item atualizado com sucesso!');
      resetItemForm();
      await loadOrderItems(currentOrder.id);
      // Recarregar ordem atualizada
      const orderResponse = await api.get(`/orders/${currentOrder.id}`);
      setCurrentOrder(orderResponse.data);
      loadOrders();
      loadProducts(); // Recarregar produtos para atualizar estoque
      loadStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar item');
    }
  };

  const handleSubmitItem = editingItem ? handleUpdateItem : handleAddItem;

  const handleRemoveItem = async (itemId: number) => {
    if (!currentOrder) return;
    
    const item = orderItems.find(i => i.id === itemId);
    if (!item) return;

    if (!confirm(`Tem certeza que deseja remover "${item.description}" da OS?`)) return;

    try {
      await api.delete(`/orders/${currentOrder.id}/items/${itemId}`);
      toast.success('Item removido com sucesso!');
      await loadOrderItems(currentOrder.id);
      // Recarregar ordem atualizada
      const orderResponse = await api.get(`/orders/${currentOrder.id}`);
      setCurrentOrder(orderResponse.data);
      loadOrders();
      loadProducts();
      loadStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover item');
    }
  };

  const handleEdit = async (order: Order) => {
    setEditingOrder(order);
    setFormData({
      client_id: order.client_id.toString(),
      vehicle_id: order.vehicle_id.toString(),
      mechanic_id: order.mechanic_id?.toString() || '',
      status: order.status,
      discount: order.discount.toString(),
      technical_notes: order.technical_notes || '',
      template_id: '', // Templates não são editáveis em OS existentes
    });
    loadVehicles(order.client_id);
    setShowModal(true);
  };

  const handleViewItems = async (order: Order) => {
    setCurrentOrder(order);
    await loadOrderItems(order.id);
    setShowItemModal(true);
  };

  const handleViewDetail = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) return;

    try {
      await api.delete(`/orders/${id}`);
      toast.success('Ordem de serviço excluída com sucesso!');
      loadOrders();
      loadStatistics();
    } catch (error: any) {
      toast.error('Erro ao excluir ordem de serviço');
    }
  };

  const handleUpdateDiscount = async (orderId: number, discount: number) => {
    try {
      await api.put(`/orders/${orderId}/discount`, { discount });
      loadOrders();
      if (currentOrder?.id === orderId) {
        loadOrderItems(orderId);
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar desconto');
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      vehicle_id: '',
      mechanic_id: '',
      status: 'open',
      discount: '0',
      technical_notes: '',
      template_id: '',
    });
    setEditingOrder(null);
    setVehicles([]);
  };

  const resetItemForm = () => {
    setItemFormData({
      item_type: 'product',
      product_id: '',
      labor_id: '',
      description: '',
      quantity: '1',
      unit_price: '0',
    });
    setItemTotal(0);
    setEditingItem(null);
  };

  const handleEditItem = (item: OrderItem) => {
    setEditingItem(item);
    setItemFormData({
      item_type: item.item_type,
      product_id: item.product_id?.toString() || '',
      labor_id: item.labor_id?.toString() || '',
      description: item.description,
      quantity: item.quantity.toString(),
      unit_price: item.unit_price.toString(),
    });
    setItemTotal(item.total_price);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderProductWarning = useMemo(() => {
    if (!itemFormData.product_id) return null;
    const selectedProduct = products.find(p => p.id === parseInt(itemFormData.product_id));
    if (selectedProduct && selectedProduct.current_quantity <= 0) {
      return (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.75rem', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#991b1b',
        }}>
          <AlertCircle size={16} />
          Este produto está sem estoque
        </div>
      );
    }
    if (selectedProduct && parseFloat(itemFormData.quantity) > selectedProduct.current_quantity) {
      return (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.75rem', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fde047',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#92400e',
        }}>
          <AlertCircle size={16} />
          Quantidade solicitada ({itemFormData.quantity}) excede estoque disponível ({selectedProduct.current_quantity} {selectedProduct.unit})
        </div>
      );
    }
    return null;
  }, [itemFormData.product_id, itemFormData.quantity, products]);

  // Filtrar e paginar ordens
  const filteredOrders = useMemo(() => {
    return orders.filter(() => {
      // Filtros locais podem ser adicionados aqui
      return true;
    });
  }, [orders, filters]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === parseInt(productId));
    if (product) {
      const price = product.sale_price.toString();
      const quantity = parseFloat(itemFormData.quantity) || 1;
      const total = product.sale_price * quantity;
      setItemFormData({
        ...itemFormData,
        product_id: productId,
        description: product.name,
        unit_price: price,
      });
      setItemTotal(total);
    } else {
      setItemFormData({
        ...itemFormData,
        product_id: productId,
        description: '',
        unit_price: '0',
      });
      setItemTotal(0);
    }
  };

  const handleLaborSelect = (laborId: string) => {
    const labor = laborTypes.find((l) => l.id === parseInt(laborId));
    if (labor) {
      const price = labor.price.toString();
      const quantity = parseFloat(itemFormData.quantity) || 1;
      const total = labor.price * quantity;
      setItemFormData({
        ...itemFormData,
        labor_id: laborId,
        description: labor.name,
        unit_price: price,
      });
      setItemTotal(total);
    } else {
      setItemFormData({
        ...itemFormData,
        labor_id: laborId,
        description: '',
        unit_price: '0',
      });
      setItemTotal(0);
    }
  };

  // Calcular total quando quantidade ou preço mudar
  useEffect(() => {
    const quantity = parseFloat(itemFormData.quantity) || 0;
    const unitPrice = parseFloat(itemFormData.unit_price) || 0;
    setItemTotal(quantity * unitPrice);
  }, [itemFormData.quantity, itemFormData.unit_price]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
              Ordens de Serviço
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Gerencie as ordens de serviço da oficina
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
          Nova OS
        </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#3b82f620', borderRadius: '8px' }}>
                  <FileText size={20} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total de OS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {statistics.total}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#10b98220', borderRadius: '8px' }}>
                  <CheckCircle size={20} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Finalizadas</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {statistics.byStatus?.finished || 0}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f59e0b20', borderRadius: '8px' }}>
                  <Clock size={20} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Em Andamento</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {(statistics.byStatus?.in_progress || 0) + (statistics.byStatus?.waiting_parts || 0) + (statistics.byStatus?.open || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#10b98220', borderRadius: '8px' }}>
                  <DollarSign size={20} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Finalizado</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {formatCurrency(statistics.values?.finished || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
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
              placeholder="Buscar por número, cliente ou placa..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="">Todos os status</option>
            <option value="open">Aberta</option>
            <option value="in_progress">Em Andamento</option>
            <option value="waiting_parts">Aguardando Peças</option>
            <option value="finished">Finalizada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={{
            client_id: {
              label: 'Cliente',
              type: 'select',
              options: clients.map(c => ({ label: c.name, value: c.id.toString() })),
            },
            date_from: {
              label: 'Data Inicial',
              type: 'date',
            },
            date_to: {
              label: 'Data Final',
              type: 'date',
            },
          }}
          onFilterChange={setFilters}
        />
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
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Nenhuma ordem de serviço encontrada
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Número
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Cliente / Veículo
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Mecânico
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Total
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
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
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{order.order_number}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                        {order.client_name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Car size={14} />
                        {order.brand} {order.model} {order.plate && `- ${order.plate}`}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {order.mechanic_name || '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
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
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>
                    {formatCurrency(order.total)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleViewDetail(order.id)}
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
                        title="Ver Detalhes"
                      >
                        <Eye size={16} color="#3b82f6" />
                      </button>
                      <button
                        onClick={() => handleViewItems(order)}
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
                        title="Ver/Adicionar Itens"
                      >
                        <Package size={16} color="#10b981" />
                      </button>
                      <button
                        onClick={() => handleEdit(order)}
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
                        onClick={() => handleDelete(order.id)}
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

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Modal OS */}
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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Template Selection - apenas ao criar nova OS */}
              {!editingOrder && orderTemplates.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
                    Aplicar Template (Opcional)
                  </label>
                  <select
                    value={formData.template_id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #93c5fd',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">Nenhum template</option>
                    {orderTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} {template.description && `- ${template.description}`} ({template.items?.length || 0} itens)
                      </option>
                    ))}
                  </select>
                  {formData.template_id && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#1e40af' }}>
                      <strong>Os itens do template serão adicionados automaticamente após criar a OS.</strong>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Cliente *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => {
                    setFormData({ ...formData, client_id: e.target.value, vehicle_id: '' });
                    if (e.target.value) {
                      loadVehicles(parseInt(e.target.value));
                    }
                  }}
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
                  Veículo *
                </label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  required
                  disabled={!formData.client_id}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    opacity: formData.client_id ? 1 : 0.6,
                  }}
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.plate && `- ${vehicle.plate}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="open">Aberta</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="waiting_parts">Aguardando Peças</option>
                    <option value="finished">Finalizada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
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
                  Observações Técnicas
                </label>
                <textarea
                  value={formData.technical_notes}
                  onChange={(e) => setFormData({ ...formData, technical_notes: e.target.value })}
                  rows={4}
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
                  {editingOrder ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Itens */}
      {showItemModal && currentOrder && (
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
            setShowItemModal(false);
            setCurrentOrder(null);
            setOrderItems([]);
            resetItemForm();
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Itens da OS: {currentOrder.order_number}
                </h2>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {currentOrder.client_name} - {currentOrder.brand} {currentOrder.model}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setCurrentOrder(null);
                  setOrderItems([]);
                }}
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

            {/* Formulário de Item */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                  {editingItem ? 'Editar Item' : 'Adicionar Item'}
                </h3>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  Total: {formatCurrency(itemTotal)}
                </div>
              </div>
              <form onSubmit={handleSubmitItem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Tipo *
                    </label>
                    <select
                      value={itemFormData.item_type}
                      onChange={(e) => {
                        setItemFormData({
                          ...itemFormData,
                          item_type: e.target.value as any,
                          product_id: '',
                          labor_id: '',
                          description: '',
                          unit_price: '0',
                          quantity: '1',
                        });
                        setItemTotal(0);
                      }}
                      required
                      disabled={!!editingItem}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        backgroundColor: editingItem ? '#f8fafc' : 'white',
                      }}
                    >
                      <option value="product">Produto</option>
                      <option value="labor">Mão de Obra</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {itemFormData.item_type === 'product' ? 'Produto *' : 'Mão de Obra *'}
                    </label>
                    {itemFormData.item_type === 'product' ? (
                      <>
                        <select
                          value={itemFormData.product_id}
                          onChange={(e) => handleProductSelect(e.target.value)}
                          required
                          disabled={!!editingItem}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            backgroundColor: editingItem ? '#f8fafc' : 'white',
                          }}
                        >
                          <option value="">Selecione um produto</option>
                          {products.filter(p => p.current_quantity > 0).map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - Estoque: {product.current_quantity} {product.unit} - {formatCurrency(product.sale_price)}
                            </option>
                          ))}
                          {products.filter(p => p.current_quantity <= 0).length > 0 && (
                            <optgroup label="⚠️ Produtos sem estoque" style={{ color: '#ef4444', fontStyle: 'italic' }}>
                              {products.filter(p => p.current_quantity <= 0).map((product) => (
                                <option key={product.id} value={product.id} disabled style={{ color: '#ef4444' }}>
                                  {product.name} - Sem estoque - {formatCurrency(product.sale_price)}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        {renderProductWarning}
                      </>
                    ) : (
                      <select
                        value={itemFormData.labor_id}
                        onChange={(e) => handleLaborSelect(e.target.value)}
                        required
                        disabled={!!editingItem}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          backgroundColor: editingItem ? '#f8fafc' : 'white',
                        }}
                      >
                        <option value="">Selecione um serviço</option>
                        {laborTypes.map((labor) => (
                          <option key={labor.id} value={labor.id}>
                            {labor.name} - {formatCurrency(labor.price)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={itemFormData.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        setItemFormData({ ...itemFormData, quantity: value });
                      }}
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
                      Preço Unit. *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemFormData.unit_price}
                      onChange={(e) => {
                        const value = e.target.value;
                        setItemFormData({ ...itemFormData, unit_price: value });
                      }}
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
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                      Total do Item
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                      textAlign: 'center',
                    }}>
                      {formatCurrency(itemTotal)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={!itemFormData.description || itemTotal <= 0}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: (!itemFormData.description || itemTotal <= 0) ? '#cbd5e1' : (editingItem ? '#3b82f6' : '#10b981'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (!itemFormData.description || itemTotal <= 0) ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {editingItem ? 'Salvar Alterações' : 'Adicionar'}
                    </button>
                    {editingItem && (
                      <button
                        type="button"
                        onClick={() => resetItemForm()}
                        style={{
                          width: '100%',
                          marginTop: '0.5rem',
                          padding: '0.75rem',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Lista de Itens */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Itens Adicionados</h3>
                <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                  {orderItems.length} {orderItems.length === 1 ? 'item' : 'itens'}
                </div>
              </div>
              {orderItems.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  Nenhum item adicionado. Use o formulário acima para adicionar produtos ou serviços.
                </div>
              ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
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
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', width: '80px' }}>
                          Ação
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, index) => (
                        <tr 
                          key={item.id} 
                          style={{ 
                            borderBottom: index < orderItems.length - 1 ? '1px solid #e2e8f0' : 'none',
                            backgroundColor: 'white',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                        >
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {item.item_type === 'product' ? (
                                <Package size={16} color="#3b82f6" />
                              ) : (
                                <Wrench size={16} color="#f97316" />
                              )}
                              <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.description}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>
                            {item.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>
                            {formatCurrency(item.total_price)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditItem(item)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#dbeafe',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#bfdbfe';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#dbeafe';
                                }}
                                title="Editar item"
                              >
                                <Edit size={16} color="#3b82f6" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#fee2e2',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fecaca';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fee2e2';
                                }}
                                title="Remover item"
                              >
                                <Trash2 size={16} color="#ef4444" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totais */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                Resumo Financeiro
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Subtotal ({orderItems.length} {orderItems.length === 1 ? 'item' : 'itens'}):</span>
                <span style={{ fontWeight: '600', fontSize: '1rem', color: '#1e293b' }}>{formatCurrency(currentOrder.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Desconto:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentOrder.discount}
                    onChange={(e) => handleUpdateDiscount(currentOrder.id, parseFloat(e.target.value) || 0)}
                    style={{
                      width: '120px',
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      textAlign: 'right',
                    }}
                  />
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '1rem', 
                borderTop: '2px solid #e2e8f0', 
                marginTop: '0.5rem',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1e293b' }}>Total:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#10b981' }}>
                  {formatCurrency(currentOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetailModal && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrderId(null);
          }}
          onUpdate={() => {
            loadOrders();
            loadStatistics();
          }}
        />
      )}
    </div>
  );
};

export default Orders;

