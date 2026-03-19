# Quick Order — Customer Frontend & Theming System
> Spec za agenta koji gradi guest view i admin theme config

---

## Kontekst

Aplikacija za naručivanje u kafićima putem QR koda. Gost skenira QR na stolu, dobija mobilni meni, naručuje — konobar vidi narudžbinu u realnom vremenu. Backend je Java/Spring Boot (kolega radi). Ovaj dokument pokriva isključivo:

1. **Customer (guest) view** — ono što gost vidi nakon skeniranja QR koda
2. **Admin theme config** — kako se nova tema dodaje kroz JSON, bez code changeva

---

## Stack

```
React 18 + TypeScript
Vite (build tool)
TailwindCSS (utility layer)
CSS Custom Properties (theming engine — core)
React Query (TanStack) — fetching menija i slanje narudžbine
Zustand — cart state (lokalni, bez persistencije)
Framer Motion — animacije (cart drawer, item add, toast)
React Router v6 — routing po cafeId i tableId
```

### Zašto ovaj stack?

- **Vite** — instant HMR, bitno za theming iteracije
- **CSS Custom Properties** — jedini način da se tema primeni runtime bez rebuild-a; JSON → CSS vars injection u `<style>` tag
- **Zustand** — minimalan boilerplate za cart, ne treba Redux
- **React Query** — caching menija po cafeId-u, retry logika, loading states out-of-box
- **Framer Motion** — cart interakcije moraju biti smooth na mobilnom (touch feel)

---

## Routing struktura

```
/:cafeId/:tableId          → Guest menu view (main)
/:cafeId/:tableId/cart     → Cart review (opciono, može i drawer)
/:cafeId/:tableId/confirm  → Order confirmation screen
/admin                     → Admin panel (theme config, menu management)
/admin/:cafeId/theme       → Theme editor za konkretan kafić
```

QR kod generiše link u formatu: `https://app.quickorder.rs/{cafeId}/{tableId}`

---

## 1. Customer (Guest) View

### Šta gost vidi nakon skeniranja

```
┌─────────────────────────────┐
│  [Logo kafića]   Sto #4     │  ← header (naziv kafića + broj stola)
├─────────────────────────────┤
│  [Kafa] [Hrana] [Deserti]   │  ← category tabs (horizontal scroll)
├─────────────────────────────┤
│  ┌─────────┐ ┌─────────┐   │
│  │  Img    │ │  Img    │   │  ← item cards (2-column grid)
│  │ Espresso│ │ Latte   │   │
│  │ 250 rsd │ │ 320 rsd │   │
│  │  [+]    │ │  [+]    │   │
│  └─────────┘ └─────────┘   │
│                             │
│  ... (scroll) ...           │
├─────────────────────────────┤
│  🛒  2 stavke  |  570 rsd  │  ← sticky cart bar (pojavljuje se kad ima items)
└─────────────────────────────┘
```

### Komponente

#### `<GuestApp />`
Root komponenta. Fetchuje temu po `cafeId` i injectuje CSS vars. Fetchuje meni.

```tsx
// Pseudo-kod, agent implementira
const { cafeId, tableId } = useParams()
const { data: theme } = useQuery(['theme', cafeId], () => fetchTheme(cafeId))
const { data: menu } = useQuery(['menu', cafeId], () => fetchMenu(cafeId))

useEffect(() => {
  if (theme) injectTheme(theme) // CSS vars injection
}, [theme])
```

#### `<CategoryTabs />`
- Horizontalni scroll, bez wrappinga
- Aktivna kategorija underline animacija (Framer Motion layout)
- Sticky ispod headera

#### `<MenuGrid />`
- 2-column grid na mobilnom, 3-column na tabletu
- Filtrira po aktivnoj kategoriji
- Virtualizacija nije potrebna (meni kafića retko > 60 stavki)

#### `<ItemCard />`
- Slika (aspect-ratio: 4/3, object-fit: cover)
- Naziv, opis (max 2 linije, truncate), cena
- `[+]` dugme → dodaje u Zustand cart + haptic feedback (navigator.vibrate)
- Ako je item već u cartu: prikazuje quantity stepper umesto `[+]`

