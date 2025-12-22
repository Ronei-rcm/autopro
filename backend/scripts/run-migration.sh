#!/bin/bash

# Script para executar a migration 011_add_module_visibility.sql

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-mec_poa}"
DB_USER="${DB_USER:-postgres}"

echo "Executando migration 011_add_module_visibility.sql..."
echo "Banco: $DB_NAME em $DB_HOST:$DB_PORT"

PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "migrations/011_add_module_visibility.sql"

if [ $? -eq 0 ]; then
    echo "✅ Migration executada com sucesso!"
else
    echo "❌ Erro ao executar migration"
    exit 1
fi

