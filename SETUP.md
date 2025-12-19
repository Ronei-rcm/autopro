# 🛠️ Guia de Setup Inicial

## Passo a Passo para Começar

### 1. Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar Banco de Dados

#### Criar banco de dados PostgreSQL

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE mec_poa;

# Sair
\q
```

#### Executar Migration

```bash
cd backend

# Executar o SQL diretamente
psql -U postgres -d mec_poa -f migrations/001_initial_schema.sql

# Ou usar node-pg-migrate (se configurado)
npm run migrate:up
```

### 3. Configurar Variáveis de Ambiente

#### Backend

Crie o arquivo `backend/.env`:

```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=mec_poa
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

JWT_SECRET=seu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend

Crie o arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Sistema de Gestão - Oficina Mecânica
```

### 4. Criar Usuário Administrador Inicial

Execute o script de seed (ou crie manualmente):

```bash
cd backend
npm run seed
```

Ou crie manualmente no banco:

```sql
INSERT INTO users (email, password_hash, name, profile)
VALUES (
  'admin@oficina.com',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- senha: admin123
  'Administrador',
  'admin'
);
```

**Nota:** O hash acima é apenas um exemplo. Use bcrypt para gerar o hash correto da senha.

### 5. Iniciar Aplicação

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará rodando em `http://localhost:3000`

### 6. Acessar o Sistema

1. Abra o navegador em `http://localhost:3000`
2. Faça login com as credenciais do usuário admin criado
3. Explore o sistema!

## 🔧 Troubleshooting

### Erro de conexão com banco de dados

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -U postgres -d mec_poa`

### Erro de porta já em uso

- Backend: Altere `PORT` no `.env`
- Frontend: Altere no `vite.config.ts`

### Erro de CORS

- Verifique `CORS_ORIGIN` no `.env` do backend
- Deve corresponder à URL do frontend

## 📝 Próximos Passos

1. ✅ Sistema está rodando
2. 🔄 Implementar módulos de cadastro
3. 🔄 Criar telas de gestão
4. 🔄 Configurar integração Google Calendar
5. 🔄 Adicionar relatórios

## 🆘 Precisa de Ajuda?

Consulte a documentação em:
- [Modelagem do Banco](./docs/database/SCHEMA.md)
- [API Documentation](./docs/api/API.md)
- [Guia de Deploy](./docs/deployment/DEPLOY.md)