#### `<CartBar />`
- Sticky bottom, `position: fixed`
- Animirano pojavljivanje (slide-up kad cart nije prazan)
- Prikazuje broj stavki i ukupnu cenu
- Klik → otvara `<CartDrawer />`

#### `<CartDrawer />`
- Bottom sheet (Framer Motion drag-to-dismiss)
- Lista naručenih stavki sa stepper-ima i remove opcijom
- `Napomena za kuhinju` — textarea (opciono)
- CTA: "Naruči" dugme

#### `<OrderConfirmation />`
- Fullscreen success state
- Animacija (confetti ili jednostavan check mark)
- Poruka: "Narudžbina primljena! Konobar dolazi uskoro."
- Opcija: "Naruči još" → vraća na meni

### API pozivi (prema backend-u)

```
GET /api/cafe/{cafeId}/theme       → ThemeConfig JSON
GET /api/cafe/{cafeId}/menu        → MenuItem[]
POST /api/orders                   → CreateOrderDto
  body: { cafeId, tableId, items: [{menuItemId, quantity}], note? }
```

---

## 2. Theming System

### Princip

Tema se čuva u bazi kao JSON. Admin je menja kroz UI. Frontend je fetchuje runtime i injectuje kao CSS custom properties — **nula rekompajliranja, nula redeploymenta**.

### ThemeConfig JSON schema

```typescript
interface ThemeConfig {
  cafeId: string
  name: string           // "Espresso Dark", "Bright Minimal"...
  preset?: string        // "warm" | "modern" | "minimal" | "luxury" (bazni preset)

  colors: {
    background: string         // main app background
    surface: string            // card background
    surfaceHover: string       // card hover state
    primary: string            // CTA button, active tab, accents
    primaryText: string        // tekst na primary boji
    textPrimary: string        // naslovi
    textSecondary: string      // opisi, sekundarne info
    textMuted: string          // placeholder, disabled
    border: string             // card borders, dividers
    cartBar: string            // sticky cart bar background
    cartBarText: string        // tekst u cart baru
    success: string            // order confirmation
    error: string              // greške
  }

  typography: {
    fontDisplay: string        // Google Fonts naziv — za naslove, cene
    fontBody: string           // Google Fonts naziv — za opise, UI
    fontSizeBase: string       // "16px" default
    fontWeightDisplay: number  // 700
    fontWeightBody: number     // 400
    letterSpacingDisplay: string // "0.02em"
  }

  shape: {
    borderRadius: string       // "12px" | "4px" | "24px"
    cardShadow: string         // CSS box-shadow vrednost
    imageBorderRadius: string  // posebno za slike stavki
  }

  layout: {
    headerStyle: "minimal" | "branded" | "fullImage"
    // minimal = samo naziv + sto
    // branded = logo + naziv + sto
    // fullImage = hero slika kafića na vrhu
    gridColumns: 1 | 2         // 1 za luxuriozan feel, 2 za gusti meni
    showItemDescription: boolean
    showCategoryIcons: boolean
  }

  assets: {
    logoUrl?: string           // URL loga kafića
    headerImageUrl?: string    // za headerStyle: "fullImage"
    placeholderImageUrl?: string // fallback za stavke bez slike
    faviconUrl?: string
  }
}
```

### Primer — "Espresso Dark" tema

```json
{
  "cafeId": "kafic-arsenal",
  "name": "Espresso Dark",
  "preset": "warm",
  "colors": {
    "background": "#1a1008",
    "surface": "#261a0e",
    "surfaceHover": "#312010",
    "primary": "#d4843a",
    "primaryText": "#1a1008",
    "textPrimary": "#f5e6d0",
    "textSecondary": "#b89a78",
    "textMuted": "#7a6050",
    "border": "#3d2a18",
    "cartBar": "#d4843a",
    "cartBarText": "#1a1008",
    "success": "#5a9e6f",
    "error": "#c0554a"
  },
  "typography": {
    "fontDisplay": "Playfair Display",
    "fontBody": "DM Sans",
    "fontSizeBase": "16px",
    "fontWeightDisplay": 700,
    "fontWeightBody": 400,
    "letterSpacingDisplay": "0.01em"
  },
  "shape": {
    "borderRadius": "12px",
    "cardShadow": "0 4px 20px rgba(0,0,0,0.4)",
    "imageBorderRadius": "8px"
  },
  "layout": {
    "headerStyle": "branded",
    "gridColumns": 2,
    "showItemDescription": true,
    "showCategoryIcons": false
  },
  "assets": {
    "logoUrl": "https://cdn.quickorder.rs/cafes/arsenal/logo.png",
    "placeholderImageUrl": "https://cdn.quickorder.rs/placeholder-coffee.jpg"
  }
}
```

