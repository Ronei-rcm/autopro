import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Play, CheckCircle, Clock, AlertCircle, XCircle, RotateCcw } from 'lucide-react';

interface QuickActionsMenuProps {
  order: any;
  onAction: (orderId: number, action: string) => void;
  loading?: boolean;
}

const QuickActionsMenu = ({ order, onAction, loading = false }: QuickActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getAvailableActions = () => {
    const actions: Array<{ action: string; label: string; icon: any; color: string; bgColor: string }> = [];

    switch (order.status) {
      case 'open':
        actions.push(
          { action: 'start', label: 'Iniciar OS', icon: Play, color: '#3b82f6', bgColor: '#eff6ff' },
          { action: 'wait_parts', label: 'Aguardar Peças', icon: AlertCircle, color: '#f59e0b', bgColor: '#fffbeb' },
          { action: 'cancel', label: 'Cancelar', icon: XCircle, color: '#ef4444', bgColor: '#fee2e2' }
        );
        break;
      case 'in_progress':
        actions.push(
          { action: 'finish', label: 'Finalizar OS', icon: CheckCircle, color: '#10b981', bgColor: '#f0fdf4' },
          { action: 'wait_parts', label: 'Aguardar Peças', icon: AlertCircle, color: '#f59e0b', bgColor: '#fffbeb' },
          { action: 'cancel', label: 'Cancelar', icon: XCircle, color: '#ef4444', bgColor: '#fee2e2' }
        );
        break;
      case 'waiting_parts':
        actions.push(
          { action: 'start', label: 'Retomar OS', icon: Play, color: '#3b82f6', bgColor: '#eff6ff' },
          { action: 'finish', label: 'Finalizar OS', icon: CheckCircle, color: '#10b981', bgColor: '#f0fdf4' },
          { action: 'cancel', label: 'Cancelar', icon: XCircle, color: '#ef4444', bgColor: '#fee2e2' }
        );
        break;
      case 'finished':
        actions.push(
          { action: 'reopen', label: 'Reabrir OS', icon: RotateCcw, color: '#64748b', bgColor: '#f1f5f9' }
        );
        break;
      case 'cancelled':
        actions.push(
          { action: 'reopen', label: 'Reabrir OS', icon: RotateCcw, color: '#64748b', bgColor: '#f1f5f9' }
        );
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  const handleAction = (action: string) => {
    onAction(order.id, action);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={loading}
        style={{
          padding: '0.5rem',
          backgroundColor: '#f1f5f9',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: loading ? 0.6 : 1,
        }}
        title="Ações rápidas"
      >
        <MoreVertical size={16} color="#64748b" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '0.5rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            minWidth: '180px',
            overflow: 'hidden',
          }}
        >
          {availableActions.map((actionItem) => {
            const Icon = actionItem.icon;
            return (
              <button
                key={actionItem.action}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(actionItem.action);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#1e293b',
                  transition: 'background-color 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = actionItem.bgColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={16} color={actionItem.color} />
                <span>{actionItem.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickActionsMenu;

