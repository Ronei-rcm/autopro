import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface AdvancedFiltersProps {
  filters: {
    [key: string]: {
      label: string;
      type: 'select' | 'date' | 'text';
      options?: FilterOption[];
    };
  };
  onFilterChange: (filters: Record<string, string>) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const AdvancedFilters = ({ 
  filters, 
  onFilterChange, 
  isOpen: controlledIsOpen,
  onToggle 
}: AdvancedFiltersProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAll = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  const activeCount = Object.keys(activeFilters).filter(key => activeFilters[key]).length;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: activeCount > 0 ? '#f97316' : 'white',
          color: activeCount > 0 ? 'white' : '#64748b',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.9rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (activeCount === 0) {
            e.currentTarget.style.borderColor = '#f97316';
            e.currentTarget.style.color = '#f97316';
          }
        }}
        onMouseLeave={(e) => {
          if (activeCount === 0) {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#64748b';
          }
        }}
      >
        <Filter size={18} />
        Filtros Avançados
        {activeCount > 0 && (
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '0.125rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Filtros</h3>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#64748b',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <X size={14} />
                Limpar todos
              </button>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {Object.entries(filters).map(([key, filter]) => (
              <div key={key}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '0.5rem',
                  }}
                >
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options ? (
                  <select
                    value={activeFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">Todos</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={activeFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={activeFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    placeholder={`Filtrar por ${filter.label.toLowerCase()}...`}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                )}
                {activeFilters[key] && (
                  <button
                    onClick={() => clearFilter(key)}
                    style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    <X size={12} />
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
