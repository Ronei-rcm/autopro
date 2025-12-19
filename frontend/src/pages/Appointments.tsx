import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Clock, User, Car, CheckCircle, XCircle, Play } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Appointment {
  id: number;
  client_id: number;
  client_name?: string;
  vehicle_id: number;
  brand?: string;
  model?: string;
  plate?: string;
  mechanic_id?: number;
  mechanic_name?: string;
  service_type?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
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

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    mechanic_id: '',
    service_type: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    loadAppointments();
    loadClients();
  }, [selectedStatus, selectedDate, viewMode]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      
      if (viewMode === 'calendar') {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
        params.start_date = startOfMonth.toISOString();
        params.end_date = endOfMonth.toISOString();
      }

      const response = await api.get('/appointments', { params });
      let filtered = response.data;

      if (search) {
        filtered = filtered.filter((apt: Appointment) =>
          apt.title.toLowerCase().includes(search.toLowerCase()) ||
          apt.client_name?.toLowerCase().includes(search.toLowerCase()) ||
          apt.brand?.toLowerCase().includes(search.toLowerCase()) ||
          apt.model?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setAppointments(filtered);
    } catch (error: any) {
      toast.error('Erro ao carregar agendamentos');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        client_id: parseInt(formData.client_id),
        vehicle_id: parseInt(formData.vehicle_id),
        mechanic_id: formData.mechanic_id ? parseInt(formData.mechanic_id) : null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, data);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await api.post('/appointments', data);
        toast.success('Agendamento criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar agendamento');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      client_id: appointment.client_id.toString(),
      vehicle_id: appointment.vehicle_id.toString(),
      mechanic_id: appointment.mechanic_id?.toString() || '',
      service_type: appointment.service_type || '',
      title: appointment.title,
      description: appointment.description || '',
      start_time: new Date(appointment.start_time).toISOString().slice(0, 16),
      end_time: new Date(appointment.end_time).toISOString().slice(0, 16),
      status: appointment.status,
      notes: appointment.notes || '',
    });
    loadVehicles(appointment.client_id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Agendamento excluído com sucesso!');
      loadAppointments();
    } catch (error: any) {
      toast.error('Erro ao excluir agendamento');
    }
  };

  const handleQuickAction = async (id: number, action: string) => {
    try {
      await api.post(`/appointments/${id}/quick-action`, { action });
      toast.success('Ação executada com sucesso!');
      loadAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao executar ação');
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      vehicle_id: '',
      mechanic_id: '',
      service_type: '',
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      status: 'scheduled',
      notes: '',
    });
    setEditingAppointment(null);
    setVehicles([]);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: '#64748b',
      confirmed: '#3b82f6',
      in_progress: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  // const getAppointmentsByDate = () => {
  //   const grouped: Record<string, Appointment[]> = {};
  //   appointments.forEach((apt) => {
  //     const date = new Date(apt.start_time).toLocaleDateString('pt-BR');
  //     if (!grouped[date]) {
  //       grouped[date] = [];
  //     }
  //     grouped[date].push(apt);
  //   });
  //   return grouped;
  // };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toLocaleDateString('pt-BR');
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.start_time).toLocaleDateString('pt-BR');
      return aptDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
              Agenda
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Gerencie os agendamentos da oficina
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
            Novo Agendamento
          </button>
        </div>

        {/* Filters */}
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
              placeholder="Buscar por título, cliente ou veículo..."
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
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: viewMode === 'list' ? '#f97316' : '#f1f5f9',
                color: viewMode === 'list' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: viewMode === 'calendar' ? '#f97316' : '#f1f5f9',
                color: viewMode === 'calendar' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Calendário
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              Carregando...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              Nenhum agendamento encontrado
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Calendar size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                            {appointment.title}
                          </h3>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: getStatusColor(appointment.status) + '20',
                              color: getStatusColor(appointment.status),
                            }}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} />
                            {appointment.client_name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Car size={14} />
                            {appointment.brand} {appointment.model} {appointment.plate && `- ${appointment.plate}`}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} />
                            {formatDateTime(appointment.start_time)}
                          </div>
                        </div>
                        {appointment.description && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                            {appointment.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleQuickAction(appointment.id, 'confirm')}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#eff6ff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        title="Confirmar"
                      >
                        <CheckCircle size={16} color="#3b82f6" />
                      </button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => handleQuickAction(appointment.id, 'start')}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#fef3c7',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        title="Iniciar"
                      >
                        <Play size={16} color="#f59e0b" />
                      </button>
                    )}
                    {appointment.status === 'in_progress' && (
                      <button
                        onClick={() => handleQuickAction(appointment.id, 'complete')}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#f0fdf4',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        title="Concluir"
                      >
                        <CheckCircle size={16} color="#10b981" />
                      </button>
                    )}
                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                      <button
                        onClick={() => handleQuickAction(appointment.id, 'cancel')}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        title="Cancelar"
                      >
                        <XCircle size={16} color="#ef4444" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(appointment)}
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
                      onClick={() => handleDelete(appointment.id)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            padding: '1.5rem',
          }}
        >
          {/* Calendar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={() => navigateMonth('prev')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ← Anterior
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Próximo →
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div
                key={day}
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#64748b',
                  fontSize: '0.875rem',
                }}
              >
                {day}
              </div>
            ))}
            {getDaysInMonth().map((date, index) => {
              const dayAppointments = getAppointmentsForDay(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  style={{
                    minHeight: '100px',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: isToday ? '#eff6ff' : 'white',
                  }}
                >
                  {date && (
                    <>
                      <div
                        style={{
                          fontWeight: isToday ? 'bold' : '600',
                          marginBottom: '0.5rem',
                          color: isToday ? '#3b82f6' : '#1e293b',
                        }}
                      >
                        {date.getDate()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {dayAppointments.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => handleEdit(apt)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: getStatusColor(apt.status) + '20',
                              color: getStatusColor(apt.status),
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: '600',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={apt.title}
                          >
                            {formatTime(apt.start_time)} - {apt.title}
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                            +{dayAppointments.length - 3} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            <form onSubmit={handleSubmit}>
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Revisão completa, Troca de óleo..."
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
                    Data/Hora Início *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
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
                    Data/Hora Término *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Tipo de Serviço
                </label>
                <input
                  type="text"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  placeholder="Ex: Revisão, Manutenção, Reparo..."
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
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {editingAppointment ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

