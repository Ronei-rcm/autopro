#!/bin/bash

echo "=== TESTE DO FLUXO DE APROVAÇÃO DE ORÇAMENTO ==="
echo ""

# Verificar agendamentos antes
echo "1. Agendamentos ANTES do teste:"
docker exec -i mec-poa-db psql -U postgres -d mec_poa -c "SELECT COUNT(*) as total FROM appointments;"

echo ""
echo "2. Monitorando logs do backend..."
echo "   (Pressione Ctrl+C para parar)"
echo ""

# Monitorar logs em tempo real
pm2 logs mec-poa-backend --lines 0 --nostream 2>&1 | grep --line-buffered -E "(INICIANDO|Criando|Agendamento|ERRO|Approve|===|✅|❌)"

