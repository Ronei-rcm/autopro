#!/bin/bash

# Script para inicializar banco de dados local

set -e

echo "🗄️  Inicializando banco de dados local..."

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 -U postgres &> /dev/null; then
    echo "❌ PostgreSQL não está rodando ou não está acessível."
    echo "   Verifique se o PostgreSQL está instalado e rodando."
    echo "   Ou use Docker: docker-compose up -d postgres"
    exit 1
fi

echo "✅ PostgreSQL está rodando"

# Carregar variáveis de ambiente do backend
if [ -f backend/.env ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
else
    echo "⚠️  Arquivo backend/.env não encontrado. Usando valores padrão..."
    export DB_NAME=mec_poa
    export DB_USER=postgres
    export DB_PASSWORD=postgres
    export DB_HOST=localhost
    export DB_PORT=5432
fi

# Criar banco de dados se não existir
echo ""
echo "📦 Criando banco de dados se não existir..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo "✅ Banco de dados '$DB_NAME' verificado/criado"

# Executar migrations
echo ""
echo "📝 Executando migrations..."
cd backend
for migration in migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "   Executando: $migration"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration" > /dev/null 2>&1 || true
    fi
done
cd ..

echo "✅ Migrations executadas"

# Executar seed
echo ""
echo "🌱 Executando seed..."
cd backend
npm run seed
cd ..

echo ""
echo "✅ Banco de dados inicializado com sucesso!"
echo ""
echo "📋 Informações:"
echo "   - Banco: $DB_NAME"
echo "   - Host: $DB_HOST:$DB_PORT"
echo "   - Usuário: $DB_USER"
echo ""
