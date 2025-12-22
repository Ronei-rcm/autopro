# ⚡ Configuração Rápida do pgAdmin

## 🎯 Método 1: Configurar Servidor (Recomendado)

### Passo 1: Registrar o Servidor

1. No **painel esquerdo**, localize **"Servers"**
2. **Clique com botão direito** em "Servers"
3. Selecione **"Register" → "Server"**

### Passo 2: Preencher Dados

#### Aba "General"
- **Name:** `Mec-Poa Database`
  - (Pode usar qualquer nome, ex: "Banco Oficina", "PostgreSQL Local")

#### Aba "Connection"
- **Host name/address:** `postgres`
  - ⚠️ **IMPORTANTE:** Use `postgres` (nome do serviço Docker), NÃO `localhost`
  
- **Port:** `5432`
  - Porta interna do Docker

- **Maintenance database:** `mec_poa`
  - Nome do banco de dados

- **Username:** `postgres`
  - Usuário do PostgreSQL

- **Password:** `postgres`
  - Senha do PostgreSQL

- ✅ **Marque:** "Save password"
  - Para não precisar digitar sempre

#### Aba "SSL" (Opcional)
- Você pode deixar como está (não é necessário para ambiente local)

### Passo 3: Salvar

1. Clique no botão **"Save"** no canto inferior direito
2. O servidor aparecerá na lista sob "Servers"

### Passo 4: Explorar

1. Expanda o servidor clicando na seta ao lado
2. Expanda **"Databases"**
3. Expanda **"mec_poa"**
4. Expanda **"Schemas"**
5. Expanda **"public"**
6. Expanda **"Tables"**
7. Veja todas as tabelas do sistema!

---

## 🎯 Método 2: Query Tool Direto (Conexão Ad-Hoc)

Se você está vendo a dialog "Let's connect to the server":

1. **Server Name:** `Mec-Poa Database` (qualquer nome)
2. **Host name/address:** `postgres`
3. **Port:** `5432`
4. **Database:** `mec_poa`
5. **User:** `postgres`
6. **Password:** `postgres`
7. **Role:** Deixe vazio ou selecione "postgres"
8. Clique em **"Connect & Open Query Tool"**

---

## ✅ Verificar se Funcionou

Após conectar, você deve ver:

```
Servers
└── Mec-Poa Database
    └── Databases
        └── mec_poa
            └── Schemas
                └── public
                    └── Tables
                        ├── orders
                        ├── clients
                        ├── vehicles
                        ├── products
                        └── ... (outras tabelas)
```

## 🔍 Explorar Dados

### Ver Dados de uma Tabela

1. Clique com botão direito em uma tabela (ex: `orders`)
2. Selecione **"View/Edit Data" → "All Rows"**
3. Veja todos os registros da tabela

### Executar Query SQL

1. Clique com botão direito em **"mec_poa"** (o banco)
2. Selecione **"Query Tool"**
3. Digite sua query:
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
   ```
4. Clique em **"Execute"** (ou pressione F5)

### Ver Estrutura da Tabela

1. Clique com botão direito na tabela
2. Selecione **"Properties"**
3. Veja colunas, tipos, constraints, etc.

---

## 🐛 Problemas Comuns

### ❌ "Could not connect to server"

**Solução:**
- Verifique se o serviço `postgres` está rodando:
  ```bash
  docker-compose ps
  ```
- Verifique se está usando `postgres` como host (não `localhost`)

### ❌ "Password authentication failed"

**Solução:**
- Verifique se a senha é `postgres` (padrão do docker-compose.yml)
- Verifique as variáveis no `docker-compose.yml`:
  ```yaml
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  ```

### ❌ "Database does not exist"

**Solução:**
- Verifique se o banco `mec_poa` existe:
  ```bash
  docker exec -it mec-poa-db psql -U postgres -l
  ```
- Se não existir, execute as migrations:
  ```bash
  make migrate
  ```

### ❌ Não vejo as tabelas

**Solução:**
- Expanda: Servers → Mec-Poa Database → Databases → mec_poa → Schemas → **public** → Tables
- ⚠️ As tabelas ficam em `Schemas → public`, não diretamente em Databases

---

## 📝 Dados de Conexão (Resumo)

```
Host: postgres
Port: 5432
Database: mec_poa
Username: postgres
Password: postgres
```

---

## 🎉 Pronto!

Agora você pode:
- ✅ Visualizar todas as tabelas
- ✅ Consultar e editar dados
- ✅ Executar queries SQL
- ✅ Ver estruturas das tabelas
- ✅ Fazer backup/restore
- ✅ Monitorar o banco

**Desenvolvido para facilitar o gerenciamento do banco de dados!**

