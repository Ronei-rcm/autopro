-- Migration: Sistema de Permissões Granular
-- Criado em: Janeiro 2025

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(module, action)
);

-- Tabela de permissões por perfil
CREATE TABLE IF NOT EXISTS profile_permissions (
  id SERIAL PRIMARY KEY,
  profile VARCHAR(50) NOT NULL,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile, permission_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profile_permissions_profile ON profile_permissions(profile);
CREATE INDEX IF NOT EXISTS idx_profile_permissions_permission ON profile_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions(module, action);

-- Inserir permissões padrão
INSERT INTO permissions (module, action, description) VALUES
-- Clientes
('clients', 'view', 'Visualizar clientes'),
('clients', 'create', 'Criar clientes'),
('clients', 'edit', 'Editar clientes'),
('clients', 'delete', 'Excluir clientes'),

-- Veículos
('vehicles', 'view', 'Visualizar veículos'),
('vehicles', 'create', 'Criar veículos'),
('vehicles', 'edit', 'Editar veículos'),
('vehicles', 'delete', 'Excluir veículos'),

-- Fornecedores
('suppliers', 'view', 'Visualizar fornecedores'),
('suppliers', 'create', 'Criar fornecedores'),
('suppliers', 'edit', 'Editar fornecedores'),
('suppliers', 'delete', 'Excluir fornecedores'),

-- Estoque
('inventory', 'view', 'Visualizar estoque'),
('inventory', 'create', 'Criar produtos'),
('inventory', 'edit', 'Editar produtos'),
('inventory', 'delete', 'Excluir produtos'),
('inventory', 'movement', 'Fazer movimentações de estoque'),

-- Orçamentos
('quotes', 'view', 'Visualizar orçamentos'),
('quotes', 'create', 'Criar orçamentos'),
('quotes', 'edit', 'Editar orçamentos'),
('quotes', 'delete', 'Excluir orçamentos'),
('quotes', 'approve', 'Aprovar orçamentos'),
('quotes', 'convert', 'Converter orçamento em OS'),

-- Ordens de Serviço
('orders', 'view', 'Visualizar ordens de serviço'),
('orders', 'create', 'Criar ordens de serviço'),
('orders', 'edit', 'Editar ordens de serviço'),
('orders', 'delete', 'Excluir ordens de serviço'),
('orders', 'start', 'Iniciar ordem de serviço'),
('orders', 'finish', 'Finalizar ordem de serviço'),
('orders', 'cancel', 'Cancelar ordem de serviço'),
('orders', 'print', 'Imprimir ordem de serviço'),

-- Agenda
('appointments', 'view', 'Visualizar agendamentos'),
('appointments', 'create', 'Criar agendamentos'),
('appointments', 'edit', 'Editar agendamentos'),
('appointments', 'delete', 'Excluir agendamentos'),

-- Financeiro
('financial', 'view', 'Visualizar financeiro'),
('financial', 'payables_view', 'Visualizar contas a pagar'),
('financial', 'payables_create', 'Criar contas a pagar'),
('financial', 'payables_edit', 'Editar contas a pagar'),
('financial', 'payables_delete', 'Excluir contas a pagar'),
('financial', 'receivables_view', 'Visualizar contas a receber'),
('financial', 'receivables_create', 'Criar contas a receber'),
('financial', 'receivables_edit', 'Editar contas a receber'),
('financial', 'receivables_delete', 'Excluir contas a receber'),
('financial', 'payment', 'Registrar pagamentos/recebimentos'),

-- Relatórios
('reports', 'view', 'Visualizar relatórios'),
('reports', 'export', 'Exportar relatórios'),

-- Configurações
('settings', 'view', 'Visualizar configurações'),
('settings', 'edit', 'Editar configurações'),

-- Usuários
('users', 'view', 'Visualizar usuários'),
('users', 'create', 'Criar usuários'),
('users', 'edit', 'Editar usuários'),
('users', 'delete', 'Excluir usuários'),
('users', 'manage_permissions', 'Gerenciar permissões de usuários'),

-- Garantias
('warranties', 'view', 'Visualizar garantias'),
('warranties', 'create', 'Criar garantias'),
('warranties', 'edit', 'Editar garantias'),
('warranties', 'delete', 'Excluir garantias'),

-- Templates
('templates', 'view', 'Visualizar templates'),
('templates', 'create', 'Criar templates'),
('templates', 'edit', 'Editar templates'),
('templates', 'delete', 'Excluir templates'),

-- Informações da Oficina
('workshop_info', 'view', 'Visualizar informações da oficina'),
('workshop_info', 'edit', 'Editar informações da oficina')

ON CONFLICT (module, action) DO NOTHING;

-- Permissões padrão para ADMIN (todas as permissões)
INSERT INTO profile_permissions (profile, permission_id, granted)
SELECT 'admin', id, true
FROM permissions
ON CONFLICT (profile, permission_id) DO NOTHING;

-- Permissões padrão para MECANICO
INSERT INTO profile_permissions (profile, permission_id, granted)
SELECT 'mechanic', permission_id, granted FROM (
  VALUES
    -- Clientes
    ((SELECT id FROM permissions WHERE module = 'clients' AND action = 'view'), true)::INTEGER,
    ('mechanic', (SELECT id FROM permissions WHERE module = 'clients' AND action = 'create'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'clients' AND action = 'edit'), true),
    -- Veículos
    ('mechanic', (SELECT id FROM permissions WHERE module = 'vehicles' AND action = 'view'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'vehicles' AND action = 'create'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'vehicles' AND action = 'edit'), true),
    -- Estoque
    ('mechanic', (SELECT id FROM permissions WHERE module = 'inventory' AND action = 'view'), true),
    -- Orçamentos
    ('mechanic', (SELECT id FROM permissions WHERE module = 'quotes' AND action = 'view'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'quotes' AND action = 'create'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'quotes' AND action = 'edit'), true),
    -- Ordens de Serviço
    ('mechanic', (SELECT id FROM permissions WHERE module = 'orders' AND action = 'view'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'orders' AND action = 'create'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'orders' AND action = 'edit'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'orders' AND action = 'start'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'orders' AND action = 'finish'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'orders' AND action = 'print'), true),
    -- Agenda
    ('mechanic', (SELECT id FROM permissions WHERE module = 'appointments' AND action = 'view'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'appointments' AND action = 'create'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'appointments' AND action = 'edit'), true),
    -- Garantias
    ('mechanic', (SELECT id FROM permissions WHERE module = 'warranties' AND action = 'view'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'warranties' AND action = 'create'), true),
    ('mechanic', (SELECT id FROM permissions WHERE module = 'warranties' AND action = 'edit'), true),
    -- Templates
    ('mechanic', (SELECT id FROM permissions WHERE module = 'templates' AND action = 'view'), true),
    -- Informações da Oficina
    ('mechanic', (SELECT id FROM permissions WHERE module = 'workshop_info' AND action = 'view'), true)
) AS perms(profile, permission_id, granted)
WHERE permission_id IS NOT NULL
ON CONFLICT (profile, permission_id) DO NOTHING;

-- Permissões padrão para FINANCEIRO
INSERT INTO profile_permissions (profile, permission_id, granted)
SELECT 'financial', permission_id, granted FROM (
  VALUES
    -- Clientes
    ((SELECT id FROM permissions WHERE module = 'clients' AND action = 'view'), true),
    -- Veículos
    ((SELECT id FROM permissions WHERE module = 'vehicles' AND action = 'view'), true),
    -- Estoque
    ((SELECT id FROM permissions WHERE module = 'inventory' AND action = 'view'), true),
    -- Orçamentos
    ((SELECT id FROM permissions WHERE module = 'quotes' AND action = 'view'), true),
    -- Ordens de Serviço
    ((SELECT id FROM permissions WHERE module = 'orders' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'orders' AND action = 'print'), true),
    -- Financeiro (todas)
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'payables_view'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'payables_create'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'payables_edit'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'payables_delete'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'receivables_view'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'receivables_create'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'receivables_edit'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'receivables_delete'), true),
    ((SELECT id FROM permissions WHERE module = 'financial' AND action = 'payment'), true),
    -- Relatórios
    ((SELECT id FROM permissions WHERE module = 'reports' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'reports' AND action = 'export'), true),
    -- Informações da Oficina
    ((SELECT id FROM permissions WHERE module = 'workshop_info' AND action = 'view'), true)
) AS perms(permission_id, granted)
WHERE permission_id IS NOT NULL
ON CONFLICT (profile, permission_id) DO NOTHING;

