# 🌐 Configuração do Domínio autopro.re9suainternet.com.br

## 📊 Status Atual

✅ **Funcionando**: `http://autopro.re9suainternet.com.br:5173` (acesso direto com porta)  
✅ **Funcionando**: `http://autopro.re9suainternet.com.br` (proxy nginx na porta 80)  
⚠️ **IMPORTANTE**: Remover configuração antiga `/rare-toy` no painel Hestia (se existir)

## 🔄 Atualização de Apontamento

### Remover Configuração Antiga `/rare-toy`

Se houver uma configuração antiga apontando para `/rare-toy`, ela deve ser removida ou atualizada no painel do Hestia:

**URL Antiga**: `http://autopro.re9suainternet.com.br/rare-toy`  
**URL Nova**: `http://autopro.re9suainternet.com.br:5173/login` (ou apenas `http://autopro.re9suainternet.com.br` que redireciona para login automaticamente)

### Como Atualizar no Hestia CP

1. Acesse o painel do Hestia CP
2. Vá em **Web Domains** ou **Domínios Web**
3. Localize `autopro.re9suainternet.com.br`
4. **Remova** qualquer configuração de subpasta/document root que aponte para `/rare-toy`
5. Certifique-se de que o domínio está apontando para o **document root padrão** (geralmente `/home/[usuário]/web/autopro.re9suainternet.com.br/public_html`)
6. **OU** configure o domínio para usar **proxy reverso** na porta 80 (já configurado no nginx)

## ✅ Configurações Aplicadas

### 1. Nginx Configuration

Criada configuração do nginx em `/etc/nginx/conf.d/domains/autopro.re9suainternet.com.br.conf`:

- **Frontend**: Proxy reverso para `http://localhost:5173` (Vite dev server)
- **API**: Proxy reverso para `http://localhost:3002/api`
- **Logs**: `/var/log/nginx/autopro-access.log` e `/var/log/nginx/autopro-error.log`
- **WebSocket**: Suporte para HMR (Hot Module Replacement) do Vite

### 2. Backend CORS

Atualizado `backend/.env` para aceitar o domínio:
```
CORS_ORIGIN=http://autopro.re9suainternet.com.br,http://www.autopro.re9suainternet.com.br,http://localhost:5173
```

### 3. Frontend Build

Build de produção já foi gerado em `/home/mec-poa/frontend/dist`

### 4. Variáveis de Ambiente

- **Backend**: Porta 3002 (local)
- **Frontend**: Usa `/api` que é proxyado pelo nginx

## 🔧 Comandos Úteis

### Recarregar Nginx
```bash
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx  # Recarregar
```

### Verificar Logs
```bash
# Nginx
sudo tail -f /var/log/nginx/autopro-access.log
sudo tail -f /var/log/nginx/autopro-error.log

# Backend
pm2 logs mec-poa-backend

# Frontend
pm2 logs mec-poa-frontend
```

### Reiniciar Serviços
```bash
# Backend
pm2 restart mec-poa-backend --update-env

# Frontend (se necessário)
pm2 restart mec-poa-frontend
```

### Testar Acesso
```bash
# Frontend
curl -I http://autopro.re9suainternet.com.br

# API
curl http://autopro.re9suainternet.com.br/api/health
```

## 📝 Próximos Passos (Opcional)

### SSL/HTTPS com Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d autopro.re9suainternet.com.br

# Renovação automática
sudo certbot renew --dry-run
```

Após SSL, atualizar:
- `CORS_ORIGIN` no backend para incluir `https://autopro.re9suainternet.com.br`
- Recarregar backend: `pm2 restart mec-poa-backend --update-env`

## ⚠️ Notas Importantes

1. **Porta do Backend**: O backend está rodando na porta 3002 (local), não 3001
2. **Build do Frontend**: Sempre faça `npm run build` no frontend após mudanças
3. **CORS**: O backend aceita múltiplas origens separadas por vírgula
4. **PM2**: Use `--update-env` ao reiniciar para carregar novas variáveis
5. **Configuração Nginx**: A configuração está em `/etc/nginx/conf.d/00-autopro.re9suainternet.com.br.conf`
6. **Roteamento**: O frontend redireciona automaticamente para `/login` se o usuário não estiver autenticado
7. **Hestia**: Se houver configuração antiga apontando para `/rare-toy`, remova no painel do Hestia
8. **Acesso**: 
   - `http://autopro.re9suainternet.com.br` → redireciona para login se não autenticado
   - `http://autopro.re9suainternet.com.br:5173` → acesso direto (desenvolvimento)

