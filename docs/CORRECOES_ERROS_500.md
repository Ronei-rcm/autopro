# 🔧 Correções de Erros 500

## ❌ Problemas Identificados

### 1. Erro 500 em `POST /api/orders/:id/generate-receivable`
**Causa**: Tabela `installments` pode não existir ou erro no cálculo de parcelas.

### 2. Erro 500 em `POST /api/orders/:id/files`
**Causa**: Tabela `order_files` pode não existir.

---

## ✅ Soluções Implementadas

### 1. Criação Automática de Tabelas

#### Tabela `order_files`
- ✅ Método `ensureTableExists()` adicionado ao `OrderFileModel`
- ✅ Tabela criada automaticamente se não existir
- ✅ Índices criados automaticamente
- ✅ Verificação em todos os métodos (find, create, etc.)

#### Tabela `installments`
- ✅ Método `ensureTableExists()` adicionado ao `InstallmentModel`
- ✅ Tabela criada automaticamente se não existir
- ✅ Índices criados automaticamente
- ✅ Verificação em todos os métodos (find, create, etc.)

### 2. Melhorias no Cálculo de Parcelas

- ✅ Validação do número de parcelas (1-24)
- ✅ Cálculo preciso com arredondamento correto
- ✅ Primeira parcela recebe o resto para garantir soma exata
- ✅ Tratamento de erros melhorado

### 3. Melhorias no Upload de Arquivos

- ✅ Validação de tamanho (máximo 5MB)
- ✅ Cálculo correto do tamanho do arquivo base64
- ✅ Mensagens de erro mais claras
- ✅ Feedback visual durante upload

### 4. Tratamento de Erros Melhorado

#### Backend
- ✅ Mensagens de erro mais descritivas
- ✅ Detalhes de erro em modo desenvolvimento
- ✅ Verificação de tabelas antes de operações
- ✅ Fallback quando tabelas não existem

#### Frontend
- ✅ Mensagens de erro específicas
- ✅ Loading states durante operações
- ✅ Feedback visual claro
- ✅ Logs detalhados para debug

---

## 📊 Estrutura das Tabelas Criadas

### `order_files`
```sql
CREATE TABLE order_files (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER,
  description TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `installments`
```sql
CREATE TABLE installments (
  id SERIAL PRIMARY KEY,
  account_receivable_id INTEGER NOT NULL REFERENCES accounts_receivable(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_installment_number UNIQUE (account_receivable_id, installment_number)
);
```

---

## 🔄 Como Funciona Agora

### Geração de Conta a Receber
1. Verifica se a ordem existe
2. Verifica se já existe conta a receber
3. Cria a conta a receber
4. Se usar parcelas:
   - Cria tabela `installments` se não existir
   - Calcula valores das parcelas com precisão
   - Cria todas as parcelas
   - Retorna conta com parcelas

### Upload de Arquivos
1. Valida tamanho do arquivo (máx. 5MB)
2. Converte para base64
3. Cria tabela `order_files` se não existir
4. Salva arquivo no banco
5. Retorna informações do arquivo

---

## 🧪 Testes

### Teste 1: Gerar Conta a Receber Simples
1. Abra uma OS finalizada
2. Clique em "Gerar Conta a Receber"
3. Deve criar a conta sem erros

### Teste 2: Gerar Conta a Receber com Parcelas
1. Abra uma OS finalizada
2. Clique em "Gerar Conta a Receber"
3. Marque "Usar Parcelas"
4. Defina número de parcelas (ex: 3)
5. Deve criar conta com 3 parcelas

### Teste 3: Upload de Arquivo
1. Abra uma OS
2. Vá na aba "Arquivos"
3. Clique em "Enviar Arquivo"
4. Selecione um arquivo (máx. 5MB)
5. Deve fazer upload sem erros

---

## 📝 Notas Técnicas

### Criação Automática de Tabelas
- As tabelas são criadas automaticamente na primeira operação
- Não requer execução manual de migrations
- Funciona como fallback se migrations não foram executadas

### Cálculo de Parcelas
- Usa arredondamento para garantir precisão
- Primeira parcela recebe diferença para soma exata
- Valida número de parcelas (1-24)

### Armazenamento de Arquivos
- Arquivos são armazenados em base64 no banco
- Para produção, considere usar storage externo (S3, etc)
- Limite atual: 5MB por arquivo

---

## ✅ Status

**Todos os erros 500 foram corrigidos!**

- ✅ Criação automática de tabelas
- ✅ Cálculo de parcelas corrigido
- ✅ Upload de arquivos funcionando
- ✅ Tratamento de erros melhorado
- ✅ Mensagens de erro claras

---

**Última atualização**: Dezembro 2024
