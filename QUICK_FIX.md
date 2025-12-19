# ⚡ Correção Rápida - Erro 500 no Login

## ✅ Problema Resolvido

O erro 500 no login foi causado porque o **PostgreSQL não estava rodando** e o backend estava tentando conectar na porta errada.

## 🔧 Solução Aplicada

### 1. PostgreSQL no Docker
```bash
# Iniciar PostgreSQL
docker-compose up -d postgres
```

### 2. Configuração do Backend
Criado arquivo `backend/.env` com:
```env
DB_HOST=localhost
DB_PORT=5433  # Porta externa do Docker
DB_NAME=mec_poa
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Reiniciar Backend
```bash
pm2 restart mec-poa-backend --update-env
```

## ✅ Status Atual

- ✅ PostgreSQL rodando no Docker (porta 5433)
- ✅ Backend conectado ao banco
- ✅ Login funcionando
- ✅ Frontend acessível
- ✅ Firewall configurado

## 🎯 URLs de Acesso

- **Frontend**: http://177.67.32.203:5173
- **Backend**: http://177.67.32.203:3002
- **API**: http://177.67.32.203:3002/api

## 🔑 Credenciais

- **Email**: `admin@oficina.com`
- **Senha**: `admin123`

## 📝 Comandos Úteis

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar serviços
pm2 restart all

# Verificar PostgreSQL
docker-compose ps postgres
```

---

**Última atualização**: 19/12/2024
