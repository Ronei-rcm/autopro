# 🚀 Guia de Deploy

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- PM2 (opcional, para produção)

## Configuração do Ambiente

### 1. Banco de Dados

```bash
# Criar banco de dados
createdb mec_poa

# Executar migrations
cd backend
npm run migrate:up
```

### 2. Variáveis de Ambiente

#### Backend (.env)

```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mec_poa
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=seu-jwt-secret-super-seguro
CORS_ORIGIN=https://seu-dominio.com
```

#### Frontend (.env)

```env
VITE_API_URL=https://api.seu-dominio.com/api
```

### 3. Build

```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd frontend
npm install
npm run build
```

## Deploy com PM2

### Backend

```bash
pm2 start dist/server.js --name mec-poa-api
pm2 save
pm2 startup
```

### Frontend (com servidor estático)

```bash
# Usar nginx ou similar para servir o build do frontend
# Ou usar PM2 com serve
npm install -g serve
pm2 serve frontend/dist 3000 --name mec-poa-web
```

## Deploy com Docker

### Dockerfile Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Dockerfile Frontend

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /var/www/mec-poa/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## Backup do Banco de Dados

```bash
# Backup
pg_dump mec_poa > backup_$(date +%Y%m%d).sql

# Restore
psql mec_poa < backup_20240101.sql
```

## Monitoramento

- PM2 Monitor: `pm2 monit`
- Logs: `pm2 logs`
- Status: `pm2 status`

