# 📱 Sistema de Responsividade - AutoPro

Documentação completa sobre o sistema de responsividade implementado no AutoPro para funcionar perfeitamente em todos os dispositivos.

---

## 🎯 Visão Geral

O sistema foi projetado para funcionar perfeitamente em:
- **Mobile Pequeno** (< 480px): Smartphones pequenos
- **Mobile** (< 768px): Smartphones padrão
- **Tablet** (768px - 1023px): Tablets em portrait e landscape
- **Desktop** (>= 1024px): Desktops e laptops

---

## 🛠️ Componentes Responsivos Criados

### 1. `useResponsive` Hook

Hook para detectar tamanho da tela e breakpoints:

```typescript
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, isSmallMobile, width } = useResponsive();
  
  return (
    <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </div>
  );
};
```

**Propriedades:**
- `width`: Largura atual da tela
- `isSmallMobile`: < 480px
- `isMobile`: < 768px
- `isTablet`: 768px - 1023px
- `isDesktop`: >= 1024px

### 2. `ResponsiveTable` Component

Tabela que se transforma em cards em mobile:

```typescript
import { ResponsiveTable } from '../components/common/ResponsiveTable';

<ResponsiveTable
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email', hideOnMobile: true },
    { 
      key: 'actions', 
      label: 'Ações',
      render: (item) => <button>Editar</button>
    }
  ]}
  data={items}
  keyExtractor={(item) => item.id}
  emptyMessage="Nenhum item encontrado"
/>
```

**Características:**
- Desktop: Tabela tradicional
- Mobile/Tablet: Cards com informações organizadas
- Suporte a `hideOnMobile` para ocultar colunas em mobile
- `render` customizado por coluna

### 3. `ResponsiveModal` Component

Modal que se adapta ao tamanho da tela:

```typescript
import { ResponsiveModal } from '../components/common/ResponsiveModal';

<ResponsiveModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título do Modal"
  size="md" // sm | md | lg | xl | full
>
  Conteúdo do modal
</ResponsiveModal>
```

**Características:**
- Mobile: Fullscreen (100vh) com animação slide-up
- Desktop: Centralizado com tamanhos configuráveis
- Fecha com ESC ou clique fora
- Previne scroll do body quando aberto

### 4. `ResponsiveInput` Component

Input otimizado para mobile:

```typescript
import { ResponsiveInput } from '../components/common/ResponsiveInput';

<ResponsiveInput
  label="Nome"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={errors.name}
  helperText="Digite o nome completo"
  required
/>
```

**Otimizações Mobile:**
- Font-size de 16px (previne zoom no iOS)
- Padding maior para melhor toque
- Labels maiores e mais legíveis

### 5. `ResponsiveTextarea` Component

Textarea responsivo:

```typescript
import { ResponsiveTextarea } from '../components/common/ResponsiveTextarea';

<ResponsiveTextarea
  label="Descrição"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
/>
```

### 6. `ResponsiveButton` Component

Botão responsivo com variantes:

```typescript
import { ResponsiveButton } from '../components/common/ResponsiveButton';

<ResponsiveButton
  variant="primary" // primary | secondary | danger | ghost
  size="md" // sm | md | lg
  fullWidth={isMobile}
  icon={<Plus size={20} />}
  loading={isLoading}
>
  Criar Item
</ResponsiveButton>
```

---

## 📐 Breakpoints

