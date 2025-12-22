# 📋 Documentação do Projeto

## Sistema de Gestão - Oficina Mecânica

Sistema completo de gestão para oficinas mecânicas, desenvolvido com tecnologias modernas e boas práticas de desenvolvimento.

## 🎯 Objetivo

Fornecer uma solução completa e integrada para gerenciar todas as operações de uma oficina mecânica, desde o cadastro de clientes até o controle financeiro e relatórios gerenciais.

## 🛠️ Tecnologias

### Backend
- **Node.js** com **Express** e **TypeScript**
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Docker** para containerização
- **Arquitetura MVC** com separação de responsabilidades

### Frontend
- **React** com **TypeScript**
- **Vite** como build tool
- **React Router DOM** para navegação
- **Axios** para requisições HTTP
- **Recharts** para gráficos e visualizações
- **Lucide React** para ícones
- **React Hot Toast** para notificações

## 📦 Módulos Implementados

### ✅ 1. Autenticação e Controle de Acesso
- Login e registro de usuários
- Controle de perfis (admin, mecânico, financeiro, atendente)
- Proteção de rotas
- Tokens JWT

### ✅ 2. Dashboard
- KPIs em tempo real
- Gráficos de receita (últimos 6 meses)
- Distribuição de serviços
- Vendas dos últimos 7 dias
- Top 5 produtos mais vendidos
- Comparação mensal (atual vs anterior)
- Dados 100% reais do banco de dados

### ✅ 3. Clientes
- Cadastro de pessoas físicas e jurídicas
- Validação de CPF/CNPJ
- Endereço completo
- Busca avançada
- Histórico de veículos

### ✅ 4. Veículos
- Cadastro vinculado a clientes
- Informações completas (marca, modelo, ano, placa, chassi)
- Busca por múltiplos critérios
- Histórico de serviços

### ✅ 5. Fornecedores
- Cadastro completo com CNPJ
- Informações de contato
- Endereço completo
- Busca por nome, CNPJ, contato

### ✅ 6. Estoque
- Controle completo de produtos
- Categorização
- Preços de custo e venda
- Quantidade mínima e atual
- Alertas de estoque baixo
- Movimentações (entrada, saída, ajuste)
- Histórico de movimentações
- Integração com fornecedores

### ✅ 7. Ordens de Serviço
- Criação e gerenciamento completo
- Número automático (OS-YYYY-XXXXX)
- Itens (produtos e mão de obra)
- Cálculo automático de totais
- **Gestão inteligente de desconto** (zeramento automático, validações)
- Controle de status (Aberta, Em Andamento, Aguardando Peças, Finalizada, Cancelada)
- Integração com estoque (saída automática)
- Histórico de alterações
- Ações rápidas (iniciar, finalizar, cancelar)
- Modal de visualização detalhada
- Dashboard de estatísticas
- **Exclusão com validação de contas a receber** (navegação inteligente)

### ✅ 8. Agenda
- Agendamento de serviços
- Visualização em lista e calendário
- Calendário mensal interativo
- Controle de status (Agendado, Confirmado, Em Andamento, Concluído, Cancelado)
- Ações rápidas contextuais
- Filtros por status e busca
- Navegação entre meses

### ✅ 9. Financeiro
- **Contas a Pagar**
  - Cadastro completo
  - Controle de vencimento
  - Pagamentos parciais
  - Status automático (Aberta, Paga, Vencida)
  - Categorização
- **Contas a Receber**
  - Cadastro vinculado a clientes
  - Controle de vencimento
  - Recebimentos parciais
  - Status automático
  - **Filtro por ordem de serviço**
  - **Destaque visual de contas vinculadas**
- **Dashboard Financeiro**
  - Resumo de contas a pagar e receber
  - Saldo do mês
  - Valores vencidos

### ✅ 10. Relatórios
- **Visão Geral** - Resumo completo do sistema
- **Financeiro** - Receitas vs despesas, categorias
- **Vendas** - OS por dia, mecânico e cliente
- **Estoque** - Produtos com estoque baixo, por categoria
- **Clientes** - Top clientes, por tipo, novos clientes
- Gráficos interativos (linha, barra, pizza)
- Filtros por período
- Exportação visual

