import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, FileText, CheckSquare, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface Checklist {
  id: number;
  name: string;
  description?: string;
  category?: string;
  active: boolean;
  items?: ChecklistItem[];
}

interface ChecklistItem {
  id: number;
  description: string;
  item_type: 'check' | 'measure' | 'observation';
  required: boolean;
  sort_order: number;
}

const Checklists = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; checklist: Checklist | null }>({
    isOpen: false,
    checklist: null,
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    active: true,
  });
  const [checklistItems, setChecklistItems] = useState<Omit<ChecklistItem, 'id' | 'sort_order'>[]>([]);
  const [itemFormData, setItemFormData] = useState({
    description: '',
    item_type: 'check' as 'check' | 'measure' | 'observation',
    required: false,
  });

  useEffect(() => {
    loadChecklists();
  }, [search]);

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/checklists');
      setChecklists(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar checklists');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      active: true,
    });
    setChecklistItems([]);
    setItemFormData({
      description: '',
      item_type: 'check',
      required: false,
    });
    setEditingChecklist(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        items: checklistItems.map((item, index) => ({
          ...item,
          sort_order: index,
        })),
      };

      if (editingChecklist) {
        await api.put(`/checklists/${editingChecklist.id}`, data);
        toast.success('Checklist atualizado com sucesso!');
      } else {
        await api.post('/checklists', data);
        toast.success('Checklist criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadChecklists();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar checklist');
    }
  };

  const handleEdit = (checklist: Checklist) => {
    setEditingChecklist(checklist);
    setFormData({
      name: checklist.name,
      description: checklist.description || '',
      category: checklist.category || '',
      active: checklist.active,
    });
    setChecklistItems(
      checklist.items?.map((item) => ({
        description: item.description,
        item_type: item.item_type,
        required: item.required,
      })) || []
    );
    setShowModal(true);
  };

  const handleDeleteClick = (checklist: Checklist) => {
    setDeleteConfirm({ isOpen: true, checklist });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.checklist) return;

    try {
      await api.delete(`/checklists/${deleteConfirm.checklist.id}`);
      toast.success('Checklist excluído com sucesso!');
      setDeleteConfirm({ isOpen: false, checklist: null });
      loadChecklists();
    } catch (error: any) {
      toast.error('Erro ao excluir checklist');
      setDeleteConfirm({ isOpen: false, checklist: null });
    }
  };

  const handleAddItem = () => {
    if (!itemFormData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    const newItem: Omit<ChecklistItem, 'id' | 'sort_order'> = {
      description: itemFormData.description,
      item_type: itemFormData.item_type,
      required: itemFormData.required,
    };

    setChecklistItems([...checklistItems, newItem]);
    setItemFormData({
      description: '',
      item_type: 'check',
      required: false,
    });
  };

  const handleRemoveItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'check':
        return 'Verificação';
      case 'measure':
        return 'Medição';
      case 'observation':
        return 'Observação';
      default:
        return type;
    }
  };

  const filteredChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          checklist.name.toLowerCase().includes(searchLower) ||
          (checklist.description && checklist.description.toLowerCase().includes(searchLower)) ||
          (checklist.category && checklist.category.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [checklists, search]);

  const paginatedChecklists = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredChecklists.slice(start, start + itemsPerPage);
  }, [filteredChecklists, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredChecklists.length / itemsPerPage);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Checklists
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gerencie listas de verificação para padronizar serviços
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          <Plus size={20} />
          Novo Checklist
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            placeholder="Buscar checklists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <SkeletonLoader type="table" />
        ) : filteredChecklists.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Nenhum checklist encontrado
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Nome
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Descrição
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Categoria
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Itens
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedChecklists.map((checklist) => (
                <tr
                  key={checklist.id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckSquare size={20} color="#3b82f6" />
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{checklist.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {checklist.description || '-'}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {checklist.category || '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    {checklist.items?.length || 0}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        backgroundColor: checklist.active ? '#10b98120' : '#64748b20',
                        color: checklist.active ? '#10b981' : '#64748b',
                      }}
                    >
                      {checklist.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(checklist)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Editar"
                      >
                        <Edit size={16} color="#64748b" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(checklist)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredChecklists.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredChecklists.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o checklist "${deleteConfirm.checklist?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, checklist: null })}
      />

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingChecklist ? 'Editar Checklist' : 'Novo Checklist'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Revisão, Inspeção..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  Checklist ativo
                </label>
              </div>

              {/* Adicionar Item */}
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Adicionar Item ao Checklist</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 150px 100px', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Descrição *
                    </label>
                    <input
                      type="text"
                      value={itemFormData.description}
                      onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                      placeholder="Ex: Verificar nível de óleo"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Tipo
                    </label>
                    <select
                      value={itemFormData.item_type}
                      onChange={(e) => setItemFormData({ ...itemFormData, item_type: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="check">Verificação</option>
                      <option value="measure">Medição</option>
                      <option value="observation">Observação</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={itemFormData.required}
                        onChange={(e) => setItemFormData({ ...itemFormData, required: e.target.checked })}
                      />
                      Obrigatório
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Plus size={16} />
                  Adicionar Item
                </button>
              </div>

              {/* Lista de Itens */}
              {checklistItems.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Itens do Checklist ({checklistItems.length})
                  </h3>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Descrição
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Tipo
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Obrigatório
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {checklistItems.map((item, index) => (
                          <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                              {item.description}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                              {getItemTypeLabel(item.item_type)}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              {item.required ? (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    backgroundColor: '#ef444420',
                                    color: '#ef4444',
                                  }}
                                >
                                  Sim
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Não</span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#fee2e2',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title="Remover"
                              >
                                <X size={16} color="#ef4444" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {editingChecklist ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklists;
