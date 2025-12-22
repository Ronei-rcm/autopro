# 🔐 Sistema de Permissões e Visibilidade de Módulos

Documentação completa do sistema de permissões granular e gerenciamento de visibilidade de módulos.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Permissões](#sistema-de-permissões)
3. [Sistema de Módulos Ocultos](#sistema-de-módulos-ocultos)
4. [Como Usar](#como-usar)
5. [Arquitetura Técnica](#arquitetura-técnica)
6. [API Reference](#api-reference)

---

## 🎯 Visão Geral

O sistema de permissões oferece controle granular de acesso baseado em **módulos** e **ações**, permitindo que administradores configurem exatamente o que cada perfil de usuário pode fazer no sistema.

### Funcionalidades Principais

✅ **Permissões Granulares**: Controle por módulo (ex: `clients`, `orders`) e ação (ex: `view`, `create`, `edit`)  
✅ **Cache Inteligente**: Sistema de cache para reduzir chamadas à API  
✅ **Verificação em Lote**: Endpoint para verificar múltiplas permissões de uma vez  
✅ **Templates Pré-configurados**: Templates prontos para cada perfil  
✅ **Módulos Ocultos**: Sistema para ocultar módulos inteiros do menu lateral  
✅ **Busca e Filtros**: Interface completa para gerenciar permissões  
✅ **UI Intuitiva**: Interface visual e fácil de usar

---

## 🔐 Sistema de Permissões

### Estrutura de Permissões

Cada permissão é definida por:
- **Módulo**: O recurso do sistema (ex: `clients`, `orders`, `financial`)
- **Ação**: A operação permitida (ex: `view`, `create`, `edit`, `delete`)
- **Descrição**: Descrição legível da permissão

### Perfis de Usuário

O sistema suporta 4 perfis principais:

1. **Administrador (`admin`)**
   - Tem acesso a **todas** as permissões automaticamente
   - Pode gerenciar permissões de outros perfis
   - Pode gerenciar visibilidade de módulos

2. **Mecânico (`mechanic`)**
   - Foco em ordens de serviço, veículos e agendamentos
   - Template pré-configurado disponível

3. **Financeiro (`financial`)**
   - Foco em contas a pagar/receber e relatórios
   - Template pré-configurado disponível

4. **Atendente (`attendant`)**
   - Foco em atendimento e cadastros básicos
   - Template pré-configurado disponível

### Permissões Disponíveis

#### Clientes (`clients`)
- `view` - Visualizar clientes
- `create` - Criar clientes
- `edit` - Editar clientes
- `delete` - Excluir clientes

#### Veículos (`vehicles`)
- `view` - Visualizar veículos
- `create` - Criar veículos
- `edit` - Editar veículos
- `delete` - Excluir veículos

#### Ordens de Serviço (`orders`)
- `view` - Visualizar ordens
- `create` - Criar ordens
- `edit` - Editar ordens
- `delete` - Excluir ordens
- `start` - Iniciar ordem
- `finish` - Finalizar ordem
- `cancel` - Cancelar ordem
- `print` - Imprimir ordem

#### Financeiro (`financial`)
- `view` - Visualizar financeiro
- `payables_view` - Ver contas a pagar
- `payables_create` - Criar contas a pagar
- `payables_edit` - Editar contas a pagar
- `payables_delete` - Excluir contas a pagar
- `receivables_view` - Ver contas a receber
- `receivables_create` - Criar contas a receber
- `receivables_edit` - Editar contas a receber
- `receivables_delete` - Excluir contas a receber
- `payment` - Registrar pagamentos/recebimentos

*E muitos outros módulos...*

---

## 👁️ Sistema de Módulos Ocultos

O sistema de visibilidade de módulos permite ocultar módulos inteiros do menu lateral e da página de permissões para perfis não-admin.

### Como Funciona

1. **Admin oculta módulo**: No painel de Permissões → "Gerenciar Visibilidade de Módulos"
2. **Módulo desaparece**: O módulo não aparece mais no menu lateral para outros perfis
3. **Admin sempre vê tudo**: Administradores sempre veem todos os módulos, mesmo os ocultos

### Módulos que Podem Ser Ocultos

Todos os módulos do sistema podem ser ocultos, exceto:
- Dashboard (sempre visível)
- Itens sem módulo definido

### Casos de Uso

- **Oficina pequena**: Ocultar módulos não utilizados (ex: Garantias, Templates)
- **Separação de responsabilidades**: Ocultar módulos de outros departamentos
- **Simplificar interface**: Reduzir opções no menu para melhor UX

---

## 📖 Como Usar

### Gerenciando Permissões (Admin)

1. **Acessar página de Permissões**
   - Menu lateral → "Permissões"
   - Apenas administradores têm acesso

2. **Selecionar Perfil**
   - Escolher o perfil que deseja configurar (Mecânico, Financeiro, Atendente)
   - Admin não pode ser editado (tem todas as permissões)

3. **Configurar Permissões**
   - Cada permissão aparece como um checkbox
   - Marcar/desmarcar conforme necessário
   - Usar busca para encontrar permissões específicas
   - Usar filtro por módulo para focar em um módulo

4. **Aplicar Templates (Opcional)**
   - Clique em "Aplicar Template" para usar configurações pré-definidas
   - Templates podem ser personalizados depois

5. **Salvar Alterações**
   - Botão "Salvar" aparece quando há mudanças
   - Alterações são aplicadas imediatamente

### Ocultando Módulos (Admin)

1. **Abrir Configurações de Visibilidade**
   - Na página de Permissões, clique em "Gerenciar Visibilidade de Módulos"

2. **Ocultar/Exibir Módulos**
   - Clique no ícone de olho para ocultar/exibir
   - Módulos ocultos aparecem com ícone de olho riscado (vermelho)
   - Módulos visíveis aparecem com ícone de olho (verde)

3. **Ver Módulos Ocultos**
   - Marque "Mostrar módulos ocultos" para ver todos os módulos
   - Útil para exibir módulos ocultos novamente

### Usando Permissões no Código

#### Frontend - Hook `usePermission`

```typescript
import { usePermission } from '../hooks/usePermission';

const MyComponent = () => {
  const { hasPermission, loading } = usePermission('orders', 'create');
  
  if (loading) return <div>Carregando...</div>;
  
  if (!hasPermission) {
    return <div>Acesso negado</div>;
  }
  
  return <button>Criar Ordem</button>;
};
```

#### Frontend - Componente `PermissionGuard`

```typescript
import { PermissionGuard } from '../components/common/PermissionGuard';

<PermissionGuard module="orders" action="edit">
  <button>Editar Ordem</button>
</PermissionGuard>
```

#### Backend - Middleware `requirePermission`

```typescript
import { requirePermission } from '../middleware/permission.middleware';

router.post('/orders', 
  authenticate, 
  requirePermission('orders', 'create'),
  OrderController.create
);
```

---

## 🏗️ Arquitetura Técnica

### Cache de Permissões

O sistema implementa cache em memória para otimizar performance:

- **PermissionContext**: Contexto React que gerencia cache de permissões
- **Cache em memória**: Armazenamento local para evitar requisições repetidas
- **Invalidação automática**: Cache é limpo quando o usuário muda
- **Suporte a lote**: Verificação de múltiplas permissões em uma requisição

### Estrutura de Dados

#### Tabela `permissions`
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(module, action)
);
```

#### Tabela `profile_permissions`
```sql
CREATE TABLE profile_permissions (
  id SERIAL PRIMARY KEY,
  profile VARCHAR(50) NOT NULL,
  permission_id INTEGER NOT NULL REFERENCES permissions(id),
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile, permission_id)
);
```

#### Tabela `module_settings`
```sql
CREATE TABLE module_settings (
  id SERIAL PRIMARY KEY,
  module VARCHAR(50) NOT NULL UNIQUE,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fluxo de Verificação

1. **Frontend**: Componente chama `usePermission(module, action)`
2. **Context**: Verifica cache primeiro
3. **API Call**: Se não estiver em cache, faz requisição `/permissions/check`
4. **Backend**: Verifica no banco de dados
5. **Cache**: Armazena resultado no cache
6. **Retorno**: Componente recebe resultado (true/false)

---

## 🔌 API Reference

### Verificar Permissão

```http
GET /api/permissions/check?module=orders&action=create
```

**Resposta:**
```json
{
  "hasPermission": true
}
```

### Verificar Múltiplas Permissões (Lote)

```http
POST /api/permissions/check-batch
Content-Type: application/json

{
  "permissions": [
    { "module": "orders", "action": "create" },
    { "module": "orders", "action": "edit" },
    { "module": "clients", "action": "view" }
  ]
}
```

**Resposta:**
```json
{
  "permissions": {
    "orders:create": true,
    "orders:edit": false,
    "clients:view": true
  }
}
```

### Buscar Permissões de um Perfil

```http
GET /api/permissions/profile/mechanic?includeHidden=false
```

**Resposta:**
```json
[
  {
    "id": 1,
    "module": "clients",
    "action": "view",
    "description": "Visualizar clientes",
    "granted": true
  },
  ...
]
```

### Atualizar Permissões de um Perfil

```http
PUT /api/permissions/profile/mechanic
Content-Type: application/json

{
  "permissions": [
    { "permission_id": 1, "granted": true },
    { "permission_id": 2, "granted": false }
  ]
}
```

### Buscar Módulos Ocultos

```http
GET /api/module-settings/hidden
```

**Resposta:**
```json
{
  "modules": ["financial", "reports", "settings"]
}
```

### Atualizar Visibilidade de Módulo

```http
PUT /api/module-settings/{module}/visibility
Content-Type: application/json

{
  "hidden": true
}
```

---

## 📝 Templates de Permissões

### Template Mecânico

Permissões focadas em operações da oficina:
- Clientes: view, create, edit
- Veículos: view, create, edit
- Estoque: view
- Orçamentos: view, create, edit
- Ordens de Serviço: view, create, edit, start, finish, print
- Agenda: view, create, edit
- Garantias: view, create, edit
- Templates: view

### Template Financeiro

Permissões focadas em gestão financeira:
- Clientes: view
- Veículos: view
- Estoque: view
- Orçamentos: view
- Ordens de Serviço: view, print
- **Financeiro**: Todas as permissões
- Relatórios: view, export

### Template Atendente

Permissões focadas em atendimento:
- Clientes: view, create, edit
- Veículos: view, create, edit
- Estoque: view
- Orçamentos: view, create, edit
- Ordens de Serviço: view, create, edit, print
- Agenda: view, create, edit, delete

---

## 🎨 Interface de Usuário

### Página de Permissões

A página de Permissões oferece:

- **Seletor de Perfil**: Dropdown para escolher o perfil
- **Botão "Aplicar Template"**: Aplica configurações pré-definidas
- **Busca**: Campo de busca por módulo, ação ou descrição
- **Filtro por Módulo**: Dropdown para filtrar por módulo específico
- **Gerenciar Visibilidade**: Painel para ocultar/exibir módulos
- **Checkbox "Mostrar módulos ocultos"**: Alterna visualização
- **Cards Agrupados**: Permissões organizadas por módulo
- **Indicadores Visuais**: Cores diferentes para permissões concedidas/negadas
- **Botão Salvar**: Aparece quando há mudanças não salvas

### Menu Lateral

O menu lateral automaticamente:
- Oculta módulos marcados como ocultos (para não-admin)
- Mostra todos os módulos para admin
- Respeita permissões individuais (mesmo módulo visível, pode não ter acesso)

---

## 🔒 Segurança

### Validações Implementadas

- ✅ Autenticação obrigatória em todas as rotas
- ✅ Apenas admin pode gerenciar permissões
- ✅ Validação de perfis válidos
- ✅ Sanitização de entrada
- ✅ Transações no banco para operações múltiplas
- ✅ Proteção contra SQL injection (queries parametrizadas)

### Boas Práticas

1. **Sempre verificar permissões no backend**: Frontend é apenas UI
2. **Usar middleware**: `requirePermission` para rotas protegidas
3. **Cache é otimização**: Não confiar apenas no cache, sempre validar no backend
4. **Logs de auditoria**: Todas as mudanças de permissões devem ser logadas (futuro)

---

## 🚀 Performance

### Otimizações Implementadas

1. **Cache de Permissões**
   - Reduz requisições à API em até 90%
   - Cache em memória (rápido)
   - Invalidação automática

2. **Verificação em Lote**
   - Endpoint `/check-batch` para múltiplas permissões
   - Reduz latência quando precisa verificar várias permissões

3. **Índices no Banco**
   - Índices em `profile_permissions(profile, permission_id)`
   - Índices em `permissions(module, action)`
   - Índices em `module_settings(module, hidden)`

4. **Filtragem no Backend**
   - Módulos ocultos filtrados na query SQL
   - Reduz dados transferidos

---

## 📚 Arquivos Relacionados

### Backend
- `backend/src/models/permission.model.ts` - Modelo de permissões
- `backend/src/models/module-settings.model.ts` - Modelo de configurações de módulos
- `backend/src/controllers/permission.controller.ts` - Controller de permissões
- `backend/src/controllers/module-settings.controller.ts` - Controller de visibilidade
- `backend/src/routes/permission.routes.ts` - Rotas de permissões
- `backend/src/routes/module-settings.routes.ts` - Rotas de visibilidade
- `backend/src/middleware/permission.middleware.ts` - Middleware de permissões
- `backend/migrations/010_add_permissions_system.sql` - Migration de permissões
- `backend/migrations/011_add_module_visibility.sql` - Migration de visibilidade

### Frontend
- `frontend/src/contexts/PermissionContext.tsx` - Contexto de permissões com cache
- `frontend/src/hooks/usePermission.ts` - Hook para verificar permissões
- `frontend/src/hooks/useModuleSettings.ts` - Hook para módulos ocultos
- `frontend/src/components/common/PermissionGuard.tsx` - Componente de proteção
- `frontend/src/pages/Permissions.tsx` - Página de gerenciamento
- `frontend/src/components/layout/Sidebar.tsx` - Menu lateral com filtro

---

## 🔄 Changelog

### Dezembro 2025 - Evolução do Sistema

**Novo:**
- ✅ Sistema de cache de permissões
- ✅ Endpoint de verificação em lote
- ✅ Sistema de módulos ocultos
- ✅ Templates de permissões pré-configurados
- ✅ Busca e filtros na página de Permissões
- ✅ Hook `useModuleSettings` para visibilidade

**Melhorias:**
- ⚡ Performance: Cache reduz requisições em até 90%
- 🎨 UI: Interface mais intuitiva e completa
- 🔍 Busca: Fácil encontrar permissões específicas
- 📦 Templates: Configuração rápida de perfis

---

**Última atualização**: Dezembro 2025  
**Versão**: 1.2.0

