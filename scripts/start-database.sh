#!/bin/bash

# Script para iniciar o banco de dados PostgreSQL

echo "🔍 Verificando se o PostgreSQL está rodando..."

# Verificar se está rodando via Docker
if docker ps | grep -q "mec-poa-db\|postgres"; then
    echo "✅ PostgreSQL já está rodando no Docker"
    exit 0
fi

# Verificar se está rodando localmente
if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -h localhost -p 5433 >/dev/null 2>&1; then
        echo "✅ PostgreSQL já está rodando localmente na porta 5433"
        exit 0
    fi
fi

echo "📦 Iniciando PostgreSQL via Docker Compose..."

cd "$(dirname "$0")/.." || exit 1

# Iniciar apenas o serviço do banco
if docker-compose up -d postgres; then
    echo "⏳ Aguardando PostgreSQL inicializar..."
    sleep 5
    
    # Verificar se está rodando
    if docker ps | grep -q "mec-poa-db\|postgres"; then
        echo "✅ PostgreSQL iniciado com sucesso!"
        echo ""
        echo "📋 Informações de conexão:"
        echo "   Host: localhost"
        echo "   Porta: 5433"
        echo "   Database: mec_poa"
        echo "   User: postgres"
        echo "   Password: postgres"
    else
        echo "❌ Erro ao iniciar PostgreSQL"
        echo "Verifique os logs com: docker-compose logs postgres"
        exit 1
    fi
else
    echo "❌ Erro ao iniciar Docker Compose"
    echo ""
    echo "💡 Alternativas:"
    echo "   1. Instalar PostgreSQL localmente"
    echo "   2. Verificar se o Docker está rodando"
    echo "   3. Verificar permissões do Docker"
    exit 1
fi
