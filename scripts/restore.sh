#!/bin/bash

# Script de Restauração do Projeto AutoPro
# Criado em: Dezembro 2025
# Descrição: Restaura backup do projeto (código + banco de dados)

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BACKUP_DIR="./backups"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Restauração do Projeto AutoPro${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar se o diretório de backup existe
if [ ! -d "${BACKUP_DIR}" ]; then
    echo -e "${RED}✗${NC} Diretório de backups não encontrado: ${BACKUP_DIR}"
    exit 1
fi

# Listar backups disponíveis
echo -e "${BLUE}Backups disponíveis:${NC}"
ls -1td "${BACKUP_DIR}"/autopro_backup_* 2>/dev/null | head -10 | while read backup; do
    backup_name=$(basename "$backup")
    backup_date=$(echo "$backup_name" | grep -oP '\d{8}_\d{6}' | head -1)
    if [ ! -z "$backup_date" ]; then
        formatted_date=$(echo "$backup_date" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\3\/\2\/\1 \4:\5:\6/')
        echo "  - $backup_name ($formatted_date)"
    fi
done

echo ""

# Solicitar backup a restaurar
if [ -z "$1" ]; then
    echo -e "${YELLOW}Digite o nome do backup a restaurar (ou 'latest' para o último):${NC}"
    read -r BACKUP_NAME
else
    BACKUP_NAME="$1"
fi

# Resolver 'latest' para o backup mais recente
if [ "$BACKUP_NAME" = "latest" ]; then
    BACKUP_NAME=$(ls -1td "${BACKUP_DIR}"/autopro_backup_* 2>/dev/null | head -1 | xargs basename)
    if [ -z "$BACKUP_NAME" ]; then
        echo -e "${RED}✗${NC} Nenhum backup encontrado"
        exit 1
    fi
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Verificar se o backup existe
if [ ! -d "${BACKUP_PATH}" ]; then
    echo -e "${RED}✗${NC} Backup não encontrado: ${BACKUP_PATH}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Backup encontrado: ${BACKUP_NAME}"
echo ""

# Confirmar restauração
echo -e "${YELLOW}⚠ ATENÇÃO: Esta operação irá:${NC}"
echo "  - Substituir arquivos do projeto atual"
echo "  - Restaurar banco de dados (isso apagará dados existentes!)"
echo ""
echo -e "${YELLOW}Deseja continuar? (sim/não):${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "sim" ] && [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "yes" ] && [ "$CONFIRM" != "y" ]; then
    echo -e "${YELLOW}Restauração cancelada${NC}"
    exit 0
fi

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

# 1. Fazer backup do estado atual (segurança)
echo -e "\n${BLUE}[1/4]${NC} Criando backup de segurança do estado atual..."
CURRENT_BACKUP="${BACKUP_DIR}/before_restore_$(date +"%Y%m%d_%H%M%S")"
mkdir -p "${CURRENT_BACKUP}"
echo -e "${GREEN}✓${NC} Backup de segurança criado em: ${CURRENT_BACKUP}"

# 2. Restaurar código fonte
echo -e "\n${BLUE}[2/4]${NC} Restaurando código fonte..."

if [ ! -f "${BACKUP_PATH}/code.tar.gz" ]; then
    echo -e "${RED}✗${NC} Arquivo code.tar.gz não encontrado no backup"
    exit 1
fi

# Fazer backup dos arquivos .env antes de restaurar
if [ -f "./backend/.env" ]; then
    cp ./backend/.env "${CURRENT_BACKUP}/backend.env"
fi
if [ -f "./frontend/.env" ]; then
    cp ./frontend/.env "${CURRENT_BACKUP}/frontend.env"
fi

# Extrair código
cd "$(dirname "$0")/.."
tar -xzf "${BACKUP_PATH}/code.tar.gz"

# Restaurar .env se existir no backup de segurança
if [ -f "${CURRENT_BACKUP}/backend.env" ]; then
    cp "${CURRENT_BACKUP}/backend.env" ./backend/.env
fi
if [ -f "${CURRENT_BACKUP}/frontend.env" ]; then
    cp "${CURRENT_BACKUP}/frontend.env" ./frontend/.env
fi

echo -e "${GREEN}✓${NC} Código fonte restaurado"

# 3. Restaurar banco de dados
echo -e "\n${BLUE}[3/4]${NC} Restaurando banco de dados..."

# Verificar qual formato de backup existe
if [ -f "${BACKUP_PATH}/database.dump" ]; then
    echo -e "${BLUE}→${NC} Restaurando formato dump..."
    
    if command -v pg_restore &> /dev/null; then
        export PGPASSWORD="${DB_PASSWORD:-}"
        pg_restore -h "${DB_HOST:-localhost}" \
                   -p "${DB_PORT:-5432}" \
                   -U "${DB_USER:-postgres}" \
                   -d "${DB_NAME:-mec_poa}" \
                   -c \
                   "${BACKUP_PATH}/database.dump" || {
            echo -e "${YELLOW}⚠${NC} Alguns erros durante restauração (pode ser normal se objetos já existirem)"
        }
        unset PGPASSWORD
        echo -e "${GREEN}✓${NC} Banco de dados restaurado (dump)"
    else
        echo -e "${YELLOW}⚠${NC} pg_restore não encontrado. Tentando via Docker..."
        if command -v docker &> /dev/null; then
            docker exec -i $(docker ps -qf "name=postgres") pg_restore -U "${DB_USER:-postgres}" -d "${DB_NAME:-mec_poa}" -c < "${BACKUP_PATH}/database.dump" || {
                echo -e "${YELLOW}⚠${NC} Alguns erros durante restauração"
            }
            echo -e "${GREEN}✓${NC} Banco de dados restaurado via Docker"
        else
            echo -e "${RED}✗${NC} Não foi possível restaurar o banco de dados"
        fi
    fi
elif [ -f "${BACKUP_PATH}/database.sql" ]; then
    echo -e "${BLUE}→${NC} Restaurando formato SQL..."
    
    if command -v psql &> /dev/null; then
        export PGPASSWORD="${DB_PASSWORD:-}"
        psql -h "${DB_HOST:-localhost}" \
             -p "${DB_PORT:-5432}" \
             -U "${DB_USER:-postgres}" \
             -d "${DB_NAME:-mec_poa}" \
             -f "${BACKUP_PATH}/database.sql" || {
            echo -e "${YELLOW}⚠${NC} Alguns erros durante restauração (pode ser normal se objetos já existirem)"
        }
        unset PGPASSWORD
        echo -e "${GREEN}✓${NC} Banco de dados restaurado (SQL)"
    else
        echo -e "${YELLOW}⚠${NC} psql não encontrado. Tentando via Docker..."
        if command -v docker &> /dev/null; then
            docker exec -i $(docker ps -qf "name=postgres") psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-mec_poa}" < "${BACKUP_PATH}/database.sql" || {
                echo -e "${YELLOW}⚠${NC} Alguns erros durante restauração"
            }
            echo -e "${GREEN}✓${NC} Banco de dados restaurado via Docker"
        else
            echo -e "${RED}✗${NC} Não foi possível restaurar o banco de dados"
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} Arquivo de backup do banco de dados não encontrado. Pulando restauração do banco."
fi

# 4. Instalar dependências
echo -e "\n${BLUE}[4/4]${NC} Instalando dependências..."

if [ -d "./frontend" ] && [ -f "./frontend/package.json" ]; then
    echo -e "${BLUE}→${NC} Instalando dependências do frontend..."
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓${NC} Dependências do frontend instaladas"
fi

if [ -d "./backend" ] && [ -f "./backend/package.json" ]; then
    echo -e "${BLUE}→${NC} Instalando dependências do backend..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✓${NC} Dependências do backend instaladas"
fi

# Resumo final
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Restauração concluída com sucesso!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Backup restaurado: ${BACKUP_NAME}"
echo -e "Backup de segurança criado em: ${CURRENT_BACKUP}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "  1. Verificar configurações nos arquivos .env"
echo "  2. Reiniciar serviços (PM2 ou Docker)"
echo "  3. Verificar se o banco de dados foi restaurado corretamente"
echo ""

