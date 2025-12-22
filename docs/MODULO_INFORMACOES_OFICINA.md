# 🏢 Módulo de Informações da Oficina

## 📋 Visão Geral

Módulo completo para gerenciar as informações da oficina que serão utilizadas em cabeçalhos de documentos, relatórios, ordens de serviço e outros documentos impressos.

---

## ✨ Funcionalidades

### 1. Dados Básicos
- ✅ **Nome da Oficina** (obrigatório)
- ✅ **Nome Fantasia**
- ✅ **CNPJ** (com validação e formatação)
- ✅ **Inscrição Estadual**
- ✅ **Inscrição Municipal**
- ✅ **Logo da Oficina** (upload de imagem em base64)

### 2. Informações de Contato
- ✅ **Telefone** (com formatação)
- ✅ **Email** (com validação)
- ✅ **Website** (com validação de URL)

### 3. Endereço Completo
- ✅ **CEP** (com busca automática via ViaCEP)
- ✅ **Rua/Avenida**
- ✅ **Número**
- ✅ **Complemento**
- ✅ **Bairro**
- ✅ **Cidade**
- ✅ **Estado (UF)**

### 4. Textos e Observações
- ✅ **Texto do Rodapé** (para documentos impressos)
- ✅ **Termos e Condições Padrão**
- ✅ **Observações Gerais**

---

## 🎯 Uso em Documentos

### Integração com PDFs

As informações da oficina são automaticamente incluídas em:

1. **Ordens de Serviço (OS)**
   - Logo no cabeçalho (se configurado)
   - Nome da oficina e nome fantasia
   - Informações de contato no rodapé
   - Texto personalizado do rodapé

2. **Orçamentos**
   - Mesmas informações da OS

3. **Relatórios**
   - Cabeçalho personalizado
   - Informações da oficina

### Exemplo de Cabeçalho no PDF:

```
┌─────────────────────────────────────────┐
│ [LOGO]  Nome da Oficina                │
│         Nome Fantasia                  │
│                    [QR CODE]           │
│                                         │
│         OS-2024-00001                  │
└─────────────────────────────────────────┘
```

---

## 🔧 Implementação Técnica

### Backend

#### Tabela no Banco de Dados
- **Tabela**: `workshop_info`
- **Constraint**: Apenas um registro (id = 1)
- **Migration**: `008_add_workshop_info.sql`

#### Model
- **Arquivo**: `/backend/src/models/workshop-info.model.ts`
- **Métodos**:
  - `find()` - Buscar informações
  - `update()` - Atualizar informações
  - `create()` - Criar registro padrão

#### Controller
- **Arquivo**: `/backend/src/controllers/workshop-info.controller.ts`
- **Endpoints**:
  - `GET /api/workshop-info` - Buscar informações (público)
  - `PUT /api/workshop-info` - Atualizar informações (requer autenticação)

#### Rotas
- **Arquivo**: `/backend/src/routes/workshop-info.routes.ts`
- **Middleware**: Autenticação apenas para UPDATE

### Frontend

#### Página de Gerenciamento
- **Arquivo**: `/frontend/src/pages/WorkshopInfo.tsx`
- **Rota**: `/informacoes-oficina`
- **Menu**: Sidebar com ícone Building2

#### Funcionalidades da Interface
- ✅ Upload de logo (PNG, JPG, GIF - máx. 2MB)
- ✅ Preview do logo
- ✅ Formatação automática de CNPJ, CEP e Telefone
- ✅ Busca automática de endereço por CEP (ViaCEP)
- ✅ Validação de campos
- ✅ Feedback visual durante salvamento

#### Integração com PDFs
- **Arquivo**: `/frontend/src/components/orders/OrderDetailModal.tsx`
- Carrega informações da oficina automaticamente
- Inclui logo, nome e informações no cabeçalho
- Adiciona informações de contato no rodapé

---

## 📝 Campos do Formulário

### Dados Básicos
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Nome | Text | Sim | 1-255 caracteres |
| Nome Fantasia | Text | Não | Máx. 255 caracteres |
| CNPJ | Text | Não | 14 dígitos |
| Inscrição Estadual | Text | Não | - |
| Inscrição Municipal | Text | Não | - |
| Logo | Image | Não | PNG/JPG/GIF, máx. 2MB |

### Contato
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Telefone | Text | Não | Formato brasileiro |
| Email | Email | Não | Email válido |
| Website | URL | Não | URL válida |

### Endereço
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| CEP | Text | Não | 8 dígitos (busca automática) |
| Rua | Text | Não | - |
| Número | Text | Não | - |
| Complemento | Text | Não | - |
| Bairro | Text | Não | - |
| Cidade | Text | Não | - |
| Estado | Text | Não | 2 caracteres (UF) |

### Textos
| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|------------|
| Texto do Rodapé | Textarea | Não | Aparece no rodapé dos PDFs |
| Termos e Condições | Textarea | Não | Texto padrão para documentos |
| Observações | Textarea | Não | Uso interno |

---

## 🚀 Como Usar

### 1. Acessar a Página
- Menu lateral → **"Informações da Oficina"**
- Ou acesse diretamente: `/informacoes-oficina`

### 2. Preencher Informações
- Preencha os campos desejados
- Faça upload do logo (opcional)
- Use a busca automática de CEP para preencher endereço

### 3. Salvar
- Clique em **"Salvar Informações"**
- As informações serão salvas e usadas automaticamente em todos os documentos

### 4. Visualizar em Documentos
- Ao imprimir uma OS ou gerar um relatório
- As informações aparecerão automaticamente no cabeçalho e rodapé

---

## 🔒 Segurança

- ✅ Autenticação obrigatória para atualizar informações
- ✅ Validação de tipos de arquivo (apenas imagens)
- ✅ Limite de tamanho de arquivo (2MB)
- ✅ Validação de campos (CNPJ, CEP, Email, etc.)
- ✅ Sanitização de dados

---

## 📊 Estrutura de Dados

### Interface TypeScript
```typescript
interface WorkshopInfo {
  id: number;
  name: string;
  trade_name?: string;
  cnpj?: string;
  state_registration?: string;
  municipal_registration?: string;
  phone?: string;
  email?: string;
  website?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  logo_path?: string;
  logo_base64?: string;
  notes?: string;
  terms_and_conditions?: string;
  footer_text?: string;
  created_at: Date | string;
  updated_at: Date | string;
}
```

---

## 🎨 Interface

### Design
- ✅ Layout moderno e responsivo
- ✅ Seções organizadas por categoria
- ✅ Preview do logo
- ✅ Feedback visual em todas as ações
- ✅ Validação em tempo real

### Responsividade
- ✅ Grid adaptativo
- ✅ Campos se ajustam ao tamanho da tela
- ✅ Mobile-friendly

---

## 🔄 Integrações

### ViaCEP
- Busca automática de endereço ao digitar CEP completo
- Preenche: Rua, Bairro, Cidade e Estado

### PDFs (jsPDF)
- Logo em base64 incluído diretamente no PDF
- Não requer arquivo externo
- Renderização rápida

---

## 📚 Documentação Relacionada

- [Evoluções Implementadas](./EVOLUCOES_IMPLEMENTADAS.md)
- [Módulo de Ordens de Serviço](./ORDERS_MODULE.md)
- [API Documentation](./api/API.md)

---

## ✅ Status

**Módulo 100% funcional e integrado!**

- ✅ Backend completo
- ✅ Frontend completo
- ✅ Integração com PDFs
- ✅ Validações implementadas
- ✅ Interface profissional
- ✅ Documentação completa

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0
