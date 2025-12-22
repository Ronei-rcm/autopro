# 📋 Módulo de Ordens de Serviço - Documentação Completa

## 🎯 Visão Geral

O módulo de Ordens de Serviço (OS) é um dos principais componentes do sistema, oferecendo funcionalidades completas para criação, gestão e rastreamento de serviços realizados na oficina.

---

## ✨ Funcionalidades Principais

### 1. Criação e Edição de OS

- ✅ Criação de nova OS com cliente, veículo e mecânico
- ✅ Edição de OS existentes
- ✅ Definição de status (Aberta, Em Andamento, Aguardando Peças, Finalizada, Cancelada)
- ✅ Campo de observações técnicas
- ✅ Aplicação de descontos
- ✅ **Assumir OS** - Mecânico pode assumir OS sem mecânico ou de outro mecânico
- ✅ **Transferir OS** - Admin ou mecânico pode transferir OS para outro mecânico

### 2. Gestão de Itens

#### Adição de Itens
- ✅ Adicionar produtos (com controle de estoque)
- ✅ Adicionar serviços (mão de obra)
- ✅ **Preenchimento automático de preços** ao selecionar produto/serviço
- ✅ **Cálculo automático do total do item** em tempo real
- ✅ Validação de quantidade vs estoque disponível
- ✅ Alertas visuais para produtos sem estoque

#### Remoção de Itens
- ✅ Remoção de itens com confirmação
- ✅ **Reversão automática de movimentação de estoque** ao remover produto
- ✅ Atualização automática de totais

### 3. Cálculos Automáticos

#### Totais em Tempo Real
- ✅ **Subtotal**: Soma de todos os itens
- ✅ **Desconto**: Valor aplicado (editável)
- ✅ **Total**: Subtotal - Desconto

#### Atualização Automática
- ✅ Totais recalculados ao adicionar item
- ✅ Totais recalculados ao remover item
- ✅ Total do item calculado ao alterar quantidade ou preço
- ✅ Totais atualizados ao alterar desconto

### 4. Controle de Estoque Integrado

#### Validações
- ✅ Verificação de estoque disponível ao adicionar produto
- ✅ Bloqueio de produtos sem estoque
- ✅ Alertas visuais quando quantidade excede estoque
- ✅ Agrupamento visual de produtos disponíveis vs sem estoque

#### Movimentações Automáticas
- ✅ **Saída automática** ao adicionar produto na OS
- ✅ **Entrada automática** ao remover produto da OS
- ✅ Histórico completo de movimentações vinculado à OS

### 5. Validações Avançadas

#### Validações de Formulário
- ✅ Descrição obrigatória
- ✅ Quantidade maior que zero
- ✅ Preço unitário maior que zero
- ✅ Cliente e veículo obrigatórios
- ✅ Validação de estoque disponível

#### Feedback Visual
- ✅ Alertas de erro específicos
- ✅ Indicadores visuais de produtos sem estoque
- ✅ Avisos quando quantidade excede estoque
- ✅ Botão "Adicionar" desabilitado quando inválido

### 6. Interface Aprimorada

#### Formulário de Itens
- ✅ Seleção de tipo (Produto/Serviço)
- ✅ Preenchimento automático de descrição
- ✅ Campo de quantidade com validação
- ✅ Campo de preço unitário editável
- ✅ **Exibição do total do item em tempo real** (destaque verde)
- ✅ Botão de adicionar com estado desabilitado quando inválido

#### Lista de Itens
- ✅ Tabela responsiva com hover effects
- ✅ Ícones diferenciados (produtos vs serviços)
- ✅ Quantidade formatada com 2 casas decimais
- ✅ Valores formatados em moeda brasileira (R$)
- ✅ Botão de remoção com confirmação contextual

#### Resumo Financeiro
- ✅ Card destacado com borda
- ✅ Contador de itens no subtotal
- ✅ Campo de desconto editável em tempo real
- ✅ Total destacado com fonte maior e cor verde

### 7. Histórico e Rastreabilidade

- ✅ Histórico completo de alterações
- ✅ Registro de mudanças de status
- ✅ Registro de mudanças de valores
- ✅ Informação de quem alterou e quando
- ✅ Timeline de eventos da OS

### 8. Ações Rápidas

- ✅ **Iniciar OS**: Muda para "Em Andamento" e registra data de início
- ✅ **Finalizar OS**: Muda para "Finalizada" e registra data de conclusão
- ✅ **Aguardar Peças**: Coloca em espera por peças
- ✅ **Cancelar OS**: Cancela a ordem
- ✅ **Reabrir OS**: Reabre OS finalizada/cancelada

