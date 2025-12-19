import { memo } from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'table' | 'list';
  lines?: number;
  width?: string;
  height?: string;
}

const SkeletonLoader = memo(({ 
  type = 'text', 
  lines = 3, 
  height = '20px' 
}: SkeletonLoaderProps) => {
  const baseStyle = {
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  if (type === 'card') {
    return (
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <div style={{ ...baseStyle, width: '60%', height: '24px', marginBottom: '1rem' }} />
        <div style={{ ...baseStyle, width: '100%', height: '16px', marginBottom: '0.5rem' }} />
        <div style={{ ...baseStyle, width: '80%', height: '16px' }} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ ...baseStyle, width: '100%', height: '20px', marginBottom: '0.5rem' }} />
          <div style={{ ...baseStyle, width: '70%', height: '20px' }} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '1rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              gap: '1rem',
            }}
          >
            <div style={{ ...baseStyle, width: '30%', height: '20px' }} />
            <div style={{ ...baseStyle, width: '40%', height: '20px' }} />
            <div style={{ ...baseStyle, width: '30%', height: '20px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...baseStyle,
              width: i === lines - 1 ? '60%' : '100%',
              height,
              marginBottom: '0.75rem',
            }}
          />
        ))}
      </div>
    );
  }

  // Default: text
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            ...baseStyle,
            width: i === lines - 1 ? '60%' : '100%',
            height,
            marginBottom: '0.5rem',
          }}
        />
      ))}
    </div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
