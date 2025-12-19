#!/bin/bash

# Script para configurar ambiente local

set -e

echo "🚀 Configurando ambiente local..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18 ou superior."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18 ou superior é necessário. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se PostgreSQL está instalado e rodando
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL não encontrado. Você precisará instalá-lo e configurá-lo manualmente."
    echo "   Ou use Docker apenas para o banco: docker-compose up -d postgres"
else
    echo "✅ PostgreSQL encontrado"
fi

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

echo ""
echo "📦 Instalando dependências do backend..."
cd backend
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env do backend..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Ajuste as configurações se necessário."
fi
npm install
cd ..

echo ""
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure o PostgreSQL:"
echo "      - Crie o banco de dados: createdb mec_poa"
echo "      - Ou use Docker: docker-compose up -d postgres"
echo ""
echo "   2. Configure o backend:"
echo "      - Edite backend/.env se necessário"
echo "      - Execute migrations: npm run migrate"
echo "      - Execute seed: npm run seed"
echo ""
echo "   3. Inicie os serviços:"
echo "      - Desenvolvimento: npm run dev"
echo "      - Ou separadamente:"
echo "        - Backend: npm run dev:backend"
echo "        - Frontend: npm run dev:frontend"
echo ""
