# 🔄 Sistema de Backup do AutoPro

Sistema completo de backup e restauração do projeto AutoPro, incluindo código fonte e banco de dados PostgreSQL.

---

## 📋 Funcionalidades

- ✅ Backup completo do código fonte (excluindo node_modules, dist, etc.)
- ✅ Backup do banco de dados PostgreSQL
- ✅ Backup de arquivos de configuração
- ✅ Backup de segurança antes de restaurar
- ✅ Suporte a backup via Docker
- ✅ Informações detalhadas de cada backup

---

## 🚀 Como Usar

### Fazer Backup

```bash
# Executar o script de backup
./scripts/backup.sh
```

O backup será criado em `./backups/autopro_backup_YYYYMMDD_HHMMSS/`

**O que é incluído no backup:**
- Código fonte (frontend, backend, scripts, docs)
- Banco de dados PostgreSQL (SQL ou dump)
- Arquivos de configuração (.env.example, docker-compose.yml, etc.)
- Informações do backup (backup_info.txt)

**O que é excluído:**
- node_modules
- dist / build
- .git
- logs
- .env (arquivos com senhas)
- backups anteriores

### Restaurar Backup

```bash
# Listar backups disponíveis e restaurar interativamente
./scripts/restore.sh

# Ou restaurar um backup específico
./scripts/restore.sh autopro_backup_20251215_143022

# Ou restaurar o último backup
./scripts/restore.sh latest
```

**⚠️ ATENÇÃO:** A restauração irá:
- Substituir arquivos do projeto atual
- Restaurar banco de dados (apagará dados existentes)
- Criar backup de segurança antes de restaurar

---

## 📁 Estrutura do Backup

```
backups/
└── autopro_backup_20251215_143022/
    ├── code.tar.gz              # Código fonte compactado
    ├── database.sql             # Backup do banco (formato SQL)
    ├── database.dump            # Backup do banco (formato dump)
    ├── backup_info.txt          # Informações do backup
    └── config/                  # Arquivos de configuração
        ├── backend.env.example
        ├── frontend.env.example
        ├── ecosystem.config.js
        └── docker-compose.yml
```

---

## ⚙️ Configuração

O script utiliza as variáveis de ambiente do arquivo `backend/.env`:

```env
DB_NAME=autopro_db
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

Se o arquivo `.env` não existir, valores padrão serão usados.

---

## 🔧 Requisitos

### Para Backup/Restauração Local

- `pg_dump` e `pg_restore` (clientes PostgreSQL)
- `tar` e `gzip`
- Acesso ao banco de dados PostgreSQL

### Para Backup/Restauração via Docker

- Docker instalado
- Container PostgreSQL rodando
- Nome do container contém "postgres"

---

## 📝 Exemplos de Uso

### Backup Automatizado (Cron)

Para fazer backups automáticos, adicione ao crontab:

```bash
# Backup diário às 2h da manhã
0 2 * * * cd /caminho/do/projeto && ./scripts/backup.sh

# Backup a cada 6 horas
0 */6 * * * cd /caminho/do/projeto && ./scripts/backup.sh
```

### Backup Manual com Rotação

```bash
# Fazer backup
./scripts/backup.sh

# Manter apenas os últimos 7 backups
cd backups
ls -t | tail -n +8 | xargs rm -rf
```

### Restauração de Emergência

```bash
# 1. Listar backups disponíveis
ls -lht backups/

# 2. Restaurar o backup mais recente
./scripts/restore.sh latest

# 3. Reiniciar serviços
pm2 restart all
# ou
docker-compose restart
```

---

## 🛡️ Segurança

- **Arquivos .env não são incluídos** no backup (contêm senhas)
- **Backup de segurança automático** antes de qualquer restauração
- **Confirmação obrigatória** antes de restaurar
- Backups podem ser movidos para local externo seguro

---

## 📊 Manutenção dos Backups

### Limpar Backups Antigos

```bash
# Remover backups com mais de 30 dias
find backups/ -type d -name "autopro_backup_*" -mtime +30 -exec rm -rf {} \;
```

### Verificar Tamanho dos Backups

```bash
du -sh backups/*
```

### Mover Backups para Local Seguro

```bash
# Compactar todos os backups
tar -czf backups_archive_$(date +%Y%m%d).tar.gz backups/

# Copiar para servidor remoto
scp backups_archive_*.tar.gz user@servidor:/backup/autopro/
```

---

## ⚠️ Troubleshooting

### Erro: "pg_dump não encontrado"

**Solução:** Instale o cliente PostgreSQL:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# CentOS/RHEL
sudo yum install postgresql
```

### Erro: "Falha de autenticação"

**Solução:** Verifique as credenciais no arquivo `backend/.env` ou use variáveis de ambiente:
```bash
export PGPASSWORD=sua_senha
./scripts/backup.sh
```

### Erro: "Permissão negada"

**Solução:** Dê permissão de execução aos scripts:
```bash
chmod +x scripts/backup.sh scripts/restore.sh
```

### Backup do Banco via Docker não funciona

**Solução:** Verifique o nome do container:
```bash
docker ps | grep postgres
# Use o nome ou ID do container PostgreSQL
```

---

## 📚 Comandos Úteis

```bash
# Listar backups
ls -lht backups/

# Ver informações de um backup
cat backups/autopro_backup_*/backup_info.txt

# Verificar integridade do backup
tar -tzf backups/autopro_backup_*/code.tar.gz | head -20

# Estimar tamanho do backup
du -sh backups/autopro_backup_*/

# Criar link para último backup
ln -sfn $(ls -td backups/autopro_backup_* | head -1) backups/latest
```

---

## 🔄 Integração com PM2

Após restaurar, reinicie os processos:

```bash
# Parar processos
pm2 stop all

# Reiniciar processos
pm2 restart all

# Verificar status
pm2 status
```

---

**Última atualização:** Dezembro 2025  
**Versão:** 1.0.0

