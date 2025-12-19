# 🔥 Correção de Firewall - Acesso Externo

## ✅ Problema Resolvido

As portas **5173** (frontend) e **3002** (backend) foram liberadas no firewall iptables.

## 🔧 O que foi feito

1. **Regras adicionadas ao iptables:**
   ```bash
   sudo iptables -I INPUT -p tcp --dport 5173 -j ACCEPT
   sudo iptables -I INPUT -p tcp --dport 3002 -j ACCEPT
   ```

2. **Script criado:** `scripts/fix-firewall.sh`
   - Configura firewall automaticamente
   - Salva regras permanentemente
   - Suporta múltiplos tipos de firewall

## 📋 Verificação

### Status das Portas
```bash
# Verificar regras
sudo iptables -L INPUT -n | grep -E "5173|3002"

# Testar localmente
curl http://localhost:5173
curl http://localhost:3002/health
```

### URLs de Acesso
- **Frontend**: http://177.67.32.203:5173
- **Backend**: http://177.67.32.203:3002
- **API**: http://177.67.32.203:3002/api

## ⚠️ Se ainda não conseguir acessar

### 1. Firewall do Provedor/Cloud
Se estiver usando AWS, DigitalOcean, Azure, etc., verifique:
- **Security Groups** (AWS)
- **Network ACLs**
- **Firewall Rules** no painel de controle

### 2. Firewall do Painel Hestia
Se estiver usando Hestia Control Panel:
```bash
# Verificar configurações do Hestia
sudo v-list-firewall
```

### 3. Testar de outro local
```bash
# De outro computador
curl http://177.67.32.203:5173
curl http://177.67.32.203:3002/health
```

### 4. Verificar logs
```bash
# Logs do PM2
pm2 logs

# Logs do sistema
sudo journalctl -u firewalld
sudo dmesg | grep -i firewall
```

## 🔄 Reaplicar regras (se necessário)

```bash
# Executar script
sudo ./scripts/fix-firewall.sh

# Ou manualmente
sudo iptables -I INPUT -p tcp --dport 5173 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3002 -j ACCEPT
```

## 📝 Notas Importantes

1. **Política padrão**: O iptables está com política `DROP`, então todas as portas precisam ser explicitamente liberadas
2. **Ordem das regras**: As regras foram adicionadas no topo da chain INPUT para ter prioridade
3. **Persistência**: As regras podem precisar ser reaplicadas após reinicialização, dependendo da configuração do sistema

## ✅ Status Atual

- ✅ Porta 5173 liberada no iptables
- ✅ Porta 3002 liberada no iptables
- ✅ Serviços rodando no PM2
- ✅ Acesso local funcionando
- ⚠️ Acesso externo depende de firewall do provedor

---

**Última atualização**: 19/12/2024
