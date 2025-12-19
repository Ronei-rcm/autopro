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
        padding: '1.25rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
      }}
      role="article"
      aria-label={`${title}: ${value}${trend ? `, ${trend}` : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div 
            style={{ 
              fontSize: '0.875rem', 
              color: '#64748b', 
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            {title}
          </div>
          <div 
            style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: 'bold', 
              color: '#1e293b',
              lineHeight: '1.2',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </div>
          {trend && (
            <div 
              style={{ 
                fontSize: '0.875rem', 
                color: trendColor, 
                marginTop: '0.5rem',
                fontWeight: '500',
              }}
            >
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
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <Icon size={24} color={iconColor} />
        </div>
      </div>
    </div>
  );
};

export default KPICard;

