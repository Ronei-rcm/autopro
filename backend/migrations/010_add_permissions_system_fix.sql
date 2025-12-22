-- Script para inserir permissões padrão para perfis (corrigido)
-- Execute após a migration 010_add_permissions_system.sql

-- Limpar permissões existentes dos perfis (exceto admin)
DELETE FROM profile_permissions WHERE profile IN ('mechanic', 'financial', 'attendant');

-- Permissões padrão para MECANICO
INSERT INTO profile_permissions (profile, permission_id, granted)
SELECT 'mechanic', p.id, true
FROM permissions p
WHERE (p.module = 'clients' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'vehicles' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'inventory' AND p.action = 'view')
   OR (p.module = 'quotes' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'orders' AND p.action IN ('view', 'create', 'edit', 'start', 'finish', 'print'))
   OR (p.module = 'appointments' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'warranties' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'templates' AND p.action = 'view')
   OR (p.module = 'workshop_info' AND p.action = 'view')
ON CONFLICT (profile, permission_id) DO NOTHING;

-- Permissões padrão para FINANCEIRO
INSERT INTO profile_permissions (profile, permission_id, granted)
SELECT 'financial', p.id, true
FROM permissions p
WHERE (p.module = 'clients' AND p.action = 'view')
   OR (p.module = 'vehicles' AND p.action = 'view')
   OR (p.module = 'inventory' AND p.action = 'view')
   OR (p.module = 'quotes' AND p.action = 'view')
   OR (p.module = 'orders' AND p.action IN ('view', 'print'))
   OR (p.module = 'financial')
   OR (p.module = 'reports')
   OR (p.module = 'workshop_info' AND p.action = 'view')
ON CONFLICT (profile, permission_id) DO NOTHING;

-- Permissões padrão para ATENDENTE
INSERT INTO profile_permissions (profile, permission_id, granted)
SELECT 'attendant', p.id, true
FROM permissions p
WHERE (p.module = 'clients' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'vehicles' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'inventory' AND p.action = 'view')
   OR (p.module = 'quotes' AND p.action IN ('view', 'create', 'edit'))
   OR (p.module = 'orders' AND p.action IN ('view', 'create', 'edit', 'print'))
   OR (p.module = 'appointments' AND p.action IN ('view', 'create', 'edit', 'delete'))
   OR (p.module = 'workshop_info' AND p.action = 'view')
ON CONFLICT (profile, permission_id) DO NOTHING;
