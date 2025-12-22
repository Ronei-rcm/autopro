import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Calendar, Clock, FileText, Car, DollarSign } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Mechanic {
  id: number;
  name: string;
  email: string;
}

interface ApproveQuoteModalProps {
  quoteId: number;
  quoteNumber: string;
  clientName?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ApproveQuoteModal = ({
  quoteId,
  quoteNumber,
  clientName,
  vehicleBrand,
  vehicleModel,
  vehiclePlate,
  total,
  onClose,
  onSuccess,
}: ApproveQuoteModalProps) => {
  const navigate = useNavigate();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanicId, setSelectedMechanicId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMechanics, setLoadingMechanics] = useState(true);

  useEffect(() => {
    loadMechanics();
    // Definir data/hora padrão (próxima hora)
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const defaultStart = now.toISOString().slice(0, 16);
    setStartTime(defaultStart);
    
    // Definir término padrão (2 horas depois)
    const defaultEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setEndTime(defaultEnd);
  }, []);

  const loadMechanics = async () => {
    try {
      setLoadingMechanics(true);
      const response = await api.get('/users/mechanics');
      setMechanics(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar mecânicos:', error);
      toast.error('Erro ao carregar lista de mecânicos');
    } finally {
      setLoadingMechanics(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedMechanicId) {
      toast.error('Selecione um mecânico');
      return;
    }

    if (!startTime || !endTime) {
      toast.error('Preencha data e hora de início e término');
      return;
    }

    // Converter datetime-local para Date (ajustar para timezone local)
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validar se as datas são válidas
    if (isNaN(start.getTime())) {
      toast.error('Data/hora de início inválida');
      return;
    }

    if (isNaN(end.getTime())) {
      toast.error('Data/hora de término inválida');
      return;
    }

    if (end <= start) {
      toast.error('Data/hora de término deve ser posterior à data/hora de início');
      return;
    }

    const now = new Date();
    now.setSeconds(0, 0); // Remover segundos e milissegundos para comparação justa
    if (start < now) {
      toast.error('Data/hora de início não pode ser no passado');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar dados no formato esperado pelo backend (ISO8601)
      const requestData: {
        mechanic_id: number;
        start_time: string;
        end_time: string;
        notes?: string;
      } = {
        mechanic_id: parseInt(selectedMechanicId.toString()),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      };
      
      console.log('Datas convertidas:', {
        startTime,
        start: start.toISOString(),
        endTime,
        end: end.toISOString(),
      });
      
      // Adicionar notes apenas se não estiver vazio
      if (notes && notes.trim()) {
        requestData.notes = notes.trim();
      }
      
      console.log('Enviando dados para aprovação:', requestData);
      
      const response = await api.post(`/quotes/${quoteId}/approve-and-schedule`, requestData);
      
      console.log('Resposta da aprovação:', response.data);
      
      // Verificar se o agendamento foi criado
      if (response.data.appointment) {
        toast.success(`Orçamento aprovado e agendamento criado com sucesso! ID: ${response.data.appointment.id}`, {
          duration: 5000,
        });
        console.log('Agendamento criado:', response.data.appointment);
      } else {
        toast.success('Orçamento aprovado com sucesso!', {
          duration: 5000,
        });
        console.warn('Aviso: Agendamento não retornado na resposta');
      }
      
      onSuccess();
      onClose();
      
      // Redirecionar para agendamentos após 1 segundo
      setTimeout(() => {
        navigate('/agendamentos');
      }, 1000);
    } catch (error: any) {
      console.error('Erro ao aprovar orçamento:', error);
      
      // Tratar erros de validação do backend
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Se houver array de erros (validação do express-validator)
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((err: any) => 
            err.msg || `${err.param}: ${err.msg}`
          ).join(', ');
          toast.error(`Erro de validação: ${errorMessages}`, { duration: 5000 });
        } else if (errorData.error) {
          toast.error(errorData.error, { duration: 5000 });
        } else {
          toast.error('Erro ao aprovar orçamento. Verifique os dados e tente novamente.', { duration: 5000 });
        }
      } else {
        toast.error(error.response?.data?.error || 'Erro ao aprovar orçamento e criar agendamento', { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedMechanic = mechanics.find((m) => m.id === selectedMechanicId);

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Aprovar Orçamento #{quoteNumber}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              {clientName} - {vehicleBrand} {vehicleModel} {vehiclePlate ? `(${vehiclePlate})` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Informações do Orçamento */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <DollarSign size={20} color="#f97316" />
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Valor Total do Orçamento</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </div>
          </div>
        </div>

        {/* Seleção de Mecânico */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.75rem',
            }}
          >
            <User size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Selecione o Mecânico:
          </label>

          {loadingMechanics ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Carregando mecânicos...
            </div>
          ) : mechanics.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Nenhum mecânico disponível
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {mechanics.map((mechanic) => (
                <button
                  key={mechanic.id}
                  onClick={() => setSelectedMechanicId(mechanic.id)}
                  style={{
                    padding: '1rem',
                    backgroundColor: selectedMechanicId === mechanic.id ? '#e0e7ff' : '#f8fafc',
                    border: `2px solid ${selectedMechanicId === mechanic.id ? '#6366f1' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMechanicId !== mechanic.id) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMechanicId !== mechanic.id) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: selectedMechanicId === mechanic.id ? '#6366f1' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    <User size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: selectedMechanicId === mechanic.id ? '600' : '500',
                        color: '#1e293b',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {mechanic.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{mechanic.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data e Hora */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Data/Hora de Início:
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Data/Hora de Término:
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        {/* Observações */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem',
            }}
          >
            <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Observações (opcional):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações sobre o agendamento..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleApprove}
            disabled={loading || !selectedMechanicId || !startTime || !endTime}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: selectedMechanicId && startTime && endTime ? '#f97316' : '#cbd5e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !selectedMechanicId || !startTime || !endTime ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Processando...' : 'Aprovar e Agendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveQuoteModal;

