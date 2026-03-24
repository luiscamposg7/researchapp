# UX Research Portal — Contexto del proyecto

## Stack
- React 19 SPA, React Router 7, Tailwind CSS 3, Vite
- Supabase como base de datos
- Desplegado en Vercel

## Estructura
- **Todo el código principal está en `src/App.jsx`** (~2400+ líneas) — monolítico por decisión
- `RichEditor` está definido INLINE en App.jsx — NO usar `components/RichEditor.jsx`
- `src/index.css` — design tokens CSS, animated background, sel-arrow, scrollbar, rich-content

## Base de datos
- Supabase: `https://brbnyeybtofvekxqhwgb.supabase.co`
- Tabla: `deliverables` con columnas `id BIGINT`, `data JSONB`, `created_at TIMESTAMPTZ`
- Dev local: vite.config.js usa REST de Supabase via `https` nativo (Node 16, sin cliente JS)
- Producción (Vercel): `api/deliverables/*.js` usan `@supabase/supabase-js` (requiere Node 20)
- Credenciales en `.env.local` (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

## Versión actual: 1.0.6
Backup en `src/App.jsx.v1.0.6.bak`

### Qué incluye v1.0.6
- `CustomSelect` — componente propio que reemplaza todos los `<select>` nativos para controlar posición del dropdown
- Fondo degradado animado — `animated-bg-1/2` en index.css, keyframes `bg-drift-1/2`
- Focus ring verde en search bars — `ring-1 ring-green-400 focus:border-green-400`
- Dark mode hero: `#040C16`
- Filtros en "Todos los research": estado base muestra todo (`filterType/filterProduct/filterEstado` inicializan en `""`)
- 'Otros productos' en ProductPage: dot con color + nombre + count (sin cover)
- Ocultar badge Jira si no hay ticket vinculado
- ProductPage: 3 research más recientes publicados como cards en 'Todos los research'
- `sel-arrow` CSS class para selects nativos restantes
- Miniaturas Google Slides, foto de perfil Google, versión en configuración
- Todo lo de v1.0.5: borders + shadow-xs en cards, nivel tec select, text-sm global
- Todo lo de v1.0.4: Figma img proxy, persona fixes
- Todo lo de v1.0.3: canvas grid animado en hero, botón "Volver a [contexto]" dinámico, sidebar colapsa al desfijar
- Todo lo de v1.0.2: URLs con slug, editores dinámicos desde Supabase, restricción @prestamype.com
- Todo lo de v1.0.1: Supabase BD, RichEditor con heading dropdown, Buyer/User Persona forms

## Advertencias importantes
- **NUNCA** hacer `git checkout src/App.jsx` — los cambios no están commiteados
- Si se necesita revertir, usar `src/App.jsx.v1.0.6.bak`
- Node 16 en local: `@supabase/supabase-js` no funciona en vite.config.js ni en scripts — usar `https` nativo

## Colores
- Verde primario: `#00B369`, hover: `#00975B`
- PRODUCT_COLORS: PGH=`#00D97A`, Factoring=`#00975B`, Gestora=`#5EBDB3`, Tandia=`#1D4ED8`, Recadia=`#2D8E5F`, Cambio Seguro=`#7C3AED`
- Orden productos: `["PGH", "Factoring", "Gestora", "Cambio Seguro", "Tandia", "Recadia"]`

## Design System — Untitled UI React
- Código del design system en: `/Users/luiscg/Downloads/react-main 2` (solo disponible en la Mac principal)
- Ya integrado: `react-aria-components` y `@untitledui/icons` en package.json
- Componentes base: avatar, badges, buttons, checkbox, dropdown, input, select, tags, textarea, toggle, tooltip
- Componentes app: app-navigation, carousel, date-picker, empty-state, modals, pagination, slideout-menus, table, tabs
- Se construyen sobre **React Aria Components** con prefijo `Aria*` en imports
- Tailwind CSS v4.1 en el design system (proyecto usa v3)
- Design tokens via CSS custom properties: `--color-bg-page`, `--color-border`, etc.
- Cuando el usuario pida mejorar un componente UI, revisar primero el design system en esa ruta

## Tokens de diseño (index.css)
- `--color-bg-page`, `--color-bg-surface`, `--color-bg-muted`, `--color-bg-hover`, `--color-bg-active`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-text-muted`
- `--color-border`, `--color-border-subtle`, `--color-border-strong`
- `--color-brand: #00B369`, `--color-brand-hover: #00975B`
- `.shadow-xs` — `0 1px 2px 0 rgba(10, 13, 18, 0.05)`
- Dark mode via clase `.dark-mode` en el root div