### ✅ 11. Configurações
- **Tipos de Mão de Obra**
  - CRUD completo
  - Preço e horas estimadas
  - Status ativo/inativo
- **Categorias**
  - Categorias de produtos
  - Categorias de despesas
  - Gerenciamento visual em chips

### ✅ 12. IA de Ajuda
- Assistente virtual integrado
- Respostas inteligentes baseadas em palavras-chave
- Suporte a todos os módulos
- Interface de chat flutuante

## 🗄️ Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `clients` - Clientes (PF e PJ)
- `vehicles` - Veículos
- `suppliers` - Fornecedores
- `products` - Produtos/Peças
- `orders` - Ordens de serviço
- `order_items` - Itens das OS
- `order_history` - Histórico de alterações
- `appointments` - Agendamentos
- `accounts_payable` - Contas a pagar
- `accounts_receivable` - Contas a receber
- `cash_flow` - Fluxo de caixa
- `inventory_movements` - Movimentações de estoque
- `labor_types` - Tipos de mão de obra

### Características
- Normalização completa
- Índices para performance
- Triggers para atualizações automáticas
- Constraints de integridade
- Soft delete onde aplicável

## 🔐 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de entrada
- CORS configurado
- Rate limiting
- Helmet para segurança HTTP
- Proteção contra SQL injection
- Sanitização de dados

## 📊 Funcionalidades Especiais

### Integrações Automáticas
- **Estoque ↔ OS**: Saída automática ao adicionar produto na OS
- **OS ↔ Financeiro**: Geração automática de contas a receber
- **Estoque ↔ Movimentações**: Histórico completo de entradas/saídas

### Cálculos Automáticos
- Totais de OS (subtotal, desconto, total)
- **Zeramento automático de desconto quando não há itens**
- **Validações robustas de desconto (frontend e backend)**
- Status de contas (pago quando valor pago >= valor total)
- Alertas de estoque baixo
- Comparações mensais

### Histórico e Rastreabilidade
- Histórico de alterações de OS
- Movimentações de estoque
- Timeline de eventos

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)

### Desenvolvimento
```bash
# Subir containers
docker-compose up -d

# Executar migrations
docker-compose exec backend npm run migrate

# Popular banco (opcional)
docker-compose exec backend npm run seed
```

### Acesso
- Frontend: http://localhost:5173
- Backend: http://localhost:3002
- Banco de Dados: localhost:5433

### Credenciais Padrão
- Email: admin@oficina.com
- Senha: admin123

## 📁 Estrutura do Projeto

```
mec-poa/
├── backend/
│   ├── src/
│   │   ├── config/        # Configurações (DB, env)
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── models/        # Acesso ao banco
│   │   ├── routes/        # Rotas da API
│   │   ├── middleware/    # Middlewares (auth, etc)
│   │   ├── utils/         # Utilitários
│   │   └── server.ts      # Servidor Express
│   ├── migrations/        # Migrations SQL
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── contexts/      # Context API
│   │   ├── services/      # Serviços (API)
│   │   └── App.tsx        # App principal
│   └── package.json
├── docs/                  # Documentação
├── docker-compose.yml      # Docker Compose (dev)
└── docker-compose.prod.yml # Docker Compose (prod)
```

## 📝 Documentação Adicional

- `README.md` - Guia rápido
- `SETUP.md` - Instruções de setup
- `DOCKER.md` - Guia Docker
- `QUICKSTART.md` - Início rápido
- `docs/` - Documentação técnica detalhada

## 🎨 Interface

- Design moderno e responsivo
- Cores consistentes e profissionais
- Componentes reutilizáveis
- Feedback visual (toasts, loading states)
- Acessibilidade (WCAG 2.1 AA)

## 🔄 Status do Projeto

✅ **Módulos Completos:**
- Autenticação
- Dashboard
- Clientes
- Veículos
- Fornecedores
- Estoque
- Ordens de Serviço
- Agenda
- Financeiro
- Relatórios
- Configurações
- IA de Ajuda

✅ **Pronto para Produção:**
- Todos os módulos funcionais
- Integração completa
- Dados reais (sem mockados)
- Validações implementadas
- Segurança configurada

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação técnica em `docs/` ou use o assistente de IA integrado no sistema.
