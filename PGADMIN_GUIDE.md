# 🗄️ Guia do pgAdmin - Interface Web para PostgreSQL

## 📋 Visão Geral

O pgAdmin foi adicionado ao Docker Compose para fornecer uma interface web completa para gerenciar o banco de dados PostgreSQL.

## 🚀 Como Usar

### 1. Iniciar o pgAdmin

```bash
# Iniciar todos os serviços (incluindo pgAdmin)
make up
# ou
docker-compose up -d
```

### 2. Acessar o pgAdmin

1. Abra seu navegador e acesse: **http://localhost:5050**

2. **Credenciais de Login:**
   - **Email:** `admin@autopro.com`
   - **Senha:** `admin123`

### 3. Configurar Conexão com o Banco de Dados

Após fazer login, você precisa adicionar o servidor PostgreSQL:

1. **Clique com botão direito** em "Servers" (no painel esquerdo)
2. Selecione **"Register" → "Server"**
3. Na aba **"General"**:
   - **Name:** `Mec-Poa Database` (ou qualquer nome de sua preferência)
4. Na aba **"Connection"**:
   - **Host name/address:** `postgres` (nome do serviço no Docker)
   - **Port:** `5432`
   - **Maintenance database:** `mec_poa`
   - **Username:** `postgres`
   - **Password:** `postgres`
   - ✅ Marque **"Save password"** para não precisar digitar sempre
5. Clique em **"Save"**

### 4. Navegar no Banco de Dados

Após conectar, você verá:
- **Databases** → `mec_poa`
- **Schemas** → `public`
- **Tables** → Todas as tabelas do sistema

## 📊 Funcionalidades Úteis

### Consultar Dados

1. Expanda: **Servers** → **Mec-Poa Database** → **Databases** → **mec_poa** → **Schemas** → **public** → **Tables**
2. Clique com botão direito em uma tabela (ex: `orders`)
3. Selecione **"View/Edit Data"** → **"All Rows"**
4. Visualize, edite ou filtre os dados

### Executar Queries SQL

1. Clique com botão direito em **mec_poa**
2. Selecione **"Query Tool"**
3. Digite sua query SQL
4. Clique em **"Execute"** (ou F5)

Exemplo:
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

### Ver Estrutura das Tabelas

1. Clique com botão direito na tabela
2. Selecione **"Properties"**
3. Veja colunas, tipos, constraints, índices, etc.

### Exportar Dados

1. Clique com botão direito na tabela
2. Selecione **"Backup..."**
3. Escolha formato (SQL, CSV, etc.)
4. Execute o backup

### Importar Dados

1. Clique com botão direito na tabela
2. Selecione **"Restore..."** ou use a ferramenta de importação

## 🔧 Comandos Úteis

```bash
# Ver status do pgAdmin
docker ps | grep pgadmin

# Ver logs do pgAdmin
docker-compose logs -f pgadmin

# Reiniciar apenas o pgAdmin
docker-compose restart pgadmin

# Parar o pgAdmin
docker-compose stop pgadmin

# Ver informações do pgAdmin
make pgadmin  # Mostra URL e credenciais
```

## 🔒 Segurança

**⚠️ IMPORTANTE:** As credenciais padrão são para desenvolvimento. Em produção:

1. **Altere as credenciais** no `docker-compose.yml`:
   ```yaml
   PGADMIN_DEFAULT_EMAIL: seu-email@exemplo.com
   PGADMIN_DEFAULT_PASSWORD: sua-senha-segura
   ```

2. **Não exponha a porta 5050** publicamente em produção
3. Use **HTTPS** em produção
4. Configure **autenticação adicional** se necessário

## 📝 Tabelas Principais do Sistema

Principais tabelas que você pode explorar:

- `clients` - Clientes
- `vehicles` - Veículos
- `orders` - Ordens de Serviço
- `order_items` - Itens das OS
- `quotes` - Orçamentos
- `quote_items` - Itens dos orçamentos
- `products` - Produtos/Peças
- `appointments` - Agendamentos
- `accounts_receivable` - Contas a Receber
- `accounts_payable` - Contas a Pagar
- `users` - Usuários do sistema

## 🐛 Troubleshooting

### pgAdmin não inicia

```bash
# Verificar logs
docker-compose logs pgadmin

# Verificar se o container está rodando
docker ps -a | grep pgadmin

# Reiniciar
docker-compose restart pgadmin
```

### Não consegue conectar ao banco

1. Verifique se o serviço `postgres` está rodando:
   ```bash
   docker ps | grep postgres
   ```

2. Verifique o nome do host: use `postgres` (não `localhost`)

3. Verifique as credenciais no `docker-compose.yml`

### Esqueceu a senha do pgAdmin

Você pode redefinir as variáveis de ambiente no `docker-compose.yml` e reiniciar:

```bash
docker-compose down
# Edite o docker-compose.yml
docker-compose up -d pgadmin
```

## 🎯 Dicas

- Use **Bookmarks** para salvar queries frequentes
- Use **Query History** para ver queries executadas anteriormente
- Configure **Dashboard** para monitorar estatísticas do banco
- Use **ERD Tool** para visualizar diagramas das tabelas

---

**Desenvolvido para facilitar o gerenciamento do banco de dados do Sistema de Gestão para Oficina Mecânica**

