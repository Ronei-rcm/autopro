import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendColor?: string;
  bgColor?: string;
  iconColor?: string;
}

const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendColor = '#10b981',
  bgColor = 'white',
  iconColor = '#64748b',
}: KPICardProps) => {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {title}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
            {value}
          </div>
          {trend && (
            <div style={{ fontSize: '0.875rem', color: trendColor, marginTop: '0.5rem' }}>
              {trend}
            </div>
          )}
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: bgColor === 'white' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={24} color={iconColor} />
        </div>
      </div>
    </div>
  );
};

export default KPICard;

