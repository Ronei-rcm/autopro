# 🔔 Sistema de Notificações

## 🎯 Visão Geral

O sistema de notificações permite comunicação entre diferentes perfis do sistema, especialmente para alertar o financeiro sobre OS finalizadas que precisam gerar conta a receber.

---

## ✨ Funcionalidades

### 1. Notificações Automáticas

#### OS Finalizada → Financeiro
Quando uma OS é finalizada, o sistema automaticamente:
- ✅ Cria uma notificação para o perfil financeiro
- ✅ Inclui informações da OS (número, cliente, valor total)
- ✅ Adiciona link de ação rápida para gerar conta a receber
- ✅ Vincula a notificação à OS (reference_type e reference_id)

### 2. Painel de Notificações

#### Componente NotificationPanel
- ✅ Badge com contador de notificações não lidas
- ✅ Lista de notificações ordenadas por data
- ✅ Marcar como lida (individual ou todas)
- ✅ Ação rápida para navegar para página relacionada
- ✅ Atualização automática a cada 30 segundos

### 3. Integração com Dashboard

#### Dashboard Financeiro
- ✅ Painel de notificações no topo
- ✅ Seção destacada com OS finalizadas pendentes
- ✅ Botão de ação rápida para gerar conta a receber
- ✅ Link para ver todas as OS pendentes

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: notifications

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  profile VARCHAR(50) NOT NULL CHECK (profile IN ('admin', 'mechanic', 'financial', 'attendant')),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  action_url VARCHAR(255),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);
```

#### Campos:
- `user_id`: ID do usuário específico (NULL = notificação global para o perfil)
- `profile`: Perfil que deve receber a notificação
- `type`: Tipo da notificação (ex: 'order_finished')
- `title`: Título da notificação
- `message`: Mensagem completa
- `reference_type`: Tipo da referência (ex: 'order')
- `reference_id`: ID da referência (ex: ID da OS)
- `action_url`: URL para ação rápida
- `read`: Se foi lida ou não
- `created_at`: Data de criação
- `read_at`: Data de leitura

---

## 🔌 API Endpoints

### GET /api/notifications
Lista notificações do usuário atual.

**Query Params:**
- `unread_only` - Filtrar apenas não lidas (true/false)

**Response:**
```json
{
  "notifications": [...],
  "unreadCount": 3
}
```

### PUT /api/notifications/:id/read
Marca uma notificação como lida.

### PUT /api/notifications/read-all
Marca todas as notificações como lidas.

### DELETE /api/notifications/:id
Remove uma notificação.

---

## 🎨 Interface do Usuário

### Componente NotificationPanel

**Localização:** `frontend/src/components/notifications/NotificationPanel.tsx`

**Props:**
- `profile`: Perfil do usuário (para filtrar notificações)

**Funcionalidades:**
- Badge com contador de não lidas
- Modal com lista de notificações
- Botão para marcar todas como lidas
- Ação rápida para navegar para página relacionada
- Formatação de tempo relativo ("há 5min", "há 2h", etc.)

### Integração no Dashboard Financeiro

**Localização:** `frontend/src/components/dashboard/FinancialDashboard.tsx`

**Recursos:**
- Painel de notificações no topo direito
- Seção destacada com OS finalizadas pendentes
- Botão "Gerar Conta a Receber" em cada OS
- Link para ver todas as OS pendentes

---

## 🔄 Fluxo Completo

### 1. Finalização de OS
```
Mecânico finaliza OS
    ↓
Sistema cria notificação para financeiro
    ↓
Notificação aparece no dashboard financeiro
```

### 2. Ação do Financeiro
```
Financeiro vê notificação
    ↓
Clica em "Ação rápida" ou "Gerar Conta a Receber"
    ↓
Sistema abre página financeira com formulário preenchido
    ↓
Financeiro confirma criação da conta a receber
    ↓
OS sai da lista de pendentes
```

---

## 📊 Tipos de Notificação

### order_finished
**Quando:** OS é finalizada  
**Para:** Perfil financeiro  
**Conteúdo:**
- Número da OS
- Nome do cliente
- Valor total formatado
- Link para gerar conta a receber

**Exemplo:**
```json
{
  "type": "order_finished",
  "title": "OS #OS-2024-001 Finalizada",
  "message": "A ordem de serviço #OS-2024-001 do cliente João Silva foi finalizada. Valor total: R$ 450,00. Gere a conta a receber para continuar o processo.",
  "reference_type": "order",
  "reference_id": 123,
  "action_url": "/financeiro?order_id=123"
}
```

---

## 🛠️ Implementação Técnica

### Backend

#### Modelo: NotificationModel
**Localização:** `backend/src/models/notification.model.ts`

**Métodos:**
- `create()` - Criar notificação
- `findByProfile()` - Buscar por perfil
- `markAsRead()` - Marcar como lida
- `markAllAsRead()` - Marcar todas como lidas
- `countUnread()` - Contar não lidas
- `delete()` - Deletar notificação

#### Controller: NotificationController
**Localização:** `backend/src/controllers/notification.controller.ts`

#### Rotas: notification.routes.ts
**Localização:** `backend/src/routes/notification.routes.ts`

### Frontend

#### Hook: useModuleSettings (se necessário)
**Localização:** `frontend/src/hooks/useModuleSettings.ts`

#### Componente: NotificationPanel
**Localização:** `frontend/src/components/notifications/NotificationPanel.tsx`

---

## 🔐 Segurança

- ✅ Autenticação obrigatória em todos os endpoints
- ✅ Notificações filtradas por perfil do usuário
- ✅ Validação de dados de entrada
- ✅ Sanitização de mensagens

---

## 📈 Melhorias Futuras

- [ ] Notificações push em tempo real (WebSocket)
- [ ] Notificações por email
- [ ] Configuração de preferências de notificação
- [ ] Mais tipos de notificação (pagamentos vencidos, estoque baixo, etc.)
- [ ] Agrupamento de notificações similares
- [ ] Notificações programadas

---

## 📚 Documentação Relacionada

- [API.md](./api/API.md) - Documentação completa da API
- [ORDERS_MODULE.md](./ORDERS_MODULE.md) - Módulo de Ordens de Serviço
- [EVOLUCOES_IMPLEMENTADAS.md](./EVOLUCOES_IMPLEMENTADAS.md) - Evoluções implementadas

