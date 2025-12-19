import { useState, useEffect, useRef } from 'react';
import { Search, User, Car, Package, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface SearchResult {
  type: 'client' | 'vehicle' | 'product' | 'order';
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  path: string;
}

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchAll = async () => {
      setLoading(true);
      setIsOpen(true);
      
      try {
        const [clientsRes, vehiclesRes, productsRes, ordersRes] = await Promise.allSettled([
          api.get('/clients', { params: { search: query, limit: 3 } }),
          api.get('/vehicles', { params: { search: query, limit: 3 } }),
          api.get('/products', { params: { search: query, limit: 3 } }),
          api.get('/orders', { params: { search: query, limit: 3 } }),
        ]);

        const searchResults: SearchResult[] = [];

        // Clientes
        if (clientsRes.status === 'fulfilled' && clientsRes.value.data) {
          const clients = Array.isArray(clientsRes.value.data) ? clientsRes.value.data : [];
          clients.forEach((client: any) => {
            searchResults.push({
              type: 'client',
              id: client.id,
              title: client.name,
              subtitle: client.email || client.phone || client.document,
              icon: User,
              path: '/clientes',
            });
          });
        }

        // Veículos
        if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.data) {
          const vehicles = Array.isArray(vehiclesRes.value.data) ? vehiclesRes.value.data : [];
          vehicles.forEach((vehicle: any) => {
            searchResults.push({
              type: 'vehicle',
              id: vehicle.id,
              title: `${vehicle.brand} ${vehicle.model}`,
              subtitle: `Placa: ${vehicle.plate} | ${vehicle.client_name || ''}`,
              icon: Car,
              path: '/veiculos',
            });
          });
        }

        // Produtos
        if (productsRes.status === 'fulfilled' && productsRes.value.data) {
          const products = Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
          products.forEach((product: any) => {
            searchResults.push({
              type: 'product',
              id: product.id,
              title: product.name,
              subtitle: `Estoque: ${product.quantity} | ${product.category || ''}`,
              icon: Package,
              path: '/estoque',
            });
          });
        }

        // Ordens de Serviço
        if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
          const orders = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
          orders.forEach((order: any) => {
            searchResults.push({
              type: 'order',
              id: order.id,
              title: order.order_number,
              subtitle: `${order.client_name || ''} | ${order.status || ''}`,
              icon: FileText,
              path: '/ordens-servico',
            });
          });
        }

        setResults(searchResults.slice(0, 10)); // Limitar a 10 resultados
      } catch (error) {
        console.error('Erro na busca:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchAll, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    navigate(result.path);
    // Scroll para o item específico poderia ser implementado aqui
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      client: 'Cliente',
      vehicle: 'Veículo',
      product: 'Produto',
      order: 'Ordem de Serviço',
    };
    return labels[type] || type;
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '400px', minWidth: 0 }}>
      <div style={{ position: 'relative' }}>
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Buscar clientes, veículos, produtos, OS..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = '#f97316';
            if (results.length > 0 || query.length >= 2) {
              setIsOpen(true);
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
          }}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            outline: 'none',
            minHeight: '44px',
          }}
          aria-label="Busca global"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#64748b',
            }}
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0 || loading) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            border: '1px solid #e2e8f0',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color="#64748b" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          color: '#1e293b',
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {result.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {result.subtitle}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#f97316',
                          marginTop: '0.25rem',
                        }}
                      >
                        {getTypeLabel(result.type)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
