# 📚 Índice de Documentação

Este documento serve como índice centralizado de toda a documentação do projeto.

---

## 🚀 Início Rápido

- [README.md](../README.md) - Visão geral e início rápido
- [QUICKSTART.md](../QUICKSTART.md) - Guia rápido de início
- [SETUP.md](../SETUP.md) - Instalação e configuração local
- [DOCKER.md](../DOCKER.md) - Uso com Docker

---

## 📖 Documentação Principal

### Visão Geral
- [PROJETO.md](../PROJETO.md) - Visão geral completa do projeto
- [STATUS.md](../STATUS.md) - Status atual dos módulos
- [CHANGELOG.md](../CHANGELOG.md) - Histórico de mudanças

### Arquitetura e Tecnologias
- [database/SCHEMA.md](./database/SCHEMA.md) - Schema completo do banco de dados
- [api/API.md](./api/API.md) - Documentação completa da API REST

---

## 🎯 Módulos e Funcionalidades

### Sistema de Permissões
- [SISTEMA_PERMISSOES.md](./SISTEMA_PERMISSOES.md) - Sistema completo de permissões e visibilidade de módulos

### Ordens de Serviço
- [ORDERS_MODULE.md](./ORDERS_MODULE.md) - Documentação completa do módulo de OS
- [MELHORIAS_DESCONTO_E_EXCLUSAO.md](./MELHORIAS_DESCONTO_E_EXCLUSAO.md) - Gestão de desconto e exclusão
- [SESSAO_MELHORIAS_UX_E_FLUXO.md](./SESSAO_MELHORIAS_UX_E_FLUXO.md) - Melhorias de UX e fluxo automatizado (Versão 1.3.0)
- [RESUMO_EXECUTIVO_SESSAO.md](./RESUMO_EXECUTIVO_SESSAO.md) - Resumo executivo das melhorias de UX

### Sistema de Notificações
- [SISTEMA_NOTIFICACOES.md](./SISTEMA_NOTIFICACOES.md) - Sistema completo de notificações

### Informações da Oficina
- [MODULO_INFORMACOES_OFICINA.md](./MODULO_INFORMACOES_OFICINA.md) - Módulo de informações da oficina
- [RESUMO_MODULO_WORKSHOP_INFO.md](./RESUMO_MODULO_WORKSHOP_INFO.md) - Resumo do módulo

---

## 🔄 Evoluções e Melhorias

### Implementadas
- [EVOLUCOES_IMPLEMENTADAS.md](./EVOLUCOES_IMPLEMENTADAS.md) - Lista completa de melhorias implementadas
- [RESUMO_MELHORIAS_JANEIRO_2025.md](./RESUMO_MELHORIAS_JANEIRO_2025.md) - Resumo executivo das melhorias de janeiro 2025
- [MELHORIAS_DESCONTO_E_EXCLUSAO.md](./MELHORIAS_DESCONTO_E_EXCLUSAO.md) - Detalhes das melhorias de desconto e exclusão
- [SESSAO_MELHORIAS_UX_E_FLUXO.md](./SESSAO_MELHORIAS_UX_E_FLUXO.md) - **NOVO** - Melhorias de UX e fluxo automatizado (v1.3.0)
- [RESUMO_EXECUTIVO_SESSAO.md](./RESUMO_EXECUTIVO_SESSAO.md) - **NOVO** - Resumo executivo das melhorias de UX

### Sugeridas
- [EVOLUCOES_SUGERIDAS.md](./EVOLUCOES_SUGERIDAS.md) - Análise completa de melhorias e novas funcionalidades

---

## 🐛 Correções e Troubleshooting

- [CORRECOES_ERROS_500.md](./CORRECOES_ERROS_500.md) - Correções de erros 500
- [RESUMO_CORRECOES_FINAIS.md](./RESUMO_CORRECOES_FINAIS.md) - Resumo das correções finais

---

