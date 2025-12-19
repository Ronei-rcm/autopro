# 🔧 Sistema de Gestão para Oficina Mecânica

Sistema completo de ERP para oficinas mecânicas, desenvolvido com arquitetura moderna, escalável e segura.

## 📋 Funcionalidades

### ✅ Módulos Implementados

- 🔐 **Autenticação e Controle de Acesso** - Login seguro com perfis e permissões
- 👥 **Cadastro de Clientes** - PF e PJ com histórico completo
- 🏢 **Cadastro de Fornecedores** - Gestão de fornecedores e produtos
- 🚗 **Cadastro de Veículos** - Controle completo de veículos dos clientes
- 📦 **Controle de Estoque** - Gestão de produtos/peças com alertas
- 💰 **Orçamento e OS** - Criação, aprovação e gestão de ordens de serviço
- 💳 **Financeiro Completo** - Contas a pagar/receber e fluxo de caixa
- 📅 **Agendamento** - Sistema de agendamento com integração Google Calendar
- 📊 **Relatórios** - Dashboard e relatórios gerenciais

## 🏗️ Arquitetura

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Arquitetura MVC** com separação de responsabilidades
- **Migrations** para versionamento do banco

### Frontend
- **React** + **TypeScript** + **Vite**
- **Context API** para gerenciamento de estado
- **React Router** para navegação
- Design responsivo e moderno
- Componentes reutilizáveis

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL 14+
- Git

### Instalação

#### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd mec-poa
```

#### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
npm run dev
```

#### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
npm run dev
```

### Configuração do Banco de Dados

```bash
cd backend
npm run migrate:up
npm run seed  # (opcional) Dados iniciais
```

## 📁 Estrutura do Projeto

```
mec-poa/
├── backend/           # API REST
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── config/
│   ├── migrations/
│   └── tests/
├── frontend/          # Interface React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── public/
├── docs/              # Documentação
└── scripts/           # Scripts auxiliares
```

## 🔒 Segurança

- ✅ Hash seguro de senhas (bcrypt)
- ✅ Proteção contra SQL Injection
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Logs de auditoria

## 📚 Documentação

- [Modelagem do Banco de Dados](./docs/database/SCHEMA.md)
- [API Documentation](./docs/api/API.md)
- [Guia de Deploy](./docs/deployment/DEPLOY.md)

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
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

Desenvolvido com ❤️ para oficinas mecânicas
