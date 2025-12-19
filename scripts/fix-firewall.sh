#!/bin/bash

# Script para configurar firewall e liberar portas do projeto

set -e

echo "🔧 Configurando firewall para liberar portas do projeto..."

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Este script precisa ser executado como root (use sudo)"
    exit 1
fi

# Portas a liberar
PORTS=(5173 3002)

# Verificar e configurar iptables
echo "📝 Adicionando regras ao iptables..."
for port in "${PORTS[@]}"; do
    # Verificar se a regra já existe
    if ! iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null; then
        iptables -I INPUT -p tcp --dport "$port" -j ACCEPT
        echo "  ✓ Porta $port liberada"
    else
        echo "  ✓ Porta $port já estava liberada"
    fi
done

# Tentar salvar regras permanentemente
echo ""
echo "💾 Salvando regras permanentemente..."

# Debian/Ubuntu
if [ -d /etc/iptables ]; then
    mkdir -p /etc/iptables
    iptables-save > /etc/iptables/rules.v4
    echo "  ✓ Regras salvas em /etc/iptables/rules.v4"
fi

# Verificar se há netfilter-persistent
if command -v netfilter-persistent &> /dev/null; then
    netfilter-persistent save
    echo "  ✓ Regras salvas com netfilter-persistent"
fi

# Verificar firewalld (RedHat/CentOS)
if systemctl is-active --quiet firewalld 2>/dev/null; then
    echo ""
    echo "🔥 Configurando firewalld..."
    for port in "${PORTS[@]}"; do
        firewall-cmd --permanent --add-port="$port/tcp" 2>/dev/null || true
        echo "  ✓ Porta $port adicionada ao firewalld"
    done
    firewall-cmd --reload
    echo "  ✓ Firewalld recarregado"
fi

# Verificar UFW (Ubuntu)
if systemctl is-active --quiet ufw 2>/dev/null; then
    echo ""
    echo "🛡️  Configurando UFW..."
    for port in "${PORTS[@]}"; do
        ufw allow "$port/tcp" 2>/dev/null || true
        echo "  ✓ Porta $port adicionada ao UFW"
    done
fi

echo ""
echo "✅ Firewall configurado!"
echo ""
echo "📋 Portas liberadas:"
for port in "${PORTS[@]}"; do
    echo "   - $port/tcp"
done
echo ""
echo "⚠️  Nota: Se ainda não conseguir acessar, verifique:"
echo "   1. Firewall do provedor/cloud (Security Groups)"
echo "   2. Firewall do roteador"
echo "   3. Configurações de rede do servidor"
