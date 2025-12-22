import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileText, Car, Wrench, Package, DollarSign, X, Eye, CheckCircle, Clock, AlertCircle, ExternalLink, UserCheck, ArrowRightLeft, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import SkeletonLoader from '../components/common/SkeletonLoader';
import AdvancedFilters from '../components/common/AdvancedFilters';
import Pagination from '../components/common/Pagination';
import OrderStatusChip from '../components/orders/OrderStatusChip';
import OrderCard from '../components/orders/OrderCard';
import QuickActionsMenu from '../components/orders/QuickActionsMenu';
import TransferOrderModal from '../components/orders/TransferOrderModal';
import SearchableSelect from '../components/common/SearchableSelect';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  const orderIdParam = searchParams.get('order_id');
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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [quickActionLoading, setQuickActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferOrder, setTransferOrder] = useState<Order | null>(null);
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
  const [sortField, setSortField] = useState<keyof Order | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemModalRef = useRef<HTMLDivElement>(null);
  const itemsListRef = useRef<HTMLDivElement>(null);

  // Debounce na busca para melhorar performance
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    loadOrders();
    loadClients();
    loadProducts();
    loadLaborTypes();
    loadOrderTemplates();
    loadStatistics();
  }, [debouncedSearch, selectedStatus, filters]);

  // Abrir OS específica se order_id estiver na URL
  useEffect(() => {
    if (orderIdParam) {
      const orderId = parseInt(orderIdParam);
      if (!isNaN(orderId)) {
        // Aguardar carregar as ordens primeiro
        const timer = setTimeout(() => {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            handleViewDetail(orderId);
            // Remover parâmetro da URL
            setSearchParams({});
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [orderIdParam, orders]);

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
      if (debouncedSearch) params.search = debouncedSearch;
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
      toast.success('Item adicionado com sucesso!', {
        icon: '✅',
        duration: 2000,
      });
      resetItemForm();
      await loadOrderItems(currentOrder.id);
      // Recarregar ordem atualizada
      const orderResponse = await api.get(`/orders/${currentOrder.id}`);
      setCurrentOrder(orderResponse.data);
      loadOrders();
      loadProducts(); // Recarregar produtos para atualizar estoque
      loadStatistics();
      
      // Scroll suave para o novo item adicionado
      setTimeout(() => {
        itemsListRef.current?.scrollTo({
          top: itemsListRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
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

  const handleQuickAction = async (orderId: number, action: string) => {
    try {
      setQuickActionLoading(orderId);
      const response = await api.post(`/orders/${orderId}/quick-action`, { action });
      toast.success('Status atualizado com sucesso!');
      loadOrders();
      loadStatistics();
      
      // Atualizar ordem atual se estiver visualizando
      if (currentOrder?.id === orderId) {
        setCurrentOrder(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao executar ação');
    } finally {
      setQuickActionLoading(null);
    }
  };

  const handleAssumeOrder = async (orderId: number) => {
    try {
      setQuickActionLoading(orderId);
      const response = await api.post(`/orders/${orderId}/assume`);
      toast.success('OS assumida com sucesso!');
      loadOrders();
      loadStatistics();
      
      // Atualizar ordem atual se estiver visualizando
      if (currentOrder?.id === orderId) {
        setCurrentOrder(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao assumir ordem de serviço');
    } finally {
      setQuickActionLoading(null);
    }
  };

  const handleOpenTransferModal = (order: Order) => {
    setTransferOrder(order);
    setShowTransferModal(true);
  };

  const handleTransferSuccess = () => {
    loadOrders();
    loadStatistics();
    if (currentOrder && transferOrder && currentOrder.id === transferOrder.id) {
      handleViewDetail(currentOrder.id);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?\n\nEsta ação não pode ser desfeita e irá excluir todos os itens, histórico e arquivos vinculados.')) return;

    try {
      toast.loading('Excluindo ordem de serviço...', { id: 'delete-order' });
      await api.delete(`/orders/${id}`);
      toast.success('Ordem de serviço excluída com sucesso!', { id: 'delete-order' });
      loadOrders();
      loadStatistics();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao excluir ordem de serviço';
      const unpaidCount = error.response?.data?.unpaid_receivables;
      
      if (errorMessage.includes('contas a receber') || errorMessage.includes('em aberto')) {
        // Mensagem com informações detalhadas
        const detailMessage = unpaidCount 
          ? `\n\n${unpaidCount === 1 ? '1 conta a receber' : `${unpaidCount} contas a receber`} precisa ser cancelada ou excluída.`
          : '';
        
        toast.error(
          (t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>{errorMessage}{detailMessage}</div>
              <button
                onClick={() => {
                  navigate('/financeiro?tab=receivables&order_id=' + id);
                  toast.dismiss(t.id);
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  alignSelf: 'flex-start',
                }}
              >
                <ExternalLink size={14} />
                Ir para Contas a Receber
              </button>
            </div>
          ),
          { 
            id: 'delete-order',
            duration: 12000,
          }
        );
      } else if (errorMessage.includes('registros vinculados') || errorMessage.includes('vinculados')) {
        toast.error(errorMessage, { 
          id: 'delete-order',
          duration: 8000
        });
      } else {
        toast.error(errorMessage, { id: 'delete-order' });
      }
      
      console.error('Erro ao excluir ordem de serviço:', error.response?.data || error);
    }
  };

  const handleUpdateDiscount = async (orderId: number, discount: number) => {
    try {
      // Validar no frontend também
      if (currentOrder && discount > currentOrder.subtotal) {
        toast.error(`O desconto não pode ser maior que o subtotal (${formatCurrency(currentOrder.subtotal)})`);
        return;
      }
      
      await api.put(`/orders/${orderId}/discount`, { discount });
      toast.success('Desconto atualizado com sucesso!');
      loadOrders();
      if (currentOrder?.id === orderId) {
        loadOrderItems(orderId);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar desconto';
      toast.error(errorMessage);
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

  // Ordenar ordens
  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtrar, ordenar e paginar ordens
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filtro por status
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtro por busca (já está sendo feito no backend com debouncedSearch)
    // Mantido aqui para compatibilidade com filtros locais se necessário

    // Filtros avançados
    if (filters.client_id) {
      filtered = filtered.filter(order => order.client_id === parseInt(filters.client_id));
    }

    // Ordenação
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue, 'pt-BR')
            : bValue.localeCompare(aValue, 'pt-BR');
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    } else {
      // Ordenação padrão: mais recentes primeiro
      filtered = [...filtered].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return filtered;
  }, [orders, filters, statusFilter, sortField, sortDirection]);

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
        {/* Busca */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '500px' }}>
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
        </div>

        {/* Filtros rápidos por status */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '500' }}>
            Filtrar por Status:
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <OrderStatusChip
              status="open"
              onClick={() => setStatusFilter(statusFilter === 'open' ? '' : 'open')}
              active={statusFilter === 'open'}
            />
            <OrderStatusChip
              status="in_progress"
              onClick={() => setStatusFilter(statusFilter === 'in_progress' ? '' : 'in_progress')}
              active={statusFilter === 'in_progress'}
            />
            <OrderStatusChip
              status="waiting_parts"
              onClick={() => setStatusFilter(statusFilter === 'waiting_parts' ? '' : 'waiting_parts')}
              active={statusFilter === 'waiting_parts'}
            />
            <OrderStatusChip
              status="finished"
              onClick={() => setStatusFilter(statusFilter === 'finished' ? '' : 'finished')}
              active={statusFilter === 'finished'}
            />
            <OrderStatusChip
              status="cancelled"
              onClick={() => setStatusFilter(statusFilter === 'cancelled' ? '' : 'cancelled')}
              active={statusFilter === 'cancelled'}
            />
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Limpar Filtro
              </button>
            )}
          </div>
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

      {/* Orders List - Cards para mobile, Table para desktop */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '12px' }}>
          <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nenhuma ordem de serviço encontrada</p>
          <p style={{ fontSize: '0.875rem' }}>Tente ajustar os filtros ou criar uma nova OS</p>
        </div>
      ) : isMobile ? (
        // Layout de Cards para Mobile
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {paginatedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleViewDetail}
              onViewItems={handleViewItems}
              onQuickAction={handleQuickAction}
              onAssume={handleAssumeOrder}
              onTransfer={handleOpenTransferModal}
              currentUserId={user?.id}
              currentUserProfile={user?.profile}
              formatCurrency={formatCurrency}
              getStatusLabel={getStatusLabel}
              loading={quickActionLoading === order.id}
            />
          ))}
        </div>
      ) : (
        // Layout de Table para Desktop
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th 
                  style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('order_number')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Número
                    {sortField === 'order_number' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('client_name')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Cliente / Veículo
                    {sortField === 'client_name' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Mecânico
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('status')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('total')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    Total
                    {sortField === 'total' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>{order.mechanic_name || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sem mecânico</span>}</div>
                      {(user?.profile === 'admin' || user?.profile === 'mechanic' || user?.profile === 'attendant') && order.status !== 'finished' && order.status !== 'cancelled' && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {(!order.mechanic_id || order.mechanic_id !== user?.id) && (user?.profile === 'admin' || user?.profile === 'mechanic') && (
                            <button
                              onClick={() => handleAssumeOrder(order.id)}
                              disabled={quickActionLoading === order.id}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#e0e7ff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: quickActionLoading === order.id ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#6366f1',
                                opacity: quickActionLoading === order.id ? 0.5 : 1,
                              }}
                              title="Assumir OS"
                            >
                              <UserCheck size={14} />
                              Assumir
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenTransferModal(order)}
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
                        </div>
                      )}
                    </div>
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
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
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
                      <QuickActionsMenu
                        order={order}
                        onAction={handleQuickAction}
                        loading={quickActionLoading === order.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination para Desktop */}
          {!loading && filteredOrders.length > 0 && (
            <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Pagination para Mobile */}
      {!loading && filteredOrders.length > 0 && isMobile && (
        <div style={{ marginTop: '1rem' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

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
                <SearchableSelect
                  options={clients.map(client => ({
                    value: client.id.toString(),
                    label: client.name,
                  }))}
                  value={formData.client_id}
                  onChange={(value) => {
                    setFormData({ ...formData, client_id: value, vehicle_id: '' });
                    if (value) {
                      loadVehicles(parseInt(value));
                    } else {
                      setVehicles([]);
                    }
                  }}
                  placeholder="Selecione um cliente"
                  required
                  searchPlaceholder="Buscar cliente..."
                  emptyMessage="Nenhum cliente encontrado"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Veículo *
                </label>
                <SearchableSelect
                  options={vehicles.map(vehicle => ({
                    value: vehicle.id.toString(),
                    label: `${vehicle.brand} ${vehicle.model}${vehicle.plate ? ` - ${vehicle.plate}` : ''}`,
                  }))}
                  value={formData.vehicle_id}
                  onChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                  placeholder="Selecione um veículo"
                  required
                  disabled={!formData.client_id}
                  searchPlaceholder="Buscar veículo..."
                  emptyMessage={formData.client_id ? "Nenhum veículo encontrado" : "Selecione um cliente primeiro"}
                />
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
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, discount: e.target.value });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: parseFloat(formData.discount) < 0 ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  {parseFloat(formData.discount) < 0 && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}>
                      Desconto não pode ser negativo
                    </div>
                  )}
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
            ref={itemModalRef}
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
            onKeyDown={(e) => {
              // Atalhos de teclado no modal de itens
              if (e.key === 'Escape' && !editingItem) {
                setShowItemModal(false);
                setCurrentOrder(null);
                setOrderItems([]);
                resetItemForm();
              }
              if (e.key === 'Enter' && e.ctrlKey && !editingItem && itemFormData.description && itemTotal > 0) {
                e.preventDefault();
                handleAddItem(e as any);
              }
            }}
            tabIndex={-1}
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
              <form 
                onSubmit={handleSubmitItem}
                onKeyDown={(e) => {
                  // Atalho: Ctrl+Enter para adicionar item
                  if (e.key === 'Enter' && e.ctrlKey && !editingItem) {
                    e.preventDefault();
                    if (itemFormData.description && itemTotal > 0) {
                      handleAddItem(e);
                    }
                  }
                  // Atalho: Escape para cancelar edição
                  if (e.key === 'Escape' && editingItem) {
                    resetItemForm();
                  }
                }}
              >
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
                        border: !itemFormData.description.trim() && itemFormData.description !== '' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        transition: 'border-color 0.2s',
                      }}
                    />
                    {!itemFormData.description.trim() && itemFormData.description !== '' && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}>
                        Descrição é obrigatória
                      </div>
                    )}
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
                        border: parseFloat(itemFormData.quantity) <= 0 ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        transition: 'border-color 0.2s',
                      }}
                    />
                    {parseFloat(itemFormData.quantity) <= 0 && itemFormData.quantity !== '' && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}>
                        Quantidade deve ser maior que zero
                      </div>
                    )}
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
                        border: parseFloat(itemFormData.unit_price) <= 0 ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        transition: 'border-color 0.2s',
                      }}
                    />
                    {parseFloat(itemFormData.unit_price) <= 0 && itemFormData.unit_price !== '' && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}>
                        Preço deve ser maior que zero
                      </div>
                    )}
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
                        position: 'relative',
                      }}
                      title={editingItem ? 'Salvar alterações (Ctrl+Enter)' : 'Adicionar item (Ctrl+Enter)'}
                    >
                      {editingItem ? 'Salvar Alterações' : 'Adicionar'}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        opacity: 0.8, 
                        marginLeft: '0.5rem',
                        fontWeight: 'normal',
                      }}>
                        (Ctrl+Enter)
                      </span>
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
                <div ref={itemsListRef} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', maxHeight: '400px', overflowY: 'auto' }}>
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
                    max={currentOrder.subtotal}
                    value={currentOrder.discount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value <= currentOrder.subtotal) {
                        handleUpdateDiscount(currentOrder.id, value);
                      }
                    }}
                    style={{
                      width: '120px',
                      padding: '0.5rem',
                      border: currentOrder.discount > currentOrder.subtotal ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      textAlign: 'right',
                    }}
                  />
                  {currentOrder.discount > 0 && (
                    <button
                      onClick={() => handleUpdateDiscount(currentOrder.id, 0)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Remover desconto"
                    >
                      <X size={12} />
                      Limpar
                    </button>
                  )}
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

      {/* Modal Transferir OS */}
      {showTransferModal && transferOrder && (
        <TransferOrderModal
          orderId={transferOrder.id}
          orderNumber={transferOrder.order_number}
          currentMechanicName={transferOrder.mechanic_name}
          onClose={() => {
            setShowTransferModal(false);
            setTransferOrder(null);
          }}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
};

export default Orders;

