# 🔧 Sistema de Gestão para Oficina Mecânica

Sistema completo de ERP para oficinas mecânicas, desenvolvido com arquitetura moderna, escalável e segura.

## 📋 Funcionalidades

### ✅ Módulos Implementados

- 🔐 **Autenticação e Controle de Acesso** - Login seguro com perfis e permissões
- 📊 **Dashboard** - KPIs em tempo real, gráficos e análises
- 👥 **Cadastro de Clientes** - PF e PJ com histórico completo
- 🏢 **Cadastro de Fornecedores** - Gestão de fornecedores e produtos
- 🚗 **Cadastro de Veículos** - Controle completo de veículos dos clientes
- 📦 **Controle de Estoque** - Gestão de produtos/peças com alertas e movimentações
- 📋 **Ordens de Serviço** - Criação, gestão e rastreamento completo de OS
- 💳 **Financeiro Completo** - Contas a pagar/receber e fluxo de caixa
- 📅 **Agendamento** - Sistema de agendamento com calendário interativo
- 📊 **Relatórios** - Dashboard e relatórios gerenciais com gráficos
- ⚙️ **Configurações** - Tipos de mão de obra e categorias
- 🤖 **IA de Ajuda** - Assistente virtual integrado

## 🚀 Início Rápido com Docker

### Pré-requisitos

- Docker e Docker Compose instalados

### Comandos

```bash
# Iniciar todos os serviços
make up
# ou
docker-compose up -d

# Ver logs
make logs
# ou
docker-compose logs -f

# Executar migration e seed
make migrate
make seed

# Parar serviços
make down
```

### Acessar

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002/api
- **PostgreSQL**: localhost:5433

### Credenciais Padrão

- **Email**: admin@oficina.com
- **Senha**: admin123

## 🏗️ Arquitetura

### Stack Tecnológica

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL
- JWT para autenticação
- Arquitetura MVC

**Frontend:**
- React + TypeScript + Vite
- Context API para estado
- React Router para navegação
- Recharts para gráficos
- Axios para requisições HTTP

**Infraestrutura:**
- Docker e Docker Compose
- PostgreSQL em container
- Hot reload em desenvolvimento

### Portas Utilizadas

- **Frontend**: `5173` (Vite padrão)
- **Backend**: `3002` (externa) → `3001` (interna)
- **PostgreSQL**: `5433` (externa) → `5432` (interna)

## 📁 Estrutura do Projeto

```
mec-poa/
├── backend/              # API REST
│   ├── src/
│   │   ├── config/       # Configurações
│   │   ├── controllers/  # Lógica de negócio
│   │   ├── models/       # Acesso ao banco
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/  # Middlewares
│   │   └── utils/        # Utilitários
│   ├── migrations/       # Migrations SQL
│   └── Dockerfile
├── frontend/             # Interface React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── contexts/     # Context API
│   │   ├── services/     # Serviços (API)
│   │   └── utils/        # Utilitários
│   └── Dockerfile
├── docs/                 # Documentação
│   ├── api/             # Documentação da API
│   ├── database/        # Schema do banco
│   └── deployment/      # Guia de deploy
├── docker-compose.yml    # Orquestração Docker
└── Makefile             # Comandos úteis
```

## 🔧 Desenvolvimento Local (sem Docker)

Veja o guia completo em [SETUP.md](./SETUP.md)

## 🐳 Docker

Veja o guia completo em [DOCKER.md](./DOCKER.md)

### Comandos Make Disponíveis

```bash
make help          # Lista todos os comandos
make up            # Inicia containers
make down          # Para containers
make logs          # Ver logs
make seed          # Executa seed
make migrate       # Executa migrations
make backup        # Backup do banco
make shell-backend # Shell no backend
make shell-db      # Shell no banco
```

## 🔒 Segurança

- ✅ Hash seguro de senhas (bcrypt)
- ✅ Proteção contra SQL Injection
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Helmet para segurança HTTP
- ✅ Logs de auditoria
- ✅ JWT Authentication

## 📊 Funcionalidades Especiais

### Integrações Automáticas
- **Estoque ↔ OS**: Saída automática ao adicionar produto na OS
- **OS ↔ Financeiro**: Geração automática de contas a receber
- **Estoque ↔ Movimentações**: Histórico completo de entradas/saídas

### Cálculos Automáticos
- Totais de OS (subtotal, desconto, total)
- Status de contas (pago quando valor pago >= valor total)
- Alertas de estoque baixo
- Comparações mensais

### Histórico e Rastreabilidade
- Histórico de alterações de OS
- Movimentações de estoque
- Timeline de eventos

## 📚 Documentação

- [Documentação do Projeto](./PROJETO.md) - Visão geral completa
- [Status do Sistema](./STATUS.md) - Status dos módulos
- [Guia de Setup](./SETUP.md) - Instalação local
- [Guia Docker](./DOCKER.md) - Uso com containers
- [Início Rápido](./QUICKSTART.md) - Guia rápido
- [Modelagem do Banco](./docs/database/SCHEMA.md) - Schema completo
- [API Documentation](./docs/api/API.md) - Documentação da API
- [Guia de Deploy](./docs/deployment/DEPLOY.md) - Deploy em produção

## 🎨 Interface

- Design moderno e responsivo
- Componentes reutilizáveis
- Feedback visual (toasts, loading states)
- Acessibilidade (WCAG 2.1 AA)
- Gráficos interativos
- Cores consistentes e profissionais

## 📈 Status do Projeto

✅ **Sistema 100% funcional e pronto para produção!**

- 12 módulos completos
- 15+ tabelas no banco de dados
- 50+ endpoints da API
- 20+ componentes React
- 0 dados mockados (100% real)

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Licença

MIT

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para oficinas mecânicas**
