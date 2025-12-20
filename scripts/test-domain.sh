#!/bin/bash

echo "🧪 Testando configuração do domínio autopro.re9suainternet.com.br"
echo ""

echo "1. Teste local (com header Host):"
curl -I http://127.0.0.1/rare-toy -H "Host: autopro.re9suainternet.com.br" 2>&1 | grep -E "HTTP|Location"
echo ""

echo "2. Teste direto pelo IP (com header Host):"
curl -I http://177.67.32.203/rare-toy -H "Host: autopro.re9suainternet.com.br" 2>&1 | grep -E "HTTP|Location"
echo ""

echo "3. Teste pelo domínio (externo):"
curl -I http://autopro.re9suainternet.com.br/rare-toy 2>&1 | grep -E "HTTP|Location"
echo ""

echo "4. Verificando qual server block está sendo usado:"
echo "   sudo nginx -T | grep -A 50 'server_name autopro' | head -60"
echo ""

echo "✅ Se os testes 1 e 2 retornam 301 mas o teste 3 retorna 404, há um proxy/CDN na frente fazendo cache"