### Primer — "Bright Minimal" tema

```json
{
  "cafeId": "kafic-loft",
  "name": "Bright Minimal",
  "preset": "modern",
  "colors": {
    "background": "#fafafa",
    "surface": "#ffffff",
    "surfaceHover": "#f5f5f5",
    "primary": "#111111",
    "primaryText": "#ffffff",
    "textPrimary": "#111111",
    "textSecondary": "#555555",
    "textMuted": "#aaaaaa",
    "border": "#eeeeee",
    "cartBar": "#111111",
    "cartBarText": "#ffffff",
    "success": "#2d8653",
    "error": "#c0392b"
  },
  "typography": {
    "fontDisplay": "Space Mono",
    "fontBody": "Inter",
    "fontSizeBase": "15px",
    "fontWeightDisplay": 700,
    "fontWeightBody": 400,
    "letterSpacingDisplay": "-0.02em"
  },
  "shape": {
    "borderRadius": "4px",
    "cardShadow": "0 1px 3px rgba(0,0,0,0.08)",
    "imageBorderRadius": "4px"
  },
  "layout": {
    "headerStyle": "minimal",
    "gridColumns": 1,
    "showItemDescription": true,
    "showCategoryIcons": true
  },
  "assets": {
    "placeholderImageUrl": "https://cdn.quickorder.rs/placeholder-minimal.jpg"
  }
}
```

### CSS injection funkcija

```typescript
// src/lib/injectTheme.ts
export function injectTheme(theme: ThemeConfig) {
  const { colors, typography, shape } = theme

  // Google Fonts dinamički load
  const fontsToLoad = [typography.fontDisplay, typography.fontBody]
    .filter(Boolean)
    .map(f => f.replace(/ /g, '+'))
    .join('&family=')

  let fontLink = document.getElementById('qo-fonts') as HTMLLinkElement
  if (!fontLink) {
    fontLink = document.createElement('link')
    fontLink.id = 'qo-fonts'
    fontLink.rel = 'stylesheet'
    document.head.appendChild(fontLink)
  }
  fontLink.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad}:wght@400;600;700&display=swap`

  // CSS vars injection
  const vars = `
    :root {
      --bg: ${colors.background};
      --surface: ${colors.surface};
      --surface-hover: ${colors.surfaceHover};
      --primary: ${colors.primary};
      --primary-text: ${colors.primaryText};
      --text-1: ${colors.textPrimary};
      --text-2: ${colors.textSecondary};
      --text-muted: ${colors.textMuted};
      --border: ${colors.border};
      --cart-bar: ${colors.cartBar};
      --cart-bar-text: ${colors.cartBarText};
      --success: ${colors.success};
      --error: ${colors.error};
      --radius: ${shape.borderRadius};
      --radius-img: ${shape.imageBorderRadius};
      --shadow: ${shape.cardShadow};
      --font-display: '${typography.fontDisplay}', serif;
      --font-body: '${typography.fontBody}', sans-serif;
      --font-size-base: ${typography.fontSizeBase};
    }
  `

  let styleEl = document.getElementById('qo-theme') as HTMLStyleElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'qo-theme'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = vars
}
```

---

## 3. Admin Theme Editor (deo Admin panela)

### Šta admin treba da može

1. Odabere kafić iz liste
2. Vidi preview menija sa trenutnom temom (iframe ili live preview)
3. Menja vrednosti (color picker, font dropdown, shape slideri)
4. Sačuva → PATCH `/api/cafe/{cafeId}/theme`
5. Opciono: odabere gotov preset kao početnu tačku

### Presets koji se nude

| Preset | Opis | Boja | Font display |
|--------|------|------|--------------|
| `warm` | Toplo, espresso, tamno | Amber na tamnoj pozadini | Playfair Display |
| `modern` | Čisto, minimalno, svetlo | Crno na belom | Space Mono |
| `minimal` | Ultra-clean, puno white space | Sivo na belom | DM Serif Display |
| `luxury` | Premium, zlatni akcenti | Zlatna na tamnoplavoj | Cormorant Garamond |

### Admin UI tok (wireframe opisno)

```
[Odaberi kafić ▾]

