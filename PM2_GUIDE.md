# 🚀 Guia de Uso do PM2

Este projeto usa **PM2** para gerenciar os processos do backend e frontend de forma profissional.

## 📋 O que é PM2?

PM2 é um gerenciador de processos para aplicações Node.js que permite:
- ✅ Gerenciar múltiplos processos
- ✅ Reiniciar automaticamente em caso de crash
- ✅ Monitoramento de recursos (CPU, memória)
- ✅ Logs centralizados
- ✅ Iniciar no boot do sistema

## 🎯 Serviços Configurados

O projeto possui dois serviços configurados no PM2:

1. **`mec-poa-backend`** - API Backend (Node.js/Express)
   - Porta: 3002
   - Script: `./backend/src/server.ts`

2. **`mec-poa-frontend`** - Frontend (React/Vite)
   - Porta: 5173
   - Script: `npm run dev` no diretório frontend

## 🚀 Comandos Básicos

### Iniciar Serviços

```bash
# Iniciar todos os serviços
npm run dev
# ou
make pm2-start

# Iniciar em modo produção
npm start
```

### Gerenciar Serviços

```bash
# Parar todos os serviços
npm run stop
# ou
make pm2-stop

# Reiniciar todos os serviços
npm run restart
# ou
make pm2-restart

# Remover todos os serviços do PM2
npm run delete
# ou
make pm2-delete
```

### Ver Status e Logs

```bash
# Ver status de todos os serviços
npm run status
# ou
make pm2-status

# Ver logs de todos os serviços
npm run logs
# ou
make pm2-logs

# Ver logs apenas do backend
npm run logs:backend
# ou
make pm2-logs-backend

# Ver logs apenas do frontend
npm run logs:frontend
# ou
make pm2-logs-frontend

# Abrir monitor interativo (CPU, memória)
npm run monit
# ou
make pm2-monit
```

## 📊 Monitoramento

### Monitor Interativo

```bash
npm run monit
```

Isso abre uma interface que mostra:
- Uso de CPU
- Uso de memória
- Uptime
- Número de restarts

### Status Detalhado

```bash
npm run status
```

Mostra:
- Nome do serviço
- Status (online/stopped)
- CPU e memória
- Uptime
- Restarts

## 🔧 Gerenciar Serviços Individuais

Você também pode gerenciar serviços individualmente:

```bash
# Parar apenas o backend
pm2 stop mec-poa-backend

# Parar apenas o frontend
pm2 stop mec-poa-frontend

# Reiniciar apenas o backend
pm2 restart mec-poa-backend

# Reiniciar apenas o frontend
pm2 restart mec-poa-frontend

# Ver logs apenas do backend
pm2 logs mec-poa-backend

# Ver logs apenas do frontend
pm2 logs mec-poa-frontend
```

## 💾 Salvar e Restaurar Configuração

### Salvar Configuração Atual

```bash
npm run pm2:save
# ou
make pm2-save
```

Isso salva a lista de processos que estão rodando.

### Restaurar Após Reiniciar

Após reiniciar o sistema, você pode restaurar os processos:

```bash
pm2 resurrect
```

### Configurar para Iniciar no Boot

```bash
npm run pm2:startup
# ou
make pm2-startup
```

Isso gera um comando que você deve executar como root para configurar o PM2 para iniciar automaticamente no boot do sistema.

## 📝 Logs

Os logs são salvos em `./logs/`:

- `backend-error.log` - Erros do backend
- `backend-out.log` - Output do backend
- `backend-combined.log` - Logs combinados do backend
- `frontend-error.log` - Erros do frontend
- `frontend-out.log` - Output do frontend
- `frontend-combined.log` - Logs combinados do frontend

### Ver Logs em Tempo Real

```bash
# Todos os logs
pm2 logs

# Apenas backend
pm2 logs mec-poa-backend

# Apenas frontend
pm2 logs mec-poa-frontend

# Limpar logs
pm2 flush
```

## 🔄 Atualizar Código

Quando você atualizar o código:

```bash
# Reiniciar todos os serviços
npm run restart

# Ou reiniciar apenas o que mudou
pm2 restart mec-poa-backend  # se mudou backend
pm2 restart mec-poa-frontend # se mudou frontend
```

## ⚙️ Configuração

A configuração do PM2 está em `ecosystem.config.js`. Você pode editar:

- Número de instâncias
- Limite de memória
- Configurações de restart
- Variáveis de ambiente
- Caminhos de logs

## 🐛 Troubleshooting

### Serviço não inicia

```bash
# Ver logs de erro
pm2 logs mec-poa-backend --err
pm2 logs mec-poa-frontend --err

# Ver informações detalhadas
pm2 describe mec-poa-backend
pm2 describe mec-poa-frontend
```

### Serviço reiniciando constantemente

```bash
# Ver quantos restarts
pm2 status

# Ver logs para identificar o erro
pm2 logs --lines 100
```

### Limpar tudo e recomeçar

```bash
# Parar e remover tudo
pm2 delete all
pm2 kill

# Limpar logs
pm2 flush

# Reiniciar
npm run dev
```

## 📚 Comandos PM2 Úteis

```bash
# Listar todos os processos
pm2 list

# Informações detalhadas de um processo
pm2 show mec-poa-backend

# Reiniciar com zero downtime (apenas produção)
pm2 reload mec-poa-backend

# Ver uso de recursos
pm2 monit

# Exportar configuração atual
pm2 save

# Limpar todos os logs
pm2 flush

# Parar PM2 completamente
pm2 kill
```

## 🎯 Fluxo de Trabalho Recomendado

1. **Desenvolvimento inicial:**
   ```bash
   npm run install:all
   make init-db-local
   npm run dev
   ```

2. **Durante desenvolvimento:**
   ```bash
   # Ver logs
   npm run logs
   
   # Ver status
   npm run status
   ```

3. **Após mudanças:**
   ```bash
   # Reiniciar serviços afetados
   pm2 restart mec-poa-backend
   # ou
   pm2 restart mec-poa-frontend
   ```

4. **Antes de sair:**
   ```bash
   # Salvar configuração
   npm run pm2:save
   ```

## ✅ Vantagens do PM2

- ✅ **Gerenciamento Centralizado** - Um comando para todos os serviços
- ✅ **Auto-restart** - Reinicia automaticamente em caso de erro
- ✅ **Logs Organizados** - Logs separados por serviço
- ✅ **Monitoramento** - Acompanhe CPU e memória em tempo real
- ✅ **Produção Ready** - Pronto para usar em produção
- ✅ **Zero Downtime** - Recarregue sem parar o serviço

## 🎉 Pronto!

Agora você tem um ambiente de desenvolvimento profissional com PM2! 🚀
