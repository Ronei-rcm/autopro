import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Car, User, Eye, FileText, Wrench, Shield, DollarSign, Calendar } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/common/SkeletonLoader';
import AdvancedFilters from '../components/common/AdvancedFilters';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface Vehicle {
  id: number;
  client_id: number;
  client_cpf?: string;
  brand: string;
  model: string;
  year?: number;
  plate?: string;
  chassis?: string;
  color?: string;
  mileage: number;
  notes?: string;
}

interface Client {
  id: number;
  name: string;
  cpf?: string;
  cnpj?: string;
  type: 'PF' | 'PJ';
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null,
  });
  const [viewHistory, setViewHistory] = useState<Vehicle | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    brand: '',
    model: '',
    year: '',
    plate: '',
    chassis: '',
    color: '',
    mileage: '0',
    notes: '',
  });

  useEffect(() => {
    loadVehicles();
    loadClients();
  }, [search, filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const response = await api.get('/vehicles', { params });
      setVehicles(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar veículos');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        client_id: parseInt(formData.client_id),
        year: formData.year ? parseInt(formData.year) : null,
        mileage: parseInt(formData.mileage) || 0,
      };

      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, data);
        toast.success('Veículo atualizado com sucesso!');
      } else {
        await api.post('/vehicles', data);
        toast.success('Veículo criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar veículo');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      client_id: vehicle.client_id.toString(),
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year?.toString() || '',
      plate: vehicle.plate || '',
      chassis: vehicle.chassis || '',
      color: vehicle.color || '',
      mileage: vehicle.mileage.toString(),
      notes: vehicle.notes || '',
    });
    setShowModal(true);
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setDeleteConfirm({ isOpen: true, vehicle });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.vehicle) return;

    try {
      await api.delete(`/vehicles/${deleteConfirm.vehicle.id}`);
      toast.success('Veículo excluído com sucesso!');
      setDeleteConfirm({ isOpen: false, vehicle: null });
      loadVehicles();
    } catch (error: any) {
      toast.error('Erro ao excluir veículo');
      setDeleteConfirm({ isOpen: false, vehicle: null });
    }
  };

  const handleViewHistory = async (vehicle: Vehicle) => {
    setViewHistory(vehicle);
    setLoadingHistory(true);
    try {
      const response = await api.get(`/vehicles/${vehicle.id}/history`);
      setVehicleHistory(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar histórico do veículo');
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filtrar veículos localmente
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(() => {
      // Filtros locais podem ser adicionados aqui
      return true;
    });
  }, [vehicles, filters]);

  // Paginação
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVehicles.slice(startIndex, endIndex);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  const resetForm = () => {
    setFormData({
      client_id: '',
      brand: '',
      model: '',
      year: '',
      plate: '',
      chassis: '',
      color: '',
      mileage: '0',
      notes: '',
    });
    setEditingVehicle(null);
  };

  const formatPlate = (plate?: string) => {
    if (!plate) return '-';
    return plate.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return '-';
    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '');
    // Formata CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cpf;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Veículos
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gerencie o cadastro de veículos
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
          Novo Veículo
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
            placeholder="Buscar por marca, modelo, placa, chassi ou CPF/CNPJ..."
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
            brand: {
              label: 'Marca',
              type: 'text',
            },
            client_id: {
              label: 'Cliente',
              type: 'select',
              options: clients.map(c => ({ label: c.name, value: c.id.toString() })),
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
        ) : filteredVehicles.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Nenhum veículo encontrado
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Veículo
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Cliente
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Placa
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Ano / KM
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
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
                        <Car size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {vehicle.brand} {vehicle.model}
                        </div>
                        {vehicle.color && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {vehicle.color}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} color="#64748b" />
                      <span style={{ color: '#64748b', fontFamily: 'monospace' }}>
                        {vehicle.client_cpf ? formatCPF(vehicle.client_cpf) : '-'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {formatPlate(vehicle.plate)}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {vehicle.year || '-'} {vehicle.year && vehicle.mileage > 0 && '•'} {vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString()} km` : ''}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(vehicle)}
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
                        onClick={() => handleDeleteClick(vehicle)}
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
        {!loading && filteredVehicles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredVehicles.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o veículo "${deleteConfirm.vehicle?.brand} ${deleteConfirm.vehicle?.model}" (${deleteConfirm.vehicle?.plate || 'sem placa'})? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, vehicle: null })}
      />

      {/* Vehicle History Modal */}
      {viewHistory && (
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
            setViewHistory(null);
            setVehicleHistory(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Histórico do Veículo
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  {viewHistory.brand} {viewHistory.model} {viewHistory.year && `(${viewHistory.year})`} {viewHistory.plate && `- ${viewHistory.plate}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewHistory(null);
                  setVehicleHistory(null);
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

            {loadingHistory ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                Carregando histórico...
              </div>
            ) : vehicleHistory ? (
              <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Estatísticas */}
                {vehicleHistory.statistics && (
                  <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                      Estatísticas
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total de OS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                          {vehicleHistory.statistics.total_orders || 0}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Valor Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicleHistory.statistics.total_spent || 0)}
                        </div>
                      </div>
                      {vehicleHistory.statistics.last_service && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Último Serviço</div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                            {new Date(vehicleHistory.statistics.last_service).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                      {vehicleHistory.statistics.first_service && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Primeiro Serviço</div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                            {new Date(vehicleHistory.statistics.first_service).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Garantias Ativas */}
                {vehicleHistory.warranties && vehicleHistory.warranties.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={20} color="#f59e0b" />
                      Garantias ({vehicleHistory.warranties.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {vehicleHistory.warranties.map((warranty: any) => (
                        <div
                          key={warranty.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: warranty.status === 'active' ? '#fef3c7' : '#f8fafc',
                            borderRadius: '8px',
                            border: `1px solid ${warranty.status === 'active' ? '#fde047' : '#e2e8f0'}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                {warranty.description}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                OS: {warranty.order_number} | Período: {warranty.warranty_period_days} dias
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                De {new Date(warranty.start_date).toLocaleDateString('pt-BR')} até {new Date(warranty.end_date).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontWeight: '600',
                                backgroundColor:
                                  warranty.status === 'active' ? '#10b98120' :
                                  warranty.status === 'expired' ? '#ef444420' :
                                  '#64748b20',
                                color:
                                  warranty.status === 'active' ? '#10b981' :
                                  warranty.status === 'expired' ? '#ef4444' :
                                  '#64748b',
                              }}
                            >
                              {warranty.status === 'active' ? 'Ativa' :
                               warranty.status === 'expired' ? 'Expirada' :
                               warranty.status === 'used' ? 'Utilizada' :
                               warranty.status === 'cancelled' ? 'Cancelada' : warranty.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline de OS */}
                {vehicleHistory.orders && vehicleHistory.orders.length > 0 ? (
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} color="#3b82f6" />
                      Ordens de Serviço ({vehicleHistory.orders.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {vehicleHistory.orders.map((order: any, index: number) => (
                        <div
                          key={order.id}
                          style={{
                            padding: '1.5rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            borderLeft: '4px solid #3b82f6',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>
                                  {order.order_number}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    backgroundColor:
                                      order.status === 'finished' ? '#10b98120' :
                                      order.status === 'in_progress' ? '#f59e0b20' :
                                      '#64748b20',
                                    color:
                                      order.status === 'finished' ? '#10b981' :
                                      order.status === 'in_progress' ? '#f59e0b' :
                                      '#64748b',
                                  }}
                                >
                                  {order.status === 'finished' ? 'Finalizada' :
                                   order.status === 'in_progress' ? 'Em Andamento' :
                                   order.status === 'open' ? 'Aberta' :
                                   order.status === 'cancelled' ? 'Cancelada' : order.status}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Cliente: {order.client_name || '-'} {order.mechanic_name && `| Mecânico: ${order.mechanic_name}`}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Criada em {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                {order.finished_at && ` | Finalizada em ${new Date(order.finished_at).toLocaleDateString('pt-BR')}`}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total || 0)}
                              </div>
                            </div>
                          </div>

                          {/* Itens da OS */}
                          {order.items && order.items.length > 0 && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                                Itens da OS ({order.items.length})
                              </div>
                              <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {order.items.map((item: any) => (
                                  <div
                                    key={item.id}
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
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {item.item_type === 'product' ? (
                                          <Wrench size={14} color="#64748b" />
                                        ) : (
                                          <FileText size={14} color="#64748b" />
                                        )}
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                                          {item.description}
                                        </div>
                                        {item.product_name && (
                                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            ({item.product_code || item.product_name})
                                          </div>
                                        )}
                                        {item.labor_name && (
                                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            (Mão de Obra)
                                          </div>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', marginLeft: '1.25rem' }}>
                                        Qtd: {item.quantity} × {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price || 0)}
                                      </div>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_price || 0)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <div style={{ color: '#64748b' }}>Subtotal:</div>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.subtotal || 0)}
                                </div>
                              </div>
                              {order.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                  <div style={{ color: '#64748b' }}>Desconto:</div>
                                  <div style={{ fontWeight: '600', color: '#ef4444' }}>
                                    - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.discount || 0)}
                                  </div>
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>Total:</div>
                                <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total || 0)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Nenhuma ordem de serviço encontrada para este veículo
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                Erro ao carregar histórico
              </div>
            )}
          </div>
        </div>
      )}

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
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Cliente *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
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
                  {clients.map((client) => {
                    const document = client.type === 'PF' ? client.cpf : client.cnpj;
                    const formattedDoc = document ? formatCPF(document) : '';
                    return (
                      <option key={client.id} value={client.id}>
                        {formattedDoc} - {client.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
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
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Ano
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    min="1900"
                    max="2100"
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
                    Placa
                  </label>
                  <input
                    type="text"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    maxLength={7}
                    placeholder="ABC1234"
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
                    Quilometragem
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    min="0"
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
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                    Chassi
                  </label>
                  <input
                    type="text"
                    value={formData.chassis}
                    onChange={(e) => setFormData({ ...formData, chassis: e.target.value.toUpperCase() })}
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
                  {editingVehicle ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;

