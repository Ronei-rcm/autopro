import { useState, useEffect, useMemo } from 'react';
import { Shield, Save, RefreshCw, Check, X, Search, Filter, Download, Upload, Layers, Eye, EyeOff, Settings } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useAuth } from '../contexts/AuthContext';

interface Permission {
  id: number;
  module: string;
  action: string;
  description?: string;
  granted: boolean;
}

const profileLabels: Record<string, string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  financial: 'Financeiro',
  attendant: 'Atendente',
};

const moduleLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clientes',
  vehicles: 'Veículos',
  suppliers: 'Fornecedores',
  inventory: 'Estoque',
  quotes: 'Orçamentos',
  orders: 'Ordens de Serviço',
  appointments: 'Agenda',
  financial: 'Financeiro',
  reports: 'Relatórios',
  settings: 'Configurações',
  users: 'Usuários',
  warranties: 'Garantias',
  templates: 'Templates',
  workshop_info: 'Informações da Oficina',
  permissions: 'Permissões',
};

const actionLabels: Record<string, string> = {
  view: 'Visualizar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
  start: 'Iniciar',
  finish: 'Finalizar',
  cancel: 'Cancelar',
  print: 'Imprimir',
  approve: 'Aprovar',
  convert: 'Converter',
  movement: 'Movimentar',
  payment: 'Pagamento',
  export: 'Exportar',
  payables_view: 'Ver Contas a Pagar',
  payables_create: 'Criar Contas a Pagar',
  payables_edit: 'Editar Contas a Pagar',
  payables_delete: 'Excluir Contas a Pagar',
  receivables_view: 'Ver Contas a Receber',
  receivables_create: 'Criar Contas a Receber',
  receivables_edit: 'Editar Contas a Receber',
  receivables_delete: 'Excluir Contas a Receber',
  manage_permissions: 'Gerenciar Permissões',
};

// Templates de permissões pré-configurados
const permissionTemplates: Record<string, Record<string, boolean>> = {
  mechanic: {
    'dashboard:view': true,
    'clients:view': true,
    'clients:create': true,
    'clients:edit': true,
    'vehicles:view': true,
    'vehicles:create': true,
    'vehicles:edit': true,
    'inventory:view': true,
    'quotes:view': true,
    'quotes:create': true,
    'quotes:edit': true,
    'orders:view': true,
    'orders:create': true,
    'orders:edit': true,
    'orders:start': true,
    'orders:finish': true,
    'orders:print': true,
    'appointments:view': true,
    'appointments:create': true,
    'appointments:edit': true,
    'warranties:view': true,
    'warranties:create': true,
    'warranties:edit': true,
    'templates:view': true,
    'workshop_info:view': true,
  },
  financial: {
    'dashboard:view': true,
    'clients:view': true,
    'vehicles:view': true,
    'inventory:view': true,
    'quotes:view': true,
    'orders:view': true,
    'orders:print': true,
    'financial:view': true,
    'financial:payables_view': true,
    'financial:payables_create': true,
    'financial:payables_edit': true,
    'financial:payables_delete': true,
    'financial:receivables_view': true,
    'financial:receivables_create': true,
    'financial:receivables_edit': true,
    'financial:receivables_delete': true,
    'financial:payment': true,
    'reports:view': true,
    'reports:export': true,
    'workshop_info:view': true,
  },
  attendant: {
    'dashboard:view': true,
    'clients:view': true,
    'clients:create': true,
    'clients:edit': true,
    'vehicles:view': true,
    'vehicles:create': true,
    'vehicles:edit': true,
    'inventory:view': true,
    'quotes:view': true,
    'quotes:create': true,
    'quotes:edit': true,
    'orders:view': true,
    'orders:create': true,
    'orders:edit': true,
    'orders:print': true,
    'appointments:view': true,
    'appointments:create': true,
    'appointments:edit': true,
    'appointments:delete': true,
    'workshop_info:view': true,
  },
};

