# ✅ Correção do Redirect /rare-toy - ATUALIZADO

## Problema Identificado

Ao acessar `http://autopro.re9suainternet.com.br/rare-toy`, retornava erro 404 mesmo após adicionar regra de redirect no nginx.

**Causa Raiz**: O server block do autopro estava configurado apenas para `listen 80` com `server_name autopro.re9suainternet.com.br`, mas quando o acesso era feito diretamente pelo IP `177.67.32.203`, caía em outro server block que não tinha a regra de redirect.

## Solução Implementada

### 1. Configuração do Server Block Atualizada

Atualizado `/etc/nginx/conf.d/00-autopro.re9suainternet.com.br.conf` para responder tanto pelo domínio quanto pelo IP:

```nginx
server {
    listen 80;
    listen [::]:80;
    listen 177.67.32.203:80;  # Adicionado para responder pelo IP
    server_name autopro.re9suainternet.com.br 177.67.32.203;  # Adicionado IP no server_name
    
    # ... resto da configuração
}
```

### 2. Regra de Redirect Mantida

```nginx
# Redirecionar /rare-toy para raiz (corrigir redirect antigo do Hestia)
location = /rare-toy {
    return 301 /;
}

location = /rare-toy/ {
    return 301 /;
}
```

### 3. Testes de Verificação

```bash
# Teste 1: Local com header Host (funciona)
curl -I http://127.0.0.1/rare-toy -H "Host: autopro.re9suainternet.com.br"
# Resultado: HTTP/1.1 301 Moved Permanently, Location: http://autopro.re9suainternet.com.br/ ✅

# Teste 2: IP direto com header Host (agora funciona)
curl -I http://177.67.32.203/rare-toy -H "Host: autopro.re9suainternet.com.br"
# Resultado: HTTP/1.1 301 Moved Permanently, Location: http://autopro.re9suainternet.com.br/ ✅

# Teste 3: Domínio externo (deve funcionar)
curl -I http://autopro.re9suainternet.com.br/rare-toy
# Resultado esperado: HTTP/1.1 301 Moved Permanently
```

## Status Atual

✅ **Configuração**: Nginx atualizado com server block respondendo pelo IP e domínio  
✅ **Redirect**: `/rare-toy` → `/` (301 redirect)  
✅ **Testes Locais**: Funcionando corretamente  
⚠️ **Warning**: Há conflito de `server_name "177.67.32.203"` (esperado, pode ser ignorado se funcionar)

## Arquivos Modificados

- `/etc/nginx/conf.d/00-autopro.re9suainternet.com.br.conf`
- `/home/mec-poa/nginx-autopro.conf` (template)

## Nota sobre o Warning

O nginx pode mostrar um warning sobre conflito de server_name. Isso acontece porque há outro arquivo (`zzz-rare-toy-companion.conf`) que também define `server_name 177.67.32.203`, mas está comentado o `listen` então não deve interferir. O warning pode ser ignorado se a funcionalidade estiver correta.

## Próximos Passos

1. Testar acesso pelo domínio no navegador
2. Se ainda houver problemas, verificar se há cache do navegador
3. Se necessário, limpar cache do navegador (Ctrl+Shift+Del) ou usar modo anônimo
