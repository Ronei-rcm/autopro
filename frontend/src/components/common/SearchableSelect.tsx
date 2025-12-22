import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  style?: React.CSSProperties;
  className?: string;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  disabled = false,
  required = false,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhuma opção encontrada',
  style,
  className = '',
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focar no input de busca quando abrir
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter((option) => {
    if (option.disabled) return false;
    if (!searchQuery.trim()) return true;
    return option.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Agrupar opções se houver grupos
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || 'outros';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SearchableSelectOption[]>);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }} className={className}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '0.9rem',
          backgroundColor: disabled ? '#f8fafc' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#cbd5e1';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
      >
        <span style={{ color: selectedOption ? '#1e293b' : '#94a3b8', flex: 1, textAlign: 'left' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '0.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#64748b',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            style={{
              color: '#64748b',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Campo de busca */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    setSearchQuery('');
                  }
                }}
              />
            </div>
          </div>

          {/* Lista de opções */}
          <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                {emptyMessage}
              </div>
            ) : (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {group !== 'outros' && (
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#64748b',
                        backgroundColor: '#f8fafc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {group}
                    </div>
                  )}
                  {groupOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      style={{
                        padding: '0.75rem',
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                        backgroundColor: value === option.value ? '#eff6ff' : 'white',
                        color: option.disabled ? '#cbd5e1' : value === option.value ? '#1e40af' : '#1e293b',
                        fontSize: '0.875rem',
                        transition: 'background-color 0.15s',
                        borderLeft: value === option.value ? '3px solid #3b82f6' : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!option.disabled && value !== option.value) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (value !== option.value) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

