import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, User as UserIcon, Mail, Shield, Ban, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../components/common/ToastEnhancer';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  email: string;
  name: string;
  profile: 'admin' | 'mechanic' | 'financial' | 'attendant';
  active: boolean;
  created_at: string;
  updated_at: string;
}

const profileLabels: Record<string, string> = {
  admin: 'Administrador',
  mechanic: 'Mecânico',
  financial: 'Financeiro',
  attendant: 'Atendente',
};

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile: 'attendant' as 'admin' | 'mechanic' | 'financial' | 'attendant',
    active: true,
  });

  const isAdmin = currentUser?.profile === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [search, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Erro ao carregar usuários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários localmente
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });
  }, [users, search]);

  // Paginação
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: any = {
          name: formData.name,
        };
        // Apenas admin pode alterar perfil e status
        if (isAdmin) {
          updateData.profile = formData.profile;
          updateData.active = formData.active;
        }
        await api.put(`/users/${editingUser.id}`, updateData);
        showSuccessToast(`Usuário "${formData.name}" atualizado com sucesso!`);
      } else {
        await api.post('/users', formData);
        showSuccessToast(`Usuário "${formData.name}" criado com sucesso!`);
      }
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Não preencher senha ao editar
      profile: user.profile,
      active: user.active,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.user) return;

    try {
      await api.delete(`/users/${deleteConfirm.user.id}`);
      showSuccessToast(`Usuário "${deleteConfirm.user.name}" desativado com sucesso!`);
      setDeleteConfirm({ isOpen: false, user: null });
      loadUsers();
    } catch (error: any) {
      showErrorToast(error.response?.data?.error || 'Erro ao desativar usuário');
      setDeleteConfirm({ isOpen: false, user: null });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      profile: 'attendant',
      active: true,
    });
    setEditingUser(null);
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <Shield size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2>Acesso Restrito</h2>
        <p>Apenas administradores podem gerenciar usuários.</p>
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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Usuários
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gerencie os usuários do sistema
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
          Novo Usuário
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
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                  Nome
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                  Email
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                  Perfil
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#f97316',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                          }}
                        >
                          {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={16} color="#64748b" />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: user.profile === 'admin' ? '#fee2e2' : '#dbeafe',
                          color: user.profile === 'admin' ? '#991b1b' : '#1e40af',
                        }}
                      >
                        {profileLabels[user.profile]}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {user.active ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                          <CheckCircle size={16} />
                          Ativo
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                          <Ban size={16} />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#64748b',
                          }}
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'transparent',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#ef4444',
                            }}
                            title="Desativar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '1.5rem' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e293b' }}>
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e293b' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingUser}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: editingUser ? '#f8fafc' : 'white',
                  }}
                />
                {editingUser && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Email não pode ser alterado
                  </p>
                )}
              </div>

              {!editingUser && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e293b' }}>
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Mínimo de 6 caracteres
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e293b' }}>
                  Perfil *
                </label>
                <select
                  value={formData.profile}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value as any })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="attendant">Atendente</option>
                  <option value="mechanic">Mecânico</option>
                  <option value="financial">Financeiro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {editingUser && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>Usuário Ativo</span>
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontWeight: '500',
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
                  {editingUser ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Desativar Usuário"
        message={`Tem certeza que deseja desativar o usuário "${deleteConfirm.user?.name}"?`}
        confirmText="Desativar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, user: null })}
        type="danger"
      />
    </div>
  );
};

export default Users;
