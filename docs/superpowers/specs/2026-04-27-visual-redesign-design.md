# Ropaya Visual Redesign — Design Spec

**Date:** 2026-04-27  
**Status:** Approved

---

## Overview

Redesign Ropaya's frontend to be visually striking and modern for a 18-35 Buenos Aires audience. The current implementation is functional but bland (dark zinc + emerald). The new design ("Mercado Premium") uses a near-black/off-white palette with a vibrant orange accent, Plus Jakarta Sans display font, glassmorphism navbar, improved card layouts, and a light/dark theme toggle.

---

## Design System

### Typography
- **Headings:** Plus Jakarta Sans (via `next/font/google`) — bold, modern
- **Body:** Inter (already installed) — unchanged

### Color Palette

| Token (CSS var) | Dark value | Light value |
|---|---|---|
| `--background` | `#0a0a0a` | `#fafafa` |
| `--card` | `#141414` | `#ffffff` |
| `--border` | `#222222` | `#e5e5e5` |
| `--foreground` | `#f5f5f5` | `#0a0a0a` |
| `--muted-foreground` | zinc-400 equiv | zinc-500 equiv |
| `--primary` (accent) | `#FF6B35` | `#E85D2A` |
| `--primary-foreground` | `#ffffff` | `#ffffff` |

### Theme
- Implemented via `next-themes` library
- Toggle in navbar (sun/moon icon)
- Class-based dark mode: `class` strategy on `<html>`
- shadcn's existing CSS variable system reused, only values changed

---

## Components

### Navbar (new global component)
- Sticky, `backdrop-blur-md bg-background/80`, `border-b border-border`
- Left: "Ropaya" logo in Plus Jakarta Sans bold
- Center/Right: links "Inicio" / "Locales", cart icon with item count badge, theme toggle
- Wraps all pages via `app/layout.tsx`

### ProductCard
- Image fills full card width, 4:5 aspect ratio, no rounded corners on image
- Info below: name (medium, 1 line), price (orange, bold), available sizes as small chips
- Hover: `translateY(-4px)` + subtle orange box-shadow
- Transition: `transition-all duration-200`

### StoreCard
- Same hover treatment
- "Verificado" badge: orange variant instead of emerald-900
- "Destacado" badge: amber kept
- Address and description text improved contrast

### SizeTable (rename: SizeSelector)
- Buttons unchanged structurally
- Selected state: orange background + white text instead of zinc-50/zinc-900

### CartItem
- Thumbnail rounded-lg
- Price in orange
- Border separator uses `border-border` token

### TrackingStatus
- Completed steps: orange `CheckCircle` instead of emerald

---

## Pages

### app/layout.tsx
- Add `ThemeProvider` from `next-themes` wrapping children
- Load Plus Jakarta Sans alongside Inter
- Apply `suppressHydrationWarning` on `<html>`
- Add `<Navbar />` inside body before `{children}`

### Home page (`app/page.tsx`)
- Hero: heading `text-6xl lg:text-7xl font-bold` with "Avellaneda" in orange gradient (`bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent`)
- Radial gradient background on hero section (`bg-[radial-gradient(...)]`)
- Section titles with left orange border decoration (`border-l-4 border-primary pl-3`)
- CTA button: orange primary

### Stores page (`app/stores/page.tsx`)
- Header with store count: `X locales disponibles`
- Same grid, StoreCards updated

### Product page (`app/products/[id]/page.tsx`)
- Larger image container (left column)
- Price in orange
- SizeSelector with orange selected state
- "Agregar al carrito" button orange
- "Ver carrito" outline button uses `border-border`

### Cart page (`app/cart/page.tsx`)
- Updated CartItem, total in orange
- "Ir a pagar" button orange

### Checkout page (`app/checkout/page.tsx`)
- Summary card: `bg-card border border-border`
- Input: `bg-background border-border`
- "Confirmar y pagar" button orange

### Order page (`app/orders/[id]/page.tsx`)
- `CheckCircle` in orange
- TrackingStatus updated

---

## Dependencies to add
- `next-themes` — theme provider and toggle

---

## Out of scope
- Auth, new pages, API changes, layout restructuring
- Animation libraries beyond existing `tw-animate-css`
