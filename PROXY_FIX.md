# 🔧 Correção Final do Proxy e CORS

## Problema Identificado

O frontend estava tentando acessar `http://localhost:3002/api/auth/login` diretamente do navegador quando acessado por IP externo, causando erro de CORS:

```
Access to XMLHttpRequest at 'http://localhost:3002/api/auth/login' 
from origin 'http://177.67.32.203:5173' has been blocked by CORS policy
```

## Causa Raiz

O `VITE_API_URL` estava definido no `docker-compose.yml` como `http://localhost:3002/api`, fazendo com que o axios tentasse acessar essa URL diretamente em vez de usar o proxy do Vite.

## Solução Implementada

### 1. ✅ Removido VITE_API_URL do docker-compose

```yaml
# ANTES
environment:
  VITE_API_URL: http://localhost:3002/api  # ❌ Forçava acesso direto

# DEPOIS  
environment:
  # Não definir VITE_API_URL para usar o proxy do Vite
  # VITE_API_URL: http://localhost:3002/api  # ✅ Comentado
```

### 2. ✅ Ajustado getBaseURL() para sempre usar proxy em dev

```typescript
// ANTES
const getBaseURL = () => {
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

// DEPOIS
const getBaseURL = () => {
  // Em desenvolvimento, sempre usa o proxy do Vite
  if (import.meta.env.DEV) {
    return '/api';  // ✅ Sempre usa proxy
  }
  // Em produção, usa a URL configurada
  return import.meta.env.VITE_API_URL || '/api';
};
```

### 3. ✅ Adicionado logs no proxy para debug

```typescript
configure: (proxy, _options) => {
  proxy.on('error', (err, _req, res) => {
    console.log('proxy error', err);
  });
  proxy.on('proxyReq', (proxyReq, req, _res) => {
    console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
  });
}
```

## Como Funciona Agora

```
Navegador (IP externo: 177.67.32.203:5173)
  ↓
  Requisição: POST /api/auth/login
  ↓
Frontend (Vite Dev Server)
  ↓
  Proxy do Vite intercepta /api/*
  ↓
  Redireciona para: http://backend:3001/api/auth/login
  ↓
Backend (dentro do Docker)
  ↓
  Resposta com token
  ↓
Frontend
  ↓
Navegador
```

## Teste Realizado

```bash
# Teste via curl através do proxy do Vite
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oficina.com","password":"admin123"}'
```

**Resultado**: ✅ Token JWT gerado com sucesso

## Próximos Passos

1. **Recarregue a página no navegador** (Ctrl+F5 ou Cmd+Shift+R)
2. **Limpe o cache do navegador** se necessário
3. **Tente fazer login novamente**

O frontend agora deve usar o proxy corretamente e não tentar acessar `localhost:3002` diretamente.

## Verificação

Para verificar se está usando o proxy:

1. Abra o DevTools do navegador (F12)
2. Vá na aba Network
3. Tente fazer login
4. Verifique que a requisição vai para `/api/auth/login` (não `localhost:3002`)

---

**Status**: ✅ Corrigido - Proxy configurado corretamente

