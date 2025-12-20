# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Versionado] - 2024-12-20

### ✨ Adicionado
- Documentação completa de análise de atualizações (`docs/ANALISE_ATUALIZACOES.md`)
- Resumo executivo de atualizações (`docs/RESUMO_ATUALIZACOES.md`)

### 🔄 Atualizado
- **TypeScript**: `5.3.3` → `5.9.3` (backend e frontend)
- **lucide-react**: `0.303.0` → `0.562.0` (novos ícones disponíveis)
- **react-hook-form**: `7.49.2` → `7.69.0` (patch update)

### 🐛 Corrigido
- Corrigidos checks de `result.rowCount` para suportar valores `null` (null coalescing)
- Corrigidos erros de tipo TypeScript em controllers (`auth.controller`, `quote.controller`, `order.controller`)
- Corrigidos parâmetros não utilizados em funções (prefixados com `_`)
- Removidos imports não utilizados
- Corrigidos erros de tipo em componentes frontend (`Orders.tsx`, `Quotes.tsx`, `Users.tsx`)
- Removidas declarações duplicadas de funções

### 🔧 Técnico
- Melhorias de type safety com TypeScript 5.9.x
- Correções de compatibilidade com versões atualizadas das dependências
- Ajustes para seguir padrões mais rigorosos do TypeScript

---

## [Versões Anteriores]

### Funcionalidades Principais Implementadas

- ✅ Sistema completo de autenticação e autorização
- ✅ Dashboard com KPIs e gráficos em tempo real
- ✅ CRUD completo de Clientes, Veículos, Fornecedores, Produtos
- ✅ Sistema de Ordens de Serviço com cálculo automático e controle de estoque
- ✅ Sistema Financeiro (Contas a Pagar/Receber, Parcelas, Fluxo de Caixa)
- ✅ Sistema de Garantias
- ✅ Agendamento de Serviços
- ✅ Relatórios e Dashboard Gerencial
- ✅ Sistema de Templates de OS
- ✅ Sistema de Checklists para Mecânicos
- ✅ Sistema de Orçamentos com conversão para OS
- ✅ Assinatura Digital do Cliente em OS
- ✅ Upload de Fotos/Documentos em OS
- ✅ Exportação de PDFs para OS e Orçamentos
- ✅ Histórico completo de veículos e clientes

---

**Nota**: Para informações detalhadas sobre cada funcionalidade, consulte `docs/EVOLUCOES_SUGERIDAS.md` e `STATUS.md`.
