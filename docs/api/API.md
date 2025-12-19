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

## Endpoints

### Autenticação

#### POST /auth/login
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

#### POST /auth/register
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

#### GET /auth/me
Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

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

### Clientes

#### GET /clients
Lista todos os clientes.

#### POST /clients
Cria um novo cliente.

#### GET /clients/:id
Busca um cliente específico.

#### PUT /clients/:id
Atualiza um cliente.

#### DELETE /clients/:id
Remove um cliente (soft delete).

### Veículos

#### GET /vehicles
Lista todos os veículos.

#### POST /vehicles
Cria um novo veículo.

### Produtos

#### GET /products
Lista todos os produtos.

#### POST /products
Cria um novo produto.

### Orçamentos

#### GET /quotes
Lista todos os orçamentos.

#### POST /quotes
Cria um novo orçamento.

### Ordens de Serviço

#### GET /orders
Lista todas as ordens de serviço.

#### POST /orders
Cria uma nova ordem de serviço.

### Financeiro

#### GET /financial/payable
Lista contas a pagar.

#### GET /financial/receivable
Lista contas a receber.

#### GET /financial/cash-flow
Retorna fluxo de caixa.

### Agendamentos

#### GET /appointments
Lista agendamentos.

#### POST /appointments
Cria um novo agendamento.

### Relatórios

#### GET /reports/dashboard
Dados do dashboard.

#### GET /reports/billing
Relatório de faturamento.

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

