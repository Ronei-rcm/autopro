import { CheckCircle, Clock, AlertCircle, XCircle, Circle } from 'lucide-react';

interface OrderStatusChipProps {
  status: string;
  onClick?: () => void;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OrderStatusChip = ({ status, onClick, active = false, size = 'md' }: OrderStatusChipProps) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
      open: {
        label: 'Aberta',
        color: '#64748b',
        bgColor: '#f1f5f9',
        icon: Circle,
      },
      in_progress: {
        label: 'Em Andamento',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        icon: Clock,
      },
      waiting_parts: {
        label: 'Aguardando Peças',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: AlertCircle,
      },
      finished: {
        label: 'Finalizada',
        color: '#10b981',
        bgColor: '#f0fdf4',
        icon: CheckCircle,
      },
      cancelled: {
        label: 'Cancelada',
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: XCircle,
      },
    };
    return configs[status] || configs.open;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeStyles = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.75rem', iconSize: 14 },
    md: { padding: '0.5rem 1rem', fontSize: '0.875rem', iconSize: 16 },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem', iconSize: 18 },
  };

  const style = sizeStyles[size];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: style.padding,
        backgroundColor: active ? config.color : config.bgColor,
        color: active ? 'white' : config.color,
        borderRadius: '8px',
        fontSize: style.fontSize,
        fontWeight: '600',
        cursor: onClick ? 'pointer' : 'default',
        border: active ? `2px solid ${config.color}` : `2px solid transparent`,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (onClick && !active) {
          e.currentTarget.style.backgroundColor = config.bgColor;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !active) {
          e.currentTarget.style.backgroundColor = config.bgColor;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <Icon size={style.iconSize} />
      <span>{config.label}</span>
    </div>
  );
};

export default OrderStatusChip;

