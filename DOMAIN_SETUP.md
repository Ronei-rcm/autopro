# 🌐 Configuração do Domínio autopro.re9suainternet.com.br

## ✅ Configurações Aplicadas

### 1. Nginx Configuration

Criada configuração do nginx em `/etc/nginx/sites-available/autopro.re9suainternet.com.br.conf`:

- **Frontend**: Serve arquivos estáticos de `/home/mec-poa/frontend/dist`
- **API**: Proxy reverso para `http://localhost:3002/api`
- **Logs**: `/var/log/nginx/autopro-access.log` e `/var/log/nginx/autopro-error.log`

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
5. **Configuração Nginx**: A configuração está em `/etc/nginx/conf.d/domains/autopro.re9suainternet.com.br.conf`
6. **Conflito com Hestia**: Se houver conflito com configuração padrão do Hestia, pode ser necessário desabilitar temporariamente a configuração `177.67.32.203.conf`

## 🔍 Troubleshooting

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