## 🗄️ Banco de Dados

- [database/SCHEMA.md](./database/SCHEMA.md) - Schema completo do banco de dados
- [PGADMIN_GUIDE.md](../PGADMIN_GUIDE.md) - **NOVO** - Guia completo do pgAdmin
- [PGADMIN_CONFIG_RAPIDA.md](../PGADMIN_CONFIG_RAPIDA.md) - **NOVO** - Guia rápido de configuração do pgAdmin
- [RESUMO_PGADMIN.md](../RESUMO_PGADMIN.md) - **NOVO** - Resumo do pgAdmin
- [FLUXO_ORCAMENTO_OS.md](../FLUXO_ORCAMENTO_OS.md) - **NOVO** - Documentação do fluxo Orçamento → OS

---

## 🚀 Deploy e Produção

- [deployment/DEPLOY.md](./deployment/DEPLOY.md) - Guia completo de deploy em produção

---

## 📊 Análises e Resumos

- [ANALISE_ATUALIZACOES.md](./ANALISE_ATUALIZACOES.md) - Análise de atualizações
- [RESUMO_ATUALIZACOES.md](./RESUMO_ATUALIZACOES.md) - Resumo de atualizações

---

## 📝 Estrutura da Documentação

```
docs/
├── api/                    # Documentação da API
│   └── API.md
├── database/               # Schema do banco
│   └── SCHEMA.md
├── deployment/             # Guias de deploy
│   └── DEPLOY.md
├── EVOLUCOES_*.md          # Evoluções e melhorias
├── MELHORIAS_*.md          # Melhorias específicas
├── RESUMO_*.md             # Resumos executivos
├── CORRECOES_*.md          # Correções e troubleshooting
├── MODULO_*.md             # Documentação de módulos
└── INDICE_DOCUMENTACAO.md  # Este arquivo
```

---

## 🔍 Como Usar Este Índice

1. **Para começar**: Leia o [README.md](../README.md) e [QUICKSTART.md](../QUICKSTART.md)
2. **Para entender a arquitetura**: Consulte [database/SCHEMA.md](./database/SCHEMA.md) e [api/API.md](./api/API.md)
3. **Para ver melhorias**: Veja [EVOLUCOES_IMPLEMENTADAS.md](./EVOLUCOES_IMPLEMENTADAS.md)
4. **Para resolver problemas**: Consulte [CORRECOES_ERROS_500.md](./CORRECOES_ERROS_500.md)
5. **Para fazer deploy**: Siga [deployment/DEPLOY.md](./deployment/DEPLOY.md)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.3.0

---

## 📌 Documentação da Última Sessão (Versão 1.3.0)

### Melhorias de UX e Fluxo Automatizado
- ✅ **6 melhorias de UX** implementadas no módulo de Ordens de Serviço
- ✅ **Fluxo automatizado** de aprovação de orçamentos (OS criada automaticamente)
- ✅ **Dashboard do mecânico** melhorado com próximas OS clicáveis
- ✅ **pgAdmin** configurado e documentado

### Documentos Principais
1. [SESSAO_MELHORIAS_UX_E_FLUXO.md](./SESSAO_MELHORIAS_UX_E_FLUXO.md) - Documentação completa da sessão
2. [RESUMO_EXECUTIVO_SESSAO.md](./RESUMO_EXECUTIVO_SESSAO.md) - Resumo executivo
3. [FLUXO_ORCAMENTO_OS.md](../FLUXO_ORCAMENTO_OS.md) - Fluxo documentado
4. [CHECKLIST_SESSAO.md](../CHECKLIST_SESSAO.md) - Checklist completo
5. [PGADMIN_GUIDE.md](../PGADMIN_GUIDE.md) - Guia do pgAdmin

### Componentes Criados
- `frontend/src/hooks/useDebounce.ts` - Hook de debounce
- `frontend/src/components/common/SearchableSelect.tsx` - Select com busca
