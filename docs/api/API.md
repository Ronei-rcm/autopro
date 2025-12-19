# 📡 Documentação da API

## Base URL

```
http://localhost:3001/api
```

## Autenticação

Todas as rotas protegidas requerem um token JWT no header:

```
Authorization: Bearer <token>
```

---

## 🔐 Autenticação

### POST /auth/login
Login do usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "profile": "admin"
  }
}
```

### POST /auth/register
Registro de novo usuário (apenas admin).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "profile": "attendant"
}
```

### GET /auth/me
Retorna dados do usuário autenticado.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "profile": "admin",
  "active": true
}
```

---

## 👥 Clientes

### GET /clients
Lista todos os clientes.

**Query Params:**
- `search` - Busca por nome, CPF, CNPJ, email ou telefone
- `type` - Filtrar por tipo (PF ou PJ)
- `active` - Filtrar por status (true/false)

### GET /clients/:id
Busca um cliente específico.

### POST /clients
Cria um novo cliente.

**Body:**
```json
{
  "name": "João Silva",
  "type": "PF",
  "cpf": "123.456.789-00",
  "phone": "(51) 99999-9999",
  "email": "joao@email.com",
  "address_street": "Rua Exemplo",
  "address_number": "123",
  "address_city": "Porto Alegre",
  "address_state": "RS",
  "address_zipcode": "90000-000"
}
```

### PUT /clients/:id
Atualiza um cliente.

### DELETE /clients/:id
Remove um cliente.

---

## 🚗 Veículos

### GET /vehicles
Lista todos os veículos.

**Query Params:**
- `search` - Busca por marca, modelo, placa, chassi ou cliente
- `client_id` - Filtrar por cliente

### GET /vehicles/:id
Busca um veículo específico.

### POST /vehicles
Cria um novo veículo.

**Body:**
```json
{
  "client_id": 1,
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "plate": "ABC-1234",
  "chassis": "9BW12345678901234",
  "color": "Branco",
  "mileage": 50000
}
```

### PUT /vehicles/:id
Atualiza um veículo.

### DELETE /vehicles/:id
Remove um veículo.

---

## 🏭 Fornecedores

### GET /suppliers
Lista todos os fornecedores.

**Query Params:**
- `search` - Busca por nome, CNPJ, contato, email ou telefone
- `active` - Filtrar por status

### GET /suppliers/:id
Busca um fornecedor específico.

### POST /suppliers
Cria um novo fornecedor.

**Body:**
```json
{
  "name": "Fornecedor XYZ",
  "cnpj": "12.345.678/0001-90",
  "contact_name": "João",
  "phone": "(51) 99999-9999",
  "email": "contato@fornecedor.com"
}
```

### PUT /suppliers/:id
Atualiza um fornecedor.

### DELETE /suppliers/:id
Remove um fornecedor.

---

## 📦 Estoque

### GET /products
Lista todos os produtos.

**Query Params:**
- `search` - Busca por nome, código ou descrição
- `category` - Filtrar por categoria
- `low_stock` - Filtrar produtos com estoque baixo (true)

### GET /products/:id
Busca um produto específico.

### POST /products
Cria um novo produto.

**Body:**
```json
{
  "name": "Óleo Motor 5W30",
  "code": "OLEO-001",
  "category": "Óleos",
  "cost_price": 25.00,
  "sale_price": 45.00,
  "min_quantity": 10,
  "current_quantity": 50,
  "unit": "L"
}
```

### PUT /products/:id
Atualiza um produto.

### DELETE /products/:id
Remove um produto.

### POST /products/:id/adjust-stock
Ajusta o estoque de um produto.

**Body:**
```json
{
  "quantity": 10,
  "type": "entry",
  "notes": "Entrada de estoque"
}
```

**Types:** `entry`, `exit`, `adjustment`

### GET /products/low-stock
Lista produtos com estoque baixo.

### GET /products/categories
Lista todas as categorias de produtos.

---

## 📋 Ordens de Serviço

### GET /orders
Lista todas as ordens de serviço.

**Query Params:**
- `status` - Filtrar por status
- `client_id` - Filtrar por cliente
- `mechanic_id` - Filtrar por mecânico
- `search` - Busca por número, cliente ou placa

### GET /orders/:id
Busca uma ordem específica (com itens e histórico).

### POST /orders
Cria uma nova ordem de serviço.

**Body:**
```json
{
  "client_id": 1,
  "vehicle_id": 1,
  "mechanic_id": 2,
  "status": "open",
  "discount": 0
}
```

### PUT /orders/:id
Atualiza uma ordem.

### DELETE /orders/:id
Remove uma ordem.

### POST /orders/:id/items
Adiciona um item à ordem.

**Body:**
```json
{
  "item_type": "product",
  "product_id": 1,
  "description": "Óleo Motor",
  "quantity": 5,
  "unit_price": 45.00
}
```

### DELETE /orders/:id/items/:itemId
Remove um item da ordem.

### PUT /orders/:id/discount
Atualiza o desconto da ordem.

**Body:**
```json
{
  "discount": 50.00
}
```

### POST /orders/:id/quick-action
Executa uma ação rápida.

**Body:**
```json
{
  "action": "start"
}
```

**Actions:** `start`, `finish`, `wait_parts`, `cancel`, `reopen`

### GET /orders/statistics/overview
Retorna estatísticas das ordens de serviço.

---

## 📅 Agenda

### GET /appointments
Lista todos os agendamentos.

**Query Params:**
- `status` - Filtrar por status
- `client_id` - Filtrar por cliente
- `mechanic_id` - Filtrar por mecânico
- `start_date` - Data de início
- `end_date` - Data de fim

### GET /appointments/:id
Busca um agendamento específico.

### POST /appointments
Cria um novo agendamento.

**Body:**
```json
{
  "client_id": 1,
  "vehicle_id": 1,
  "title": "Revisão completa",
  "start_time": "2025-01-15T10:00:00Z",
  "end_time": "2025-01-15T12:00:00Z",
  "status": "scheduled"
}
```

### PUT /appointments/:id
Atualiza um agendamento.

### DELETE /appointments/:id
Remove um agendamento.

### POST /appointments/:id/quick-action
Executa uma ação rápida.

**Body:**
```json
{
  "action": "confirm"
}
```

**Actions:** `confirm`, `start`, `complete`, `cancel`

### GET /appointments/upcoming
Lista próximos agendamentos.

---

## 💰 Financeiro

### GET /financial/dashboard
Retorna resumo financeiro.

### Contas a Pagar

#### GET /financial/payables
Lista contas a pagar.

**Query Params:**
- `status` - Filtrar por status
- `supplier_id` - Filtrar por fornecedor
- `start_date` - Data de início
- `end_date` - Data de fim

#### GET /financial/payables/:id
Busca uma conta a pagar.

#### POST /financial/payables
Cria uma conta a pagar.

**Body:**
```json
{
  "supplier_id": 1,
  "description": "Compra de peças",
  "category": "Peças",
  "due_date": "2025-01-31",
  "amount": 500.00
}
```

#### PUT /financial/payables/:id
Atualiza uma conta a pagar.

#### DELETE /financial/payables/:id
Remove uma conta a pagar.

### Contas a Receber

#### GET /financial/receivables
Lista contas a receber.

**Query Params:**
- `status` - Filtrar por status
- `client_id` - Filtrar por cliente
- `start_date` - Data de início
- `end_date` - Data de fim

#### GET /financial/receivables/:id
Busca uma conta a receber.

#### POST /financial/receivables
Cria uma conta a receber.

**Body:**
```json
{
  "client_id": 1,
  "order_id": 1,
  "description": "OS #001",
  "due_date": "2025-01-31",
  "amount": 500.00
}
```

#### PUT /financial/receivables/:id
Atualiza uma conta a receber.

#### DELETE /financial/receivables/:id
Remove uma conta a receber.

### Fluxo de Caixa

#### GET /financial/cash-flow
Lista movimentações de caixa.

**Query Params:**
- `start_date` - Data de início
- `end_date` - Data de fim
- `type` - Filtrar por tipo (income/expense)
- `category` - Filtrar por categoria

#### POST /financial/cash-flow
Cria uma movimentação de caixa.

**Body:**
```json
{
  "type": "income",
  "category": "Vendas",
  "description": "Recebimento",
  "amount": 500.00,
  "date": "2025-01-15",
  "payment_method": "pix"
}
```

---

## 📊 Relatórios

### GET /reports/overview
Relatório geral do sistema.

**Query Params:**
- `start_date` - Data de início
- `end_date` - Data de fim

### GET /reports/financial
Relatório financeiro.

**Query Params:**
- `start_date` - Data de início
- `end_date` - Data de fim

### GET /reports/sales
Relatório de vendas.

**Query Params:**
- `start_date` - Data de início
- `end_date` - Data de fim

### GET /reports/inventory
Relatório de estoque.

### GET /reports/clients
Relatório de clientes.

**Query Params:**
- `start_date` - Data de início
- `end_date` - Data de fim

---

## ⚙️ Configurações

### Tipos de Mão de Obra

#### GET /labor-types
Lista tipos de mão de obra.

**Query Params:**
- `active` - Filtrar por status (true/false)

#### GET /labor-types/:id
Busca um tipo específico.

#### POST /labor-types
Cria um tipo de mão de obra.

**Body:**
```json
{
  "name": "Troca de óleo",
  "description": "Troca completa de óleo e filtro",
  "price": 80.00,
  "estimated_hours": 1.0,
  "active": true
}
```

#### PUT /labor-types/:id
Atualiza um tipo.

#### DELETE /labor-types/:id
Remove um tipo.

### Categorias

#### GET /categories/products
Lista categorias de produtos.

#### POST /categories/products
Cria uma categoria de produtos.

**Body:**
```json
{
  "name": "Óleos"
}
```

#### DELETE /categories/products/:name
Remove uma categoria.

#### GET /categories/expenses
Lista categorias de despesas.

#### POST /categories/expenses
Cria uma categoria de despesas.

#### DELETE /categories/expenses/:name
Remove uma categoria.

---

## 📈 Dashboard

### GET /dashboard/overview
Retorna dados completos do dashboard.

**Response:**
```json
{
  "kpis": {
    "total_clients": 150,
    "active_orders": 12,
    "finished_orders_month": 45,
    "revenue_month": 45680.00,
    "low_stock_count": 3,
    "overdue_receivables": 2,
    "overdue_payables": 1,
    "upcoming_appointments": 5
  },
  "revenue": [...],
  "services": [...],
  "topProducts": [...],
  "dailySales": [...],
  "comparison": {...}
}
```

---

## 📝 Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `204` - Sem conteúdo (sucesso sem retorno)
- `400` - Erro de validação
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

---

## 🔄 Status das Entidades

### Ordem de Serviço
- `open` - Aberta
- `in_progress` - Em Andamento
- `waiting_parts` - Aguardando Peças
- `finished` - Finalizada
- `cancelled` - Cancelada

### Agendamento
- `scheduled` - Agendado
- `confirmed` - Confirmado
- `in_progress` - Em Andamento
- `completed` - Concluído
- `cancelled` - Cancelado

### Contas (Pagar/Receber)
- `open` - Aberta
- `paid` - Paga/Recebida
- `overdue` - Vencida
- `cancelled` - Cancelada

---

## 📚 Exemplos de Uso

### Criar uma OS completa

```javascript
// 1. Criar OS
const order = await api.post('/orders', {
  client_id: 1,
  vehicle_id: 1,
  status: 'open'
});

// 2. Adicionar produtos
await api.post(`/orders/${order.data.id}/items`, {
  item_type: 'product',
  product_id: 1,
  description: 'Óleo Motor',
  quantity: 5,
  unit_price: 45.00
});

// 3. Adicionar mão de obra
await api.post(`/orders/${order.data.id}/items`, {
  item_type: 'labor',
  labor_id: 1,
  description: 'Troca de óleo',
  quantity: 1,
  unit_price: 80.00
});

// 4. Finalizar OS
await api.post(`/orders/${order.data.id}/quick-action`, {
  action: 'finish'
});
```

---

## 🔒 Segurança

- Todas as rotas (exceto `/auth/login` e `/auth/register`) requerem autenticação
- Tokens JWT expiram em 7 dias (configurável)
- Rate limiting: 100 requisições por 15 minutos
- Validação de entrada em todos os endpoints
- Sanitização de dados

---

## 📖 Documentação Adicional

- `PROJETO.md` - Visão geral do projeto
- `STATUS.md` - Status dos módulos
- `SETUP.md` - Instruções de setup
- `DOCKER.md` - Guia Docker
