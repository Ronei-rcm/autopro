# 🔄 Instruções para Atualizar Apontamento do Domínio no Hestia

## Objetivo
Remover configuração antiga `/rare-toy` e garantir que o domínio aponte para o frontend na porta 5173.

## URL Antiga vs Nova

**❌ Antiga**: `http://autopro.re9suainternet.com.br/rare-toy`  
**✅ Nova**: `http://autopro.re9suainternet.com.br:5173/login` (ou apenas `http://autopro.re9suainternet.com.br`)

## Passos no Painel Hestia CP

1. **Acesse o Hestia CP**
   - URL: geralmente `https://seu-servidor:8083` ou similar

2. **Navegue até Web Domains**
   - Menu: **Web** → **Web Domains**
   - Ou: **Domains** → **Web Domains**

3. **Localize o domínio**
   - Procure por `autopro.re9suainternet.com.br`

4. **Edite o domínio**
   - Clique em **Edit** ou no ícone de lápis

5. **Remova configuração de subpasta**
   - Se houver campo "Document Root" ou "Subfolder" apontando para `/rare-toy`, remova
   - Deixe como padrão ou configure para usar o document root padrão

6. **Verifique Proxy Settings (se disponível)**
   - Se houver opção de "Proxy" ou "Reverse Proxy", certifique-se de que está desabilitado
   - O nginx já está configurado para fazer o proxy reverso

7. **Salve as alterações**

## Verificação Após Alteração

Após fazer as alterações no Hestia, verifique:

```bash
# Testar se o nginx está funcionando
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx

# Testar acesso
curl -I http://autopro.re9suainternet.com.br

# Ver logs
sudo tail -f /var/log/nginx/autopro-access.log
```

## Status Esperado

Após a atualização:
- ✅ `http://autopro.re9suainternet.com.br` → Redireciona para `/login` (se não autenticado)
- ✅ `http://autopro.re9suainternet.com.br:5173` → Funciona diretamente
- ✅ Não deve mais redirecionar para `/rare-toy`

## Nota Importante

O frontend já está configurado para:
- Redirecionar automaticamente para `/login` se o usuário não estiver autenticado
- Usar React Router para gerenciar as rotas
- O nginx já está fazendo proxy reverso para `localhost:5173`

Portanto, a única mudança necessária é **remover a configuração antiga no Hestia** que aponta para `/rare-toy`.
