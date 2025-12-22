import { ReactNode } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveTableProps {
  columns: Array<{
    key: string;
    label: string;
    render?: (item: any) => ReactNode;
    align?: 'left' | 'center' | 'right';
    hideOnMobile?: boolean;
  }>;
  data: any[];
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: any) => void;
  keyExtractor: (item: any) => string | number;
}

/**
 * Componente de tabela responsiva que se transforma em cards em mobile
 */
export const ResponsiveTable = ({
  columns,
  data,
  emptyMessage = 'Nenhum item encontrado',
  loading = false,
  onRowClick,
  keyExtractor,
}: ResponsiveTableProps) => {
  const { isMobile, isTablet } = useResponsive();
  const isSmallScreen = isMobile || isTablet;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Carregando...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        {emptyMessage}
      </div>
    );
  }

  // Mobile/Tablet: Cards layout
  if (isSmallScreen) {
    const visibleColumns = columns.filter(col => !col.hideOnMobile);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
            onTouchStart={(e) => {
              if (onRowClick) {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.1)';
              }
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
            }}
          >
            {visibleColumns.map((column, idx) => {
              const content = column.render
                ? column.render(item)
                : item[column.key];
              
              return (
                <div
                  key={column.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: idx === 0 ? 'flex-start' : 'center',
                    padding: idx === 0 ? '0 0 0.75rem 0' : '0.5rem 0',
                    borderBottom: idx < visibleColumns.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: idx === 0 ? '600' : '400',
                      color: idx === 0 ? '#1e293b' : '#64748b',
                    }}
                  >
                    {column.label}:
                  </span>
                  <span
                    style={{
                      fontSize: idx === 0 ? '1rem' : '0.875rem',
                      fontWeight: idx === 0 ? '600' : '400',
                      color: '#1e293b',
                      textAlign: column.align === 'right' ? 'right' : 'left',
                      flex: 1,
                      marginLeft: '1rem',
                    }}
                  >
                    {content || '-'}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        overflowX: 'auto',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: '1rem',
                  textAlign: column.align || 'left',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#64748b',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              style={{
                borderBottom: '1px solid #e2e8f0',
                transition: 'background-color 0.2s',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {columns.map((column) => {
                const content = column.render
                  ? column.render(item)
                  : item[column.key];
                
                return (
                  <td
                    key={column.key}
                    style={{
                      padding: '1rem',
                      textAlign: column.align || 'left',
                      color: '#1e293b',
                      fontSize: '0.875rem',
                    }}
                  >
                    {content || '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