-- Permissões padrão para ATENDENTE
INSERT INTO profile_permissions (profile, permission_id, granted)
SELECT 'attendant', permission_id, granted FROM (
  VALUES
    -- Clientes
    ((SELECT id FROM permissions WHERE module = 'clients' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'clients' AND action = 'create'), true),
    ((SELECT id FROM permissions WHERE module = 'clients' AND action = 'edit'), true),
    -- Veículos
    ((SELECT id FROM permissions WHERE module = 'vehicles' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'vehicles' AND action = 'create'), true),
    ((SELECT id FROM permissions WHERE module = 'vehicles' AND action = 'edit'), true),
    -- Estoque
    ((SELECT id FROM permissions WHERE module = 'inventory' AND action = 'view'), true),
    -- Orçamentos
    ((SELECT id FROM permissions WHERE module = 'quotes' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'quotes' AND action = 'create'), true),
    ((SELECT id FROM permissions WHERE module = 'quotes' AND action = 'edit'), true),
    -- Ordens de Serviço
    ((SELECT id FROM permissions WHERE module = 'orders' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'orders' AND action = 'create'), true),
    ((SELECT id FROM permissions WHERE module = 'orders' AND action = 'edit'), true),
    ((SELECT id FROM permissions WHERE module = 'orders' AND action = 'print'), true),
    -- Agenda
    ((SELECT id FROM permissions WHERE module = 'appointments' AND action = 'view'), true),
    ((SELECT id FROM permissions WHERE module = 'appointments' AND action = 'create'), true),
    ((SELECT id FROM permissions WHERE module = 'appointments' AND action = 'edit'), true),
    ((SELECT id FROM permissions WHERE module = 'appointments' AND action = 'delete'), true),
    -- Informações da Oficina
    ((SELECT id FROM permissions WHERE module = 'workshop_info' AND action = 'view'), true)
) AS perms(permission_id, granted)
WHERE permission_id IS NOT NULL
ON CONFLICT (profile, permission_id) DO NOTHING;
