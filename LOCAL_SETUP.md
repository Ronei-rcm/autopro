# 🚀 Configuração para Desenvolvimento Local

Este guia explica como rodar o projeto **sem Docker**, tudo localmente.

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 9 ou superior
- **PostgreSQL** 15 ou superior (ou use Docker apenas para o banco)

## 🔧 Instalação Rápida

### 1. Instalar todas as dependências

```bash
# Na raiz do projeto
npm run install:all
```

Ou use o script de setup:

```bash
make setup-local
# ou
./scripts/setup-local.sh
```

### 2. Configurar Banco de Dados

#### Opção A: PostgreSQL Local

```bash
# Criar banco de dados
createdb mec_poa

# Ou usando psql
psql -U postgres -c "CREATE DATABASE mec_poa;"
```

#### Opção B: Docker apenas para o banco

```bash
docker-compose up -d postgres
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp backend/.env.example backend/.env
```

O arquivo `.env` padrão já está configurado para desenvolvimento local:

```env
NODE_ENV=development
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mec_poa
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=desenvolvimento-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 4. Inicializar Banco de Dados

```bash
# Executar migrations e seed
make init-db-local
# ou
./scripts/init-db-local.sh
```

Ou manualmente:

```bash
# Executar migrations
cd backend
npm run migrate

# Executar seed (cria usuário admin)
npm run seed
```

## 🎯 Rodar o Projeto

### Desenvolvimento (Backend + Frontend juntos)

```bash
# Na raiz do projeto
npm run dev
```

Isso inicia:
- **Backend**: http://localhost:3002
- **Frontend**: http://localhost:5173

### Rodar Separadamente

```bash
# Backend apenas
npm run dev:backend
# ou
make dev-backend

# Frontend apenas
npm run dev:frontend
# ou
make dev-frontend
```

## 📝 Comandos Úteis

```bash
# Instalar todas as dependências
npm run install:all

# Build de produção
npm run build

# Executar seed
npm run seed

# Executar migrations
npm run migrate

# Lint
npm run lint
```

## 🔍 Verificar se está funcionando

1. **Backend**: Acesse http://localhost:3002/api/health (se tiver rota de health)
2. **Frontend**: Acesse http://localhost:5173
3. **Login padrão**:
   - Email: `admin@oficina.com`
   - Senha: `admin123`

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
npm run install:all
```

### Erro de conexão com banco

1. Verifique se PostgreSQL está rodando:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Verifique as credenciais em `backend/.env`

3. Teste conexão:
   ```bash
   psql -h localhost -U postgres -d mec_poa
   ```

### Porta já em uso

Se a porta 3002 ou 5173 estiver em uso:

- **Backend**: Altere `PORT` em `backend/.env`
- **Frontend**: Altere `server.port` em `frontend/vite.config.ts`

### Erro ao executar migrations

Certifique-se de que o banco existe:

```bash
createdb mec_poa
```

## 🔄 Usar Docker apenas para o banco

Se quiser usar Docker apenas para PostgreSQL:

```bash
# Iniciar apenas o banco
docker-compose up -d postgres

# Configurar backend/.env para usar localhost:5432
# (já está configurado por padrão)
```

## 📚 Estrutura do Projeto

```
mec-poa/
├── backend/          # API Node.js/Express
│   ├── src/
│   ├── .env         # Configurações do backend
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/
│   └── package.json
├── scripts/          # Scripts auxiliares
├── package.json      # Scripts da raiz
└── Makefile          # Comandos make
```

## 🎉 Pronto!

Agora você pode desenvolver localmente sem Docker! 🚀
