# 🔧 Solução para Erro 500 - Workshop Info

## ❌ Problema

Ao acessar `/informacoes-oficina`, ocorre erro 500:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

## 🔍 Causa

A tabela `workshop_info` não existe no banco de dados. A migration `008_add_workshop_info.sql` não foi executada.

## ✅ Solução

### Opção 1: Executar Migration (Recomendado)

Se você usa o sistema de migrations do projeto:

```bash
cd backend
npm run migrate:up
```

### Opção 2: Executar SQL Manualmente

Execute o script SQL diretamente no banco de dados:

```bash
# Se estiver usando Docker
docker exec -i mec-poa-db psql -U postgres -d mec_poa < backend/migrations/008_add_workshop_info.sql

# Ou conecte-se ao banco e execute:
psql -h localhost -U postgres -d mec_poa -f backend/migrations/008_add_workshop_info.sql
```

### Opção 3: Executar Script Simplificado

Use o script que criamos:

```bash
# Via Docker
docker exec -i mec-poa-db psql -U postgres -d mec_poa < scripts/create-workshop-info-table.sql

# Ou diretamente
psql -h localhost -U postgres -d mec_poa -f scripts/create-workshop-info-table.sql
```

### Opção 4: Via Interface do Banco (pgAdmin, DBeaver, etc.)

1. Conecte-se ao banco de dados `mec_poa`
2. Abra o arquivo `backend/migrations/008_add_workshop_info.sql`
3. Execute o script completo

## 🔄 Verificar se Funcionou

Após executar a migration, verifique se a tabela foi criada:

```sql
SELECT * FROM workshop_info;
```

Deve retornar um registro com:
- `id = 1`
- `name = 'Oficina Mecânica'`
- `footer_text = 'Este documento foi gerado automaticamente pelo sistema de gestão.'`

## 🧪 Testar

1. Recarregue a página `/informacoes-oficina`
2. O erro 500 não deve mais aparecer
3. Você deve ver o formulário de informações da oficina

## 📝 Nota

Se você estiver usando Docker Compose, certifique-se de que:
1. O container do banco está rodando: `docker-compose ps`
2. As migrations foram executadas: `docker-compose exec backend npm run migrate:up`

## 🆘 Ainda com Problemas?

Se o erro persistir após executar a migration:

1. Verifique os logs do backend:
   ```bash
   docker-compose logs backend
   # ou
   npm run logs:backend
   ```

2. Verifique se a tabela existe:
   ```sql
   \d workshop_info
   ```

3. Verifique as permissões do usuário do banco de dados

4. Verifique a conexão com o banco no arquivo `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mec_poa
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   ```
