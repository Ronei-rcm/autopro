# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.3.0] - 2025-01-XX

### 🎯 Versão: Melhorias de UX, Fluxo Automatizado e pgAdmin

### ✨ Adicionado
- **Componentes Reutilizáveis**
  - Hook `useDebounce` para debounce genérico
  - Componente `SearchableSelect` com busca integrada
  - Aplicado em selects de Cliente e Veículo

- **Melhorias de UX no Módulo de Ordens de Serviço**
  - Debounce na busca (300ms) para melhor performance
  - Selects com busca para clientes e veículos
  - Atalhos de teclado (Ctrl+Enter para adicionar, Esc para fechar)
  - Ordenação por colunas na tabela (Número, Cliente, Status, Total)
  - Validação em tempo real com feedback visual
  - Scroll automático ao adicionar itens
  - Toasts com ícones e animações suaves

- **Fluxo Automatizado de Aprovação de Orçamentos**
  - Criação automática de OS quando orçamento é aprovado
  - Atribuição automática do mecânico à OS
  - Cópia automática de itens do orçamento para OS
  - Cálculo automático de totais
  - Atualização automática de status (approved → converted)

- **Melhorias no Dashboard do Mecânico**
  - Seção "Próximas OS" clicável
  - Lista mostra informações completas (cliente, veículo, status, valor)
  - Navegação direta: clicar na OS abre modal de detalhes
  - Mostra data de agendamento quando disponível

- **Melhorias na Agenda**
  - Nome do mecânico visível na listagem de agendamentos

- **pgAdmin Configurado**
  - Serviço pgAdmin adicionado ao Docker Compose
  - Interface web para gerenciar banco de dados PostgreSQL
  - Porta 5050 configurada
  - Documentação completa criada (3 guias)

### 🔧 Melhorado
- Validação no endpoint de aprovação de orçamentos
- Mensagens de erro mais claras e específicas
- Tratamento de erros no frontend e backend
- Performance da busca com debounce
- Experiência do usuário em formulários
- Dashboard do mecânico mais útil e interativo

### 🐛 Corrigido
- Nome do mecânico não aparecia na Agenda
- Dashboard do mecânico não mostrava OS para interação
- OS não era criada automaticamente ao aprovar orçamento
- Email do pgAdmin corrigido (de .local para .com)

### 📚 Documentação
- `PGADMIN_GUIDE.md` - Guia completo do pgAdmin
- `PGADMIN_CONFIG_RAPIDA.md` - Guia rápido de configuração
- `RESUMO_PGADMIN.md` - Resumo executivo
- `FLUXO_ORCAMENTO_OS.md` - Documentação do fluxo completo
- `docs/SESSAO_MELHORIAS_UX_E_FLUXO.md` - Documentação completa da sessão
- README.md atualizado com informações do pgAdmin
- Makefile atualizado com comando `make pgadmin`

## [1.2.0] - 2025-01-XX

### 🎯 Versão: Gestão Inteligente e Melhorias de UX

### ✨ Adicionado
- **Gestão Inteligente de Desconto**
  - Zeramento automático de desconto quando não há itens na ordem
  - Validações robustas no frontend e backend
  - Botão "Limpar" para remover desconto manualmente
  - Prevenção de totais negativos

- **Melhoria na Exclusão de Ordens**
  - Mensagens de erro detalhadas e acionáveis
  - Botão "Ir para Contas a Receber" na mensagem de erro
  - Navegação automática para página financeira com filtro
  - Filtro de contas a receber por ordem de serviço
  - Destaque visual de contas vinculadas

### 🔧 Melhorado
- Validação de desconto em múltiplas camadas
- Feedback visual imediato em campos inválidos
- Processo de resolução de bloqueios de exclusão
- Experiência do usuário na gestão financeira

### 🐛 Corrigido
- Desconto permanecendo após exclusão de todos os itens
- Totais negativos quando desconto maior que subtotal
- Mensagens de erro genéricas ao excluir ordens
- Dificuldade para encontrar contas a receber vinculadas

### 📚 Documentação
- Documentação completa das melhorias de desconto
- Documentação de melhoria na exclusão de ordens
- Atualização do README.md
- Atualização de EVOLUCOES_IMPLEMENTADAS.md

## [1.1.0] - 2024-12-XX

### ✨ Adicionado
- QR Code na impressão de OS em PDF
- Sistema completo de garantias
- Criação de garantias em lote
- Integração ViaCEP (confirmada)

### 🔧 Melhorado
- Layout de PDF de OS
- Histórico de alterações de OS
- Controle de garantias

## [1.0.0] - 2024-XX-XX

### ✨ Adicionado
- Sistema completo de gestão para oficina mecânica
- Módulos: Clientes, Veículos, Fornecedores, Estoque, OS, Financeiro, Agendamento, Relatórios
- Autenticação e controle de acesso
- Dashboard com KPIs
- Sistema de garantias
- Integração com estoque
- Geração automática de contas a receber

---

**Formato:**
- `✨ Adicionado` - Novas funcionalidades
- `🔧 Melhorado` - Mudanças em funcionalidades existentes
- `🐛 Corrigido` - Correções de bugs
- `🗑️ Removido` - Funcionalidades removidas
- `🔒 Segurança` - Correções de segurança
- `📚 Documentação` - Mudanças na documentação