---

## 🎨 Interface do Usuário

### Modal de Gestão de Itens

O modal de gestão de itens oferece uma experiência completa:

1. **Cabeçalho**: Número da OS, cliente e veículo
2. **Formulário de Adição**:
   - Seleção de tipo (Produto/Mão de Obra)
   - Seleção do item com informações de estoque/preço
   - Campos de descrição, quantidade e preço
   - **Total do item em destaque verde**
   - Botão "Adicionar" com validação visual

3. **Lista de Itens**:
   - Tabela com todos os itens adicionados
   - Contador de itens
   - Ações de remoção

4. **Resumo Financeiro**:
   - Subtotal com contador de itens
   - Campo de desconto editável
   - Total final destacado

### Modal de Detalhes

Modal completo com abas:
- **Detalhes**: Informações da OS, cliente, veículo, valores
- **Itens**: Lista completa de produtos e serviços
- **Histórico**: Timeline de alterações

---

## 🔄 Fluxos de Trabalho

### Criar uma OS Completa

1. Criar nova OS (cliente, veículo, status inicial)
2. Adicionar produtos:
   - Selecionar produto → Preço preenchido automaticamente
   - Informar quantidade → Total calculado automaticamente
   - Adicionar → Estoque atualizado automaticamente
3. Adicionar serviços:
   - Selecionar tipo de mão de obra → Preço preenchido automaticamente
   - Informar quantidade → Total calculado automaticamente
   - Adicionar
4. Ajustar desconto (se necessário) → Total recalculado
5. Finalizar OS → Status atualizado e data de conclusão registrada

### Adicionar Item à OS Existente

1. Abrir modal de itens da OS
2. Preencher formulário:
   - Selecionar tipo (Produto/Serviço)
   - Selecionar item específico (preço preenchido automaticamente)
   - Ajustar quantidade se necessário (total recalculado)
   - Verificar total do item em destaque verde
3. Clicar em "Adicionar" (habilitado apenas se válido)
4. Item adicionado → Totais da OS atualizados automaticamente
5. Se produto → Estoque atualizado automaticamente

### Remover Item

1. Clicar no botão de remoção (ícone de lixeira)
2. Confirmar remoção (mostra nome do item)
3. Item removido → Totais recalculados
4. Se produto → Estoque revertido automaticamente

---

## 💡 Dicas de Uso

### Boas Práticas

1. **Sempre verifique o estoque antes de adicionar produtos**
   - O sistema mostra alertas, mas é bom verificar manualmente

2. **Use descontos com parcimônia**
   - O campo de desconto está sempre visível e editável

3. **Preencha observações técnicas**
   - Ajuda no histórico e rastreabilidade

4. **Use ações rápidas para mudanças de status**
   - Mais rápido que editar manualmente
   - Registra automaticamente no histórico

5. **Verifique o total antes de finalizar**
   - O total é sempre atualizado em tempo real
   - Confirme antes de finalizar a OS

### Validações Importantes

- ❌ Não é possível adicionar produto sem estoque
- ❌ Não é possível adicionar quantidade maior que estoque disponível
- ❌ Não é possível adicionar item com quantidade zero ou negativa
- ❌ Não é possível adicionar item com preço zero ou negativo
- ✅ Produtos sem estoque aparecem agrupados e desabilitados
- ✅ Alertas visuais aparecem quando há problemas

---

## 🔧 Integrações

### Com Módulo de Estoque

- **Saída automática** ao adicionar produto na OS
- **Entrada automática** ao remover produto da OS
- Validação de estoque antes de adicionar
- Histórico de movimentações vinculado

### Com Módulo Financeiro

- Geração automática de conta a receber ao finalizar OS
- Valores sincronizados com a OS

### Com Módulo de Clientes e Veículos

- Seleção de cliente e veículo vinculados
- Histórico de OS no perfil do cliente/veículo

---

## 📊 Estatísticas

O módulo oferece estatísticas em tempo real:
- Total de OS
- OS por status
- Valores totais finalizados
- Métricas de negócio

---

## 🚀 Melhorias Futuras Sugeridas

- [ ] Edição de itens (atualmente só adicionar/remover)
- [ ] Duplicação de OS
- [ ] Templates de OS para serviços comuns
- [ ] Impressão/exportação de OS em PDF
- [ ] Assinatura digital do cliente
- [ ] Fotos/documentos anexados
- [ ] Orçamento antes de criar OS
- [ ] Aprovação de OS por cliente

---

**Última atualização**: Janeiro 2025  
**Versão**: 2.1.0 (com sistema de notificações, assumir/transferir OS e transferência automática para financeiro)
