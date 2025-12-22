import { useState, useEffect } from 'react';
import { X, User, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Mechanic {
  id: number;
  name: string;
  email: string;
}

interface TransferOrderModalProps {
  orderId: number;
  orderNumber: string;
  currentMechanicName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferOrderModal = ({
  orderId,
  orderNumber,
  currentMechanicName,
  onClose,
  onSuccess,
}: TransferOrderModalProps) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanicId, setSelectedMechanicId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMechanics, setLoadingMechanics] = useState(true);

  useEffect(() => {
    loadMechanics();
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

  const handleTransfer = async () => {
    if (!selectedMechanicId) {
      toast.error('Selecione um mecânico');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/orders/${orderId}/transfer`, {
        mechanic_id: selectedMechanicId,
      });
      toast.success('OS transferida com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao transferir OS:', error);
      toast.error(error.response?.data?.error || 'Erro ao transferir ordem de serviço');
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
          maxWidth: '500px',
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
              Transferir OS #{orderNumber}
            </h2>
            {currentMechanicName && (
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                Mecânico atual: {currentMechanicName}
              </p>
            )}
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

        {/* Lista de Mecânicos */}
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
            Selecione o mecânico:
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
                maxHeight: '300px',
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
                  {selectedMechanicId === mechanic.id && (
                    <div style={{ color: '#6366f1' }}>
                      <ArrowRight size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
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
            onClick={handleTransfer}
            disabled={loading || !selectedMechanicId}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: selectedMechanicId ? '#6366f1' : '#cbd5e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !selectedMechanicId ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Transferindo...' : 'Transferir OS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferOrderModal;

