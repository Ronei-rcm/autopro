# ⚡ Quick Start - Início Rápido

## 🐳 Com Docker (Recomendado)

### 1. Subir os serviços

```bash
make up
# ou
docker-compose up -d
```

### 2. Executar migrations

```bash
make migrate
# ou
docker exec -i mec-poa-db psql -U postgres -d mec_poa < backend/migrations/001_initial_schema.sql
```

### 3. Criar usuário admin

```bash
make seed
# ou
docker exec -it mec-poa-backend npm run seed
```

### 4. Acessar

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002/api
- **Health Check**: http://localhost:3002/health

### 5. Login

- **Email**: admin@oficina.com
- **Senha**: admin123

## 📋 Verificar Status

```bash
make status
# ou
docker-compose ps
```

## 📊 Ver Logs

```bash
make logs
# ou logs específicos
make logs-backend
make logs-frontend
make logs-db
```

## 🛑 Parar Serviços

```bash
make down
# ou
docker-compose down
```

## 🔄 Rebuild Completo

```bash
make rebuild
```

## 📝 Comandos Úteis

```bash
make help          # Ver todos os comandos
make shell-backend # Abrir shell no backend
make shell-db      # Abrir psql no banco
make backup        # Backup do banco
```

## 🆘 Problemas?

### Porta já em uso

```bash
# Verificar portas
docker ps

# Parar container conflitante
docker stop <container_id>
```

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs <service>

# Rebuild
make rebuild
```

### Banco não conecta

```bash
# Verificar se está rodando
docker-compose ps postgres

# Testar conexão
make shell-db
```

---

**Pronto!** Seu sistema está rodando! 🚀

