#!/bin/bash

# Script para corrigir redirect do domínio autopro.re9suainternet.com.br
# Remove configuração antiga /rare-toy

echo "🔧 Corrigindo configuração do domínio autopro.re9suainternet.com.br"

# 1. Verificar qual configuração está sendo usada
echo ""
echo "📋 Verificando configurações ativas do nginx..."
echo ""
sudo nginx -T 2>/dev/null | grep -A 30 "server_name autopro.re9suainternet.com.br" | head -40

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  O redirect 301 para /rare-toy está provavelmente configurado no Hestia CP"
echo ""
echo "📝 Para corrigir:"
echo ""
echo "1. Acesse o Hestia CP: https://177.67.32.203:8083"
echo "2. Vá em: Web → Web Domains"
echo "3. Localize: autopro.re9suainternet.com.br"
echo "4. Edite o domínio"
echo "5. Verifique se há alguma configuração de 'Redirect' ou 'Document Root' apontando para /rare-toy"
echo "6. Remova essa configuração"
echo "7. Salve as alterações"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 Após fazer as alterações no Hestia, execute:"
echo "   sudo systemctl reload nginx"
echo ""
echo "🧪 Teste com:"
echo "   curl -I http://autopro.re9suainternet.com.br"
echo ""
echo "✅ O resultado deve mostrar Status 200 ou proxy para localhost:5173"
echo "   NÃO deve mostrar Location: http://autopro.re9suainternet.com.br/rare-toy"
echo ""