```css
/* Mobile Pequeno */
@media (max-width: 480px) { ... }

/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 481px) and (max-width: 1023px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

---

## 🎨 Melhorias Implementadas

### Layout Principal

- **Sidebar Mobile**: Drawer que desliza da esquerda
- **Overlay**: Fundo escuro quando sidebar está aberta em mobile
- **Header**: Padding reduzido em mobile, busca oculta
- **Conteúdo**: Padding adaptativo (1rem mobile, 2rem desktop)

### Tabelas

- **Desktop**: Tabela tradicional com scroll horizontal se necessário
- **Mobile**: Cards organizados verticalmente
- **Touch-friendly**: Áreas de toque maiores (44px mínimo)

### Formulários

- **Inputs**: Font-size 16px em mobile (previne zoom iOS)
- **Labels**: Tamanho maior e mais legível
- **Espaçamento**: Padding maior para melhor toque
- **Validação**: Feedback visual claro

### Modais

- **Mobile**: Fullscreen com animação slide-up
- **Desktop**: Centralizado com tamanhos configuráveis
- **Scroll**: Scroll interno quando conteúdo é maior
- **Fechar**: ESC, clique fora ou botão X

### Botões e Interações

- **Touch Targets**: Mínimo 44x44px (padrão Apple/Google)
- **Feedback Visual**: Estados hover e active
- **Touch Feedback**: Efeito de scale em mobile
- **Prevenção**: Double-tap zoom desabilitado

---

## 🎯 Otimizações Mobile Específicas

### iOS

- **Font-size 16px**: Previne zoom automático ao focar inputs
- **-webkit-appearance: none**: Remove estilos padrão do iOS
- **touch-action: manipulation**: Previne double-tap zoom
- **-webkit-overflow-scrolling: touch**: Scroll suave

### Android

- **Viewport meta tag**: Configurado corretamente
- **Touch targets**: Áreas de toque adequadas
- **Prevent zoom**: Text-size-adjust

### Performance

- **Lazy loading**: Componentes carregados sob demanda
- **Otimização de imagens**: Lazy loading e tamanhos responsivos
- **CSS otimizado**: Media queries eficientes

---

## 📱 Funcionalidades por Dispositivo

### Mobile (< 768px)

✅ Sidebar como drawer  
✅ Tabelas transformadas em cards  
✅ Header simplificado  
✅ Modais fullscreen  
✅ Inputs otimizados (sem zoom)  
✅ Botões maiores (44px mínimo)  
✅ Padding reduzido  
✅ Scroll otimizado  

### Tablet (768px - 1023px)

✅ Sidebar sempre visível (pode colapsar)  
✅ Tabelas podem usar scroll horizontal  
✅ Grids de 2 colunas onde apropriado  
✅ Modais com tamanho médio  
✅ Formulários podem usar 2 colunas  

### Desktop (>= 1024px)

✅ Sidebar fixa com opção de colapsar  
✅ Tabelas completas  
✅ Layouts multi-coluna  
✅ Modais centralizados  
✅ Hover effects completos  

---

## 🔧 Como Usar

### Em Componentes Existentes

Para melhorar um componente existente para mobile:

1. **Importar o hook**:
```typescript
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { isMobile } = useResponsive();
  // ...
};
```

2. **Aplicar estilos condicionais**:
```typescript
<div style={{
  padding: isMobile ? '1rem' : '2rem',
  fontSize: isMobile ? '1rem' : '1.125rem',
}}>
```

3. **Substituir tabelas**:
```typescript
// Antes
<table>...</table>

// Depois
<ResponsiveTable
  columns={columns}
  data={data}
  keyExtractor={(item) => item.id}
/>
```

4. **Substituir modais**:
```typescript
// Antes
<div style={{ position: 'fixed', ... }}>...</div>

// Depois
<ResponsiveModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título"
>
  Conteúdo
</ResponsiveModal>
```

---

## 📊 CSS Utilities

### Classes Úteis

```css
/* Grid responsivo */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}

/* Container responsivo */
.container {
  width: 100%;
  padding: 0 1rem;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}
```

---

## ✅ Checklist de Responsividade

Para garantir que um componente é totalmente responsivo:

- [ ] Usa `useResponsive` hook quando necessário
- [ ] Padding adaptativo (menor em mobile)
- [ ] Font-size apropriado (16px em inputs mobile)
- [ ] Touch targets >= 44px
- [ ] Tabelas usam `ResponsiveTable` ou têm scroll horizontal
- [ ] Modais usam `ResponsiveModal`
- [ ] Inputs usam `ResponsiveInput` ou têm font-size 16px
- [ ] Botões têm tamanho adequado para toque
- [ ] Testado em diferentes tamanhos de tela
- [ ] Funciona em portrait e landscape (mobile)

---

## 🧪 Testando Responsividade

### Ferramentas

1. **DevTools do Chrome/Firefox**:
   - F12 → Toggle Device Toolbar (Ctrl+Shift+M)
   - Testar diferentes dispositivos

2. **Dispositivos Reais**:
   - iOS (Safari)
   - Android (Chrome)
   - Tablets

3. **Breakpoints para testar**:
   - 320px (iPhone SE)
   - 375px (iPhone X/11/12)
   - 768px (iPad)
   - 1024px (Desktop pequeno)
   - 1920px (Desktop grande)

---

## 📚 Arquivos Relacionados

### Hooks
- `frontend/src/hooks/useResponsive.ts`

### Componentes
- `frontend/src/components/common/ResponsiveTable.tsx`
- `frontend/src/components/common/ResponsiveModal.tsx`
- `frontend/src/components/common/ResponsiveInput.tsx`
- `frontend/src/components/common/ResponsiveTextarea.tsx`
- `frontend/src/components/common/ResponsiveButton.tsx`

### Layout
- `frontend/src/components/layout/MainLayout.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Sidebar.tsx`

### Estilos
- `frontend/src/index.css`

---

**Última atualização**: Dezembro 2025  
**Versão**: 1.2.0

