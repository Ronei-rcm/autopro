# ✅ pgAdmin Configurado com Sucesso!

## 📦 O que foi feito

✅ Serviço pgAdmin adicionado ao `docker-compose.yml`
✅ Volume persistente configurado para salvar dados
✅ Porta 5050 configurada para acesso externo
✅ Credenciais padrão configuradas
✅ Documentação completa criada (`PGADMIN_GUIDE.md`)
✅ README atualizado com informações do pgAdmin
✅ Comando `make pgadmin` adicionado ao Makefile

## 🚀 Como Iniciar

### Opção 1: Iniciar todos os serviços (recomendado)

```bash
cd /home/mec-poa
make up
# ou
docker-compose up -d
```

Isso iniciará:
- ✅ PostgreSQL (porta 5433)
- ✅ Backend (porta 3002)
- ✅ Frontend (porta 5173)
- ✅ **pgAdmin (porta 5050)** ⭐ NOVO

### Opção 2: Iniciar apenas o pgAdmin

Se você já tem os outros serviços rodando:

```bash
docker-compose up -d pgadmin
```

## 🌐 Acessar o pgAdmin

1. **URL:** http://localhost:5050
2. **Email:** `admin@autopro.com`
3. **Senha:** `admin123`

## 🔌 Configurar Conexão com o Banco

Após fazer login no pgAdmin:

1. Clique com botão direito em **"Servers"** (painel esquerdo)
2. Selecione **"Register" → "Server"**
3. **Aba "General":**
   - Name: `Mec-Poa Database`
4. **Aba "Connection":**
   - Host name/address: `postgres`
   - Port: `5432`
   - Maintenance database: `mec_poa`
   - Username: `postgres`
   - Password: `postgres`
   - ✅ Marque **"Save password"**
5. Clique em **"Save"**

## ✅ Verificar se está funcionando

```bash
# Ver status de todos os containers
docker-compose ps

# Ver logs do pgAdmin
docker-compose logs -f pgadmin

# Ver informações de acesso
make pgadmin
```

## 📚 Documentação

Para instruções detalhadas, consulte:
- **[PGADMIN_GUIDE.md](./PGADMIN_GUIDE.md)** - Guia completo do pgAdmin

## 🎯 Funcionalidades Disponíveis

Com o pgAdmin você pode:
- ✅ Visualizar todas as tabelas do banco
- ✅ Consultar e editar dados diretamente
- ✅ Executar queries SQL
- ✅ Ver estrutura das tabelas (colunas, tipos, constraints)
- ✅ Criar e gerenciar índices
- ✅ Exportar/Importar dados
- ✅ Fazer backup e restore
- ✅ Monitorar performance do banco
- ✅ Visualizar diagramas ERD

## 🔍 Principais Tabelas para Explorar

- `orders` - Ordens de Serviço
- `order_items` - Itens das OS
- `quotes` - Orçamentos
- `quote_items` - Itens dos orçamentos
- `clients` - Clientes
- `vehicles` - Veículos
- `products` - Produtos/Peças
- `appointments` - Agendamentos
- `accounts_receivable` - Contas a Receber
- `accounts_payable` - Contas a Pagar
- `users` - Usuários do sistema

## 🔒 Segurança (Para Produção)

**⚠️ ATENÇÃO:** As credenciais padrão são apenas para desenvolvimento!

Antes de usar em produção, altere no `docker-compose.yml`:
- `PGADMIN_DEFAULT_EMAIL` → seu email
- `PGADMIN_DEFAULT_PASSWORD` → senha forte
- Considere usar HTTPS
- Não exponha a porta 5050 publicamente

## 📝 Exemplos de Queries Úteis

### Ver últimas OS criadas
```sql
SELECT o.*, c.name as client_name, u.name as mechanic_name
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN users u ON o.mechanic_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Ver OS por status
```sql
SELECT status, COUNT(*) as total
FROM orders
GROUP BY status;
```

### Ver produtos com estoque baixo
```sql
SELECT name, current_quantity, min_quantity
FROM products
WHERE current_quantity <= min_quantity
ORDER BY current_quantity ASC;
```

## 🎉 Pronto para Usar!

Agora você tem uma interface web completa para gerenciar o banco de dados PostgreSQL do sistema!

---

**Desenvolvido para facilitar o gerenciamento do banco de dados do Sistema de Gestão para Oficina Mecânica**