const Permissions = () => {
  const { user: currentUser } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<'admin' | 'mechanic' | 'financial' | 'attendant'>('attendant');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [showHiddenModules, setShowHiddenModules] = useState(false);
  const [showModuleSettings, setShowModuleSettings] = useState(false);
  const [moduleSettings, setModuleSettings] = useState<Array<{ module: string; hidden: boolean }>>([]);
  const [loadingModuleSettings, setLoadingModuleSettings] = useState(false);

  const isAdmin = currentUser?.profile === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadPermissions();
    }
  }, [selectedProfile, isAdmin, showHiddenModules]);

  useEffect(() => {
    if (isAdmin && showModuleSettings) {
      loadModuleSettings();
    }
  }, [isAdmin, showModuleSettings]);

  useEffect(() => {
    // Verificar se há mudanças
    const changed = JSON.stringify(permissions) !== JSON.stringify(originalPermissions);
    setHasChanges(changed);
  }, [permissions, originalPermissions]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const includeHidden = showHiddenModules ? 'true' : 'false';
      const response = await api.get(`/permissions/profile/${selectedProfile}`, {
        params: { includeHidden },
      });
      setPermissions(response.data);
      setOriginalPermissions(JSON.parse(JSON.stringify(response.data)));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar permissões');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadModuleSettings = async () => {
    try {
      setLoadingModuleSettings(true);
      const response = await api.get('/module-settings');
      setModuleSettings(response.data.map((s: any) => ({ module: s.module, hidden: s.hidden })));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar configurações de módulos');
      console.error(error);
    } finally {
      setLoadingModuleSettings(false);
    }
  };

  const handleToggleModuleVisibility = async (module: string, hidden: boolean) => {
    try {
      await api.put(`/module-settings/${module}/visibility`, { hidden });
      
      // Atualizar estado local
      setModuleSettings(prev => {
        const existing = prev.find(m => m.module === module);
        if (existing) {
          return prev.map(m => m.module === module ? { ...m, hidden } : m);
        } else {
          return [...prev, { module, hidden }];
        }
      });
      
      // Sempre recarregar permissões para refletir mudanças
      await loadPermissions();
      
      toast.success(`Módulo ${hidden ? 'ocultado' : 'exibido'} com sucesso!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar visibilidade do módulo');
      console.error(error);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setPermissions(prev =>
      prev.map(perm =>
        perm.id === permissionId ? { ...perm, granted: !perm.granted } : perm
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const permissionsToUpdate = permissions.map(perm => ({
        permission_id: perm.id,
        granted: perm.granted,
      }));

      await api.put(`/permissions/profile/${selectedProfile}`, {
        permissions: permissionsToUpdate,
      });

      toast.success('Permissões atualizadas com sucesso!');
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar permissões');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
    setHasChanges(false);
  };

  const handleApplyTemplate = () => {
    if (selectedProfile === 'admin') {
      toast.error('Não é possível aplicar template ao perfil Administrador');
      return;
    }

    const template = permissionTemplates[selectedProfile];
    if (!template) {
      toast.error('Template não encontrado para este perfil');
      return;
    }

    const updated = permissions.map(perm => {
      const key = `${perm.module}:${perm.action}`;
      return {
        ...perm,
        granted: template[key] || false,
      };
    });

    setPermissions(updated);
    toast.success('Template aplicado com sucesso!');
  };

  // Agrupar permissões por módulo
  const groupedPermissions = useMemo(() => {
    let filtered = permissions;

    // Filtrar módulos ocultos se showHiddenModules for false (camada extra de segurança)
    if (!showHiddenModules && moduleSettings.length > 0) {
      const hiddenModules = moduleSettings.filter(s => s.hidden).map(s => s.module);
      filtered = filtered.filter(perm => !hiddenModules.includes(perm.module));
    }

    // Filtrar por módulo
    if (selectedModule !== 'all') {
      filtered = filtered.filter(perm => perm.module === selectedModule);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(perm => {
        const moduleLabel = moduleLabels[perm.module] || perm.module;
        const actionLabel = actionLabels[perm.action] || perm.action;
        const description = perm.description || '';
        return (
          moduleLabel.toLowerCase().includes(term) ||
          actionLabel.toLowerCase().includes(term) ||
          description.toLowerCase().includes(term) ||
          perm.module.toLowerCase().includes(term) ||
          perm.action.toLowerCase().includes(term)
        );
      });
    }

    // Agrupar por módulo
    return filtered.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions, selectedModule, searchTerm, showHiddenModules, moduleSettings]);

  // Obter lista de módulos únicos para o filtro
  const availableModules = useMemo(() => {
    const modules = Array.from(new Set(permissions.map(p => p.module)));
    return modules.sort();
  }, [permissions]);

  if (!isAdmin) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <Shield size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2>Acesso Restrito</h2>
        <p>Apenas administradores podem gerenciar permissões.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <SkeletonLoader type="text" lines={2} width="40%" height="32px" />
        <div style={{ marginTop: '2rem' }}>
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          Permissões
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Gerencie as permissões de acesso por perfil
        </p>
      </div>

      {/* Profile Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
          Selecionar Perfil
        </label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <select
            value={selectedProfile}
            onChange={(e) => {
              setSelectedProfile(e.target.value as any);
              setSearchTerm('');
              setSelectedModule('all');
            }}
            style={{
              width: '300px',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              backgroundColor: 'white',
            }}
          >
            <option value="admin">Administrador</option>
            <option value="mechanic">Mecânico</option>
            <option value="financial">Financeiro</option>
            <option value="attendant">Atendente</option>
          </select>
          {selectedProfile !== 'admin' && (
            <button
              onClick={handleApplyTemplate}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Layers size={18} />
              Aplicar Template
            </button>
          )}
        </div>
        {selectedProfile === 'admin' && (
          <p style={{ fontSize: '0.875rem', color: '#f59e0b', marginTop: '0.5rem' }}>
            ⚠️ O perfil Administrador tem todas as permissões por padrão
          </p>
        )}
      </div>

      {/* Module Settings Toggle */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => setShowModuleSettings(!showModuleSettings)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: showModuleSettings ? '#f97316' : 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: showModuleSettings ? 'white' : '#64748b',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <Settings size={18} />
          {showModuleSettings ? 'Ocultar Configurações' : 'Gerenciar Visibilidade de Módulos'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' }}>
          <input
            type="checkbox"
            checked={showHiddenModules}
            onChange={(e) => setShowHiddenModules(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          Mostrar módulos ocultos
        </label>
      </div>

      {/* Module Settings Panel */}
      {showModuleSettings && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0' 
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
            Configuração de Visibilidade de Módulos
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Clique no ícone de olho para ocultar ou exibir módulos. Módulos ocultos não aparecerão nas permissões por padrão.
          </p>
          {loadingModuleSettings ? (
            <SkeletonLoader type="text" lines={3} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {availableModules.map(module => {
                const setting = moduleSettings.find(s => s.module === module);
                const isHidden = setting?.hidden || false;
                return (
                  <div
                    key={module}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${isHidden ? '#fecaca' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.875rem' }}>
                      {moduleLabels[module] || module}
                    </span>
                    <button
                      onClick={() => handleToggleModuleVisibility(module, !isHidden)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isHidden ? '#ef4444' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={isHidden ? 'Exibir módulo' : 'Ocultar módulo'}
                    >
                      {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por módulo, ação ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <Filter size={20} style={{ marginRight: '0.5rem', color: '#94a3b8', display: 'inline-block', verticalAlign: 'middle' }} />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              backgroundColor: 'white',
            }}
          >
            <option value="all">Todos os Módulos</option>
            {availableModules.map(module => (
              <option key={module} value={module}>
                {moduleLabels[module] || module}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions Bar */}
      {hasChanges && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#92400e', fontWeight: '500' }}>
            Você tem alterações não salvas
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#92400e',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <RefreshCw size={16} />
              Desfazer
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f97316',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                color: 'white',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Permissions List */}
      {Object.keys(groupedPermissions).length === 0 ? (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center', 
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <Search size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Nenhuma permissão encontrada com os filtros selecionados
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(groupedPermissions).map(([module, perms]) => (
          <div
            key={module}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              overflow: 'hidden',
              opacity: moduleSettings.find(s => s.module === module)?.hidden ? 0.6 : 1,
            }}
          >
            <div
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: moduleSettings.find(s => s.module === module)?.hidden ? '#fef2f2' : '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {moduleLabels[module] || module}
                {moduleSettings.find(s => s.module === module)?.hidden && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: 'normal' }}>
                    (Oculto)
                  </span>
                )}
              </span>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {perms.map((perm) => (
                  <label
                    key={perm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: perm.granted ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${perm.granted ? '#86efac' : '#fecaca'}`,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = perm.granted ? '#dcfce7' : '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = perm.granted ? '#f0fdf4' : '#fef2f2';
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={perm.granted}
                        onChange={() => handleTogglePermission(perm.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#10b981',
                        }}
                        disabled={selectedProfile === 'admin'}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.875rem' }}>
                        {actionLabels[perm.action] || perm.action}
                      </div>
                      {perm.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {perm.description}
                        </div>
                      )}
                    </div>
                    {perm.granted ? (
                      <Check size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    ) : (
                      <X size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Save Button (Fixed) */}
      {hasChanges && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            gap: '0.75rem',
            zIndex: 100,
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: '500',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={18} />
            Desfazer
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f97316',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              color: 'white',
              fontWeight: '600',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Permissions;
