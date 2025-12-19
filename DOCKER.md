# 🐳 Guia Docker

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado

## 🚀 Início Rápido

### Desenvolvimento

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes (limpar banco)
docker-compose down -v
```

### Produção

```bash
# Subir em produção
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Configuração

### Portas Utilizadas

- **Backend**: `3001` (http://localhost:3001)
- **Frontend**: `5173` (http://localhost:5173)
- **PostgreSQL**: `5433` (externa) → `5432` (interna no container)

### Variáveis de Ambiente

As variáveis estão configuradas no `docker-compose.yml`. Para produção, use `.env.docker`.

## 📦 Serviços

### 1. PostgreSQL

```bash
# Conectar ao banco
docker exec -it mec-poa-db psql -U postgres -d mec_poa

# Executar migration manualmente
docker exec -i mec-poa-db psql -U postgres -d mec_poa < backend/migrations/001_initial_schema.sql
```

### 2. Backend

```bash
# Ver logs do backend
docker-compose logs -f backend

# Executar comandos no container
docker exec -it mec-poa-backend sh

# Executar seed
docker exec -it mec-poa-backend npm run seed
```

### 3. Frontend

```bash
# Ver logs do frontend
docker-compose logs -f frontend

# Rebuild após mudanças
docker-compose up -d --build frontend
```

## 🔄 Comandos Úteis

### Rebuild

```bash
# Rebuild todos os serviços
docker-compose build

# Rebuild específico
docker-compose build backend
```

### Limpar

```bash
# Parar e remover containers
docker-compose down

# Remover também volumes (apaga banco!)
docker-compose down -v

# Limpar imagens não utilizadas
docker system prune -a
```

### Logs

```bash
# Todos os logs
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 🗄️ Banco de Dados

### Backup

```bash
# Criar backup
docker exec mec-poa-db pg_dump -U postgres mec_poa > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i mec-poa-db psql -U postgres mec_poa < backup_20240101.sql
```

### Acessar via cliente externo

```bash
# Host: localhost
# Porta: 5433
# Database: mec_poa
# User: postgres
# Password: postgres
```

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Verificar portas
docker ps

# Parar container que está usando a porta
docker stop <container_id>
```

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs <service>

# Verificar status
docker-compose ps
```

### Banco não conecta

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Testar conexão
docker exec -it mec-poa-db psql -U postgres -d mec_poa
```

### Rebuild completo

```bash
# Parar tudo
docker-compose down -v

# Remover imagens
docker rmi mec-poa-backend mec-poa-frontend

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## 📝 Notas

- Os volumes são persistidos mesmo após `docker-compose down`
- Use `docker-compose down -v` para limpar volumes
- Em desenvolvimento, o código é montado como volume (hot reload)
- Em produção, o código é copiado na imagem

## 🔒 Segurança

- **Nunca** commite arquivos `.env` com senhas reais
- Use variáveis de ambiente em produção
- Altere senhas padrão em produção
- Configure firewall adequadamente

