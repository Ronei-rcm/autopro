#!/bin/bash

# Script de Backup Geral do Projeto AutoPro
# Criado em: Dezembro 2025
# Descrição: Faz backup completo do projeto (código + banco de dados)

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_NAME="autopro"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${PROJECT_NAME}_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Carregar variáveis de ambiente do backend
if [ -f "./backend/.env" ]; then
    export $(grep -v '^#' ./backend/.env | xargs)
    echo -e "${GREEN}✓${NC} Variáveis de ambiente carregadas"
else
    echo -e "${YELLOW}⚠${NC} Arquivo .env não encontrado, usando valores padrão"
    DB_NAME="${DB_NAME:-mec_poa}"
    DB_USER="${DB_USER:-postgres}"
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Backup Geral do Projeto AutoPro${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Criar diretório de backup
mkdir -p "${BACKUP_PATH}"
echo -e "${GREEN}✓${NC} Diretório de backup criado: ${BACKUP_PATH}"

# 1. Backup do Código Fonte
echo -e "\n${BLUE}[1/4]${NC} Fazendo backup do código fonte..."
cd "$(dirname "$0")/.."

# Arquivos e diretórios para incluir
tar -czf "${BACKUP_PATH}/code.tar.gz" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='logs' \
    --exclude='backups' \
    --exclude='.env' \
    --exclude='.DS_Store' \
    --exclude='coverage' \
    --exclude='.vite' \
    --exclude='*.swp' \
    --exclude='*.swo' \
    --exclude='*~' \
    frontend/ backend/ scripts/ docs/ docker-compose.yml ecosystem.config.js .gitignore README.md

echo -e "${GREEN}✓${NC} Backup do código fonte concluído"

# 2. Backup do Banco de Dados PostgreSQL
echo -e "\n${BLUE}[2/4]${NC} Fazendo backup do banco de dados..."

# Verificar se pg_dump está disponível
if ! command -v pg_dump &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} pg_dump não encontrado. Tentando usar Docker..."
    
    # Tentar fazer backup via Docker
    if command -v docker &> /dev/null; then
        echo -e "${BLUE}→${NC} Usando Docker para backup do banco..."
        docker exec -t $(docker ps -qf "name=postgres") pg_dump -U "${DB_USER:-postgres}" -d "${DB_NAME:-mec_poa}" > "${BACKUP_PATH}/database.sql" 2>/dev/null || {
            echo -e "${YELLOW}⚠${NC} Não foi possível fazer backup via Docker. Pulando backup do banco..."
        }
    else
        echo -e "${YELLOW}⚠${NC} Docker não encontrado. Pulando backup do banco de dados."
    fi
else
    # Backup direto do PostgreSQL
    export PGPASSWORD="${DB_PASSWORD:-}"
    pg_dump -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-postgres}" \
            -d "${DB_NAME:-mec_poa}" \
            -F c \
            -f "${BACKUP_PATH}/database.dump" 2>/dev/null || {
        echo -e "${YELLOW}⚠${NC} Tentando backup em formato SQL..."
        pg_dump -h "${DB_HOST:-localhost}" \
                -p "${DB_PORT:-5432}" \
                -U "${DB_USER:-postgres}" \
                -d "${DB_NAME:-mec_poa}" \
                -f "${BACKUP_PATH}/database.sql" 2>/dev/null || {
            echo -e "${RED}✗${NC} Erro ao fazer backup do banco de dados"
            echo -e "${YELLOW}  Verifique as credenciais do banco de dados${NC}"
        }
    }
    unset PGPASSWORD
fi

if [ -f "${BACKUP_PATH}/database.sql" ] || [ -f "${BACKUP_PATH}/database.dump" ]; then
    echo -e "${GREEN}✓${NC} Backup do banco de dados concluído"
fi

# 3. Backup de arquivos de configuração importantes
echo -e "\n${BLUE}[3/4]${NC} Fazendo backup de configurações..."

mkdir -p "${BACKUP_PATH}/config"

# Copiar arquivos de configuração (sem senhas)
if [ -f "./backend/.env.example" ]; then
    cp ./backend/.env.example "${BACKUP_PATH}/config/backend.env.example"
fi
if [ -f "./frontend/.env.example" ]; then
    cp ./frontend/.env.example "${BACKUP_PATH}/config/frontend.env.example"
fi
if [ -f "./ecosystem.config.js" ]; then
    cp ./ecosystem.config.js "${BACKUP_PATH}/config/"
fi
if [ -f "./docker-compose.yml" ]; then
    cp ./docker-compose.yml "${BACKUP_PATH}/config/"
fi

echo -e "${GREEN}✓${NC} Backup de configurações concluído"

# 4. Criar arquivo de informações do backup
echo -e "\n${BLUE}[4/4]${NC} Criando arquivo de informações do backup..."

cat > "${BACKUP_PATH}/backup_info.txt" << EOF
========================================
  Informações do Backup
========================================
Data/Hora: $(date '+%d/%m/%Y %H:%M:%S')
Versão do Script: 1.0.0
Sistema: $(uname -a)

Conteúdo do Backup:
- Código fonte (code.tar.gz)
- Banco de dados (database.sql ou database.dump)
- Configurações (config/)

Banco de Dados:
- Nome: ${DB_NAME:-mec_poa}
- Host: ${DB_HOST:-localhost}
- Porta: ${DB_PORT:-5432}
- Usuário: ${DB_USER:-postgres}

Tamanho dos Arquivos:
$(du -sh "${BACKUP_PATH}"/* 2>/dev/null | awk '{print $1 "\t" $2}')

========================================
  Instruções de Restauração
========================================

1. Extrair o código:
   tar -xzf code.tar.gz

2. Restaurar banco de dados (SQL):
   psql -h localhost -U postgres -d autopro_db < database.sql

3. Ou restaurar banco de dados (dump):
   pg_restore -h localhost -U postgres -d autopro_db -c database.dump

4. Instalar dependências:
   cd frontend && npm install
   cd ../backend && npm install

5. Configurar variáveis de ambiente:
   Copiar arquivos .env.example para .env e configurar

========================================
EOF

echo -e "${GREEN}✓${NC} Arquivo de informações criado"

# Resumo final
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Backup concluído com sucesso!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Localização: ${BACKUP_PATH}"
echo -e "Tamanho total: $(du -sh "${BACKUP_PATH}" | awk '{print $1}')"
echo ""
echo -e "Arquivos criados:"
ls -lh "${BACKUP_PATH}" | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}'
echo ""

# Criar link simbólico para o último backup
ln -sfn "${BACKUP_NAME}" "${BACKUP_DIR}/latest"
echo -e "${GREEN}✓${NC} Link 'latest' criado em ${BACKUP_DIR}/latest"
echo ""

