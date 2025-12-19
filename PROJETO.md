# 📋 Documentação do Projeto

## Visão Geral

Sistema completo de ERP para oficinas mecânicas desenvolvido com arquitetura moderna, escalável e segura.

## 🎯 Objetivos

- Gestão operacional completa
- Controle financeiro integrado
- Organização de estoque inteligente
- Agendamento com sincronização Google Calendar
- Relatórios gerenciais em tempo real

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

### Estrutura de Pastas

```
mec-poa/
├── backend/              # API REST
│   ├── src/
│   │   ├── controllers/   # Lógica de controle
│   │   ├── models/        # Modelos de dados
│   │   ├── routes/        # Definição de rotas
│   │   ├── middleware/    # Middlewares (auth, validação)
│   │   ├── services/      # Serviços (Google Calendar, etc)
│   │   ├── utils/         # Utilitários
│   │   └── config/        # Configurações
│   ├── migrations/        # Migrations do banco
│   └── tests/             # Testes
├── frontend/              # Interface React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Serviços (API calls)
│   │   └── contexts/      # Context API
│   └── public/            # Arquivos estáticos
└── docs/                  # Documentação
```

## 📦 Módulos

### ✅ Implementado

- [x] Estrutura base do projeto
- [x] Autenticação e controle de acesso
- [x] Modelagem do banco de dados
- [x] Sistema de rotas base
- [x] Frontend básico com login

### 🚧 Em Desenvolvimento

- [ ] Cadastro de Clientes
- [ ] Cadastro de Fornecedores
- [ ] Cadastro de Veículos
- [ ] Controle de Estoque
- [ ] Orçamento e Ordem de Serviço
- [ ] Módulo Financeiro
- [ ] Agendamento com Google Calendar
- [ ] Relatórios Gerenciais

## 🔐 Segurança

- ✅ Hash seguro de senhas (bcrypt)
- ✅ JWT para autenticação
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Proteção contra SQL Injection (queries parametrizadas)

## 📊 Banco de Dados

15 tabelas principais:
- users, clients, suppliers, vehicles
- products, labor_types
- quotes, quote_items
- orders, order_items
- accounts_payable, accounts_receivable
- cash_flow, appointments
- inventory_movements

Ver [Schema completo](./docs/database/SCHEMA.md)

## 🚀 Roadmap

### Fase 1 - Base (Atual)
- ✅ Estrutura do projeto
- ✅ Autenticação
- ✅ Banco de dados

### Fase 2 - Cadastros
- [ ] Clientes
- [ ] Fornecedores
- [ ] Veículos
- [ ] Produtos

### Fase 3 - Operacional
- [ ] Orçamentos
- [ ] Ordens de Serviço
- [ ] Estoque

### Fase 4 - Financeiro
- [ ] Contas a Pagar
- [ ] Contas a Receber
- [ ] Fluxo de Caixa

### Fase 5 - Agendamento
- [ ] Sistema de agendamento
- [ ] Integração Google Calendar

### Fase 6 - Relatórios
- [ ] Dashboard
- [ ] Relatórios gerenciais
- [ ] Exportação de dados

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para oficinas mecânicas**

