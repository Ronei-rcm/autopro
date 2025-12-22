#!/bin/bash

# Script para executar a migration da tabela workshop_info
# Uso: ./scripts/run-workshop-info-migration.sh

echo "🔧 Executando migration da tabela workshop_info..."

# Verificar se está usando Docker
if command -v docker &> /dev/null && docker ps | grep -q "mec-poa"; then
    echo "📦 Usando Docker..."
    
    # Tentar encontrar o container do banco
    DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "(postgres|db|database)" | head -n 1)
    
    if [ -z "$DB_CONTAINER" ]; then
        echo "❌ Container do banco de dados não encontrado"
        echo "💡 Tente: docker-compose exec backend npm run migrate:up"
        exit 1
    fi
    
    echo "📊 Executando migration no container: $DB_CONTAINER"
    docker exec -i "$DB_CONTAINER" psql -U postgres -d mec_poa < backend/migrations/008_add_workshop_info.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration executada com sucesso!"
    else
        echo "❌ Erro ao executar migration"
        exit 1
    fi
else
    # Executar diretamente no banco local
    echo "💻 Executando migration diretamente no banco..."
    
    # Verificar se psql está disponível
    if ! command -v psql &> /dev/null; then
        echo "❌ psql não encontrado. Instale o PostgreSQL client ou use Docker."
        echo "💡 Alternativa: Execute o SQL manualmente no seu cliente de banco de dados"
        exit 1
    fi
    
    # Ler variáveis de ambiente do backend
    if [ -f backend/.env ]; then
        source <(grep -E '^DB_' backend/.env | sed 's/^/export /')
    fi
    
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-mec_poa}
    DB_USER=${DB_USER:-postgres}
    
    echo "📊 Conectando ao banco: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f backend/migrations/008_add_workshop_info.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration executada com sucesso!"
    else
        echo "❌ Erro ao executar migration"
        echo "💡 Verifique as credenciais do banco de dados em backend/.env"
        exit 1
    fi
fi

echo ""
echo "🎉 Pronto! A tabela workshop_info foi criada."
echo "🔄 Recarregue a página /informacoes-oficina no navegador."