[Preset: Warm | Modern | Minimal | Luxury]   ← brzi start

──── Boje ────
Background     [████] #1a1008
Primary        [████] #d4843a
Text primary   [████] #f5e6d0
... (ostale)

──── Tipografija ────
Display font   [Playfair Display ▾]
Body font      [DM Sans ▾]

──── Oblik ────
Border radius  [────●────] 12px
Card shadow    [Light | Medium | Heavy]

──── Layout ────
Header style   [Minimal | Branded | Full Image]
Grid           [1 kolona | 2 kolone]

[Sačuvaj temu]  [Preview u novom tabu]
```

---

## 4. Napomene za agenta

### Šta agent treba da uradi

1. Scaffolduj Vite + React + TS projekat sa opisanom folder strukturom
2. Implementiraj `injectTheme()` funkciju tačno kako je opisano
3. Napravi sve guest view komponente (Header, CategoryTabs, MenuGrid, ItemCard, CartBar, CartDrawer, OrderConfirmation)
4. Zustand store za cart (`useCartStore`)
5. React Query hookovi: `useTheme(cafeId)`, `useMenu(cafeId)`, `useSubmitOrder()`
6. Admin `/admin/:cafeId/theme` rutu sa form-om i color pickerima
7. Demo podatke (mock JSON) za lokalni razvoj bez backend-a
8. Responsive — mobile-first, breakpoint na 640px za tablet

### Folder struktura

```
src/
  components/
    guest/
      GuestApp.tsx
      Header.tsx
      CategoryTabs.tsx
      MenuGrid.tsx
      ItemCard.tsx
      CartBar.tsx
      CartDrawer.tsx
      OrderConfirmation.tsx
    admin/
      ThemeEditor.tsx
      PresetSelector.tsx
      ColorField.tsx
      FontSelector.tsx
  hooks/
    useTheme.ts
    useMenu.ts
    useSubmitOrder.ts
    useCart.ts          ← Zustand store wrapper
  lib/
    injectTheme.ts
    api.ts              ← fetch helpers
    presets.ts          ← 4 gotova preset objekta
  types/
    theme.ts            ← ThemeConfig interface
    menu.ts             ← MenuItem, Category, Order interfaces
  routes/
    GuestRoute.tsx      ← /:cafeId/:tableId
    AdminRoute.tsx      ← /admin/:cafeId/theme
  App.tsx
  main.tsx
```

### Važno — mobile feel

- Sve touch target-i minimum 44px visine
- Cart bar mora biti iznad iOS safe area (env(safe-area-inset-bottom))
- CartDrawer drag-to-dismiss: `dragConstraints={{ top: 0 }}` u Framer Motion
- Nikakav hover effect koji ne radi na touch — koristiti `active:` pseudoclass

### Backend API pretpostavke

Agent treba da napravi mock-ove za sve ove endpointe:

```
GET  /api/cafe/:cafeId/theme    → ThemeConfig
GET  /api/cafe/:cafeId/menu     → { categories: Category[], items: MenuItem[] }
POST /api/orders                → { orderId: string, estimatedMinutes: number }
PATCH /api/cafe/:cafeId/theme   → ThemeConfig (admin save)
```

---

## Reference

- Originalna konverzacija: https://claude.ai/chat/000612a0-7b3a-4a26-a77d-1f3e6967bf60
- Naziv projekta (radni): `quick-order` / alternativno `pronto`, `tap-order`
- Backend: Java/Spring Boot mikroservisna arhitektura (kolega)
- Deployment target: Docker Compose na Hetzner VPS + Nginx reverse proxy
