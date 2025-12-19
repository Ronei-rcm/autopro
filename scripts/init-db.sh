#!/bin/bash

# Script para inicializar o banco de dados no container

echo "🔄 Aguardando PostgreSQL estar pronto..."
sleep 5

echo "📦 Executando migration..."
docker exec -i mec-poa-db psql -U postgres -d mec_poa < backend/migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration executada com sucesso!"
else
    echo "❌ Erro ao executar migration"
    exit 1
fi

echo "🌱 Executando seed..."
docker exec -it mec-poa-backend npm run seed

if [ $? -eq 0 ]; then
    echo "✅ Seed executado com sucesso!"
else
    echo "⚠️  Seed pode ter falhado (usuário admin pode já existir)"
fi

echo "✨ Banco de dados inicializado!"