## 🔧 Solução Temporária

Enquanto o proxy na porta 80 não está funcionando, você pode acessar:
- **Frontend**: `http://autopro.re9suainternet.com.br:5173`
- **API**: `http://autopro.re9suainternet.com.br:3002/api` (se necessário)

## 📋 Checklist para Resolver Porta 80

1. ✅ DNS configurado corretamente
2. ✅ Nginx configurado para proxy
3. ✅ Vite configurado com allowedHosts
4. ⚠️ **Verificar no painel Hestia**: Pode haver uma configuração de domínio que está interceptando
5. ⚠️ **Verificar se há CDN/Cloudflare**: Pode estar fazendo cache ou proxy

## 🔍 Troubleshooting

### Erro 404 Not Found (externamente)
**Sintoma**: Funciona localmente mas retorna 404 externamente

**Possíveis causas**:
1. **DNS não apontando corretamente**: Verificar se `autopro.re9suainternet.com.br` aponta para `177.67.32.203`
   ```bash
   dig autopro.re9suainternet.com.br +short
   # Deve retornar: 177.67.32.203
   ```

2. **CDN/Cloudflare na frente**: Se houver Cloudflare, pode estar fazendo cache ou proxy
   - Limpar cache no painel do Cloudflare
   - Verificar se está em modo "DNS Only" ou "Proxied"

3. **Configuração do Hestia**: Verificar no painel do Hestia se há configuração específica para o domínio
   - Remover qualquer configuração de subpasta/document root que aponte para `/rare-toy`
   - O domínio deve usar o document root padrão ou proxy reverso

4. **Ordem de carregamento do nginx**: Verificar se nossa configuração está sendo carregada primeiro
   ```bash
   sudo nginx -T 2>/dev/null | grep -B 5 "server_name autopro"
   ```

**Solução**: Testar localmente primeiro:
```bash
curl -H "Host: autopro.re9suainternet.com.br" http://127.0.0.1/
# Se funcionar localmente, o problema é DNS/CDN
```

### Erro 502 Bad Gateway
- Verificar se backend está rodando: `pm2 status`
- Verificar logs: `pm2 logs mec-poa-backend`
- Verificar porta: `netstat -tlnp | grep 3002`

### Erro 404 no Frontend
- Verificar se build existe: `ls -la /home/mec-poa/frontend/dist`
- Verificar permissões: `sudo chown -R $USER:$USER /home/mec-poa/frontend/dist`

### Erro CORS
- Verificar `CORS_ORIGIN` no `.env` do backend
- Reiniciar backend com `--update-env`
- Verificar logs do nginx para ver origem da requisição

### Acesso redirecionando para `/rare-toy` (301 Redirect)
**Sintoma**: Ao acessar `http://autopro.re9suainternet.com.br`, recebe redirect 301 para `/rare-toy` que resulta em 404

**Causa**: Configuração antiga no Hestia CP ou nginx que redireciona a raiz para `/rare-toy`

**Solução**:

1. **Verificar redirect atual:**
   ```bash
   curl -I http://autopro.re9suainternet.com.br
   # Se mostrar "Location: http://autopro.re9suainternet.com.br/rare-toy", há redirect 301
   ```

2. **No Hestia CP:**
   - Acesse: **Web** → **Web Domains**
   - Edite: `autopro.re9suainternet.com.br`
   - Procure por configuração de **Redirect** ou **Document Root** que mencione `/rare-toy`
   - **Remova** ou **desabilite** essa configuração
   - Salve as alterações

3. **No Nginx (já configurado):**
   - A configuração em `/etc/nginx/conf.d/00-autopro.re9suainternet.com.br.conf` já inclui:
     ```nginx
     location = /rare-toy {
         return 301 /;
     }
     ```
   - Isso redireciona `/rare-toy` de volta para a raiz `/`

4. **Recarregar nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Verificar se funcionou:**
   ```bash
   curl -I http://autopro.re9suainternet.com.br
   # Deve retornar Status 200 (não 301) e Location não deve aparecer
   ```

**Nota**: Se o problema persistir, pode ser necessário limpar o cache do navegador ou verificar se há CDN/Cloudflare fazendo cache do redirect antigo.
