# Ropaya Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Ropaya's frontend into a visually striking "Mercado Premium" design with orange accent palette, Plus Jakarta Sans typography, glassmorphism navbar, improved cards, and light/dark theme toggle.

**Architecture:** All changes are purely frontend/visual — no API or data model changes. We add `next-themes` for theme switching, update CSS variables in `globals.css`, add a global Navbar component in `layout.tsx`, and update each page and component to use the new design tokens and layout improvements.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, `next-themes`, Plus Jakarta Sans (Google Fonts), lucide-react

---

### Task 1: Install next-themes and add Plus Jakarta Sans font

**Files:**
- Modify: `services/frontend/package.json`
- Modify: `services/frontend/app/layout.tsx`

- [ ] **Step 1: Install next-themes**

```bash
cd services/frontend && npm install next-themes
```

Expected output: `added 1 package` (or similar), no errors.

- [ ] **Step 2: Verify install**

```bash
cd services/frontend && node -e "require('next-themes'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Update layout.tsx to add Plus Jakarta Sans and ThemeProvider**

Replace the entire file `services/frontend/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ropaya — Ropa de Avellaneda a domicilio",
  description: "Comprá ropa de los mejores locales de Avellaneda sin salir de tu casa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans bg-background text-foreground min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd services/frontend && git add package.json package-lock.json app/layout.tsx
git commit -m "feat: install next-themes, add Plus Jakarta Sans, wrap app in ThemeProvider"
```

---

### Task 2: Update CSS variables — new palette and font tokens

**Files:**
- Modify: `services/frontend/app/globals.css`

- [ ] **Step 1: Replace globals.css with new design tokens**

Replace the entire file `services/frontend/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-heading: var(--font-heading);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

/* ── Light theme ── */
:root {
  --background: #fafafa;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;
  --primary: #E85D2A;
  --primary-foreground: #ffffff;
  --secondary: #f0f0f0;
  --secondary-foreground: #0a0a0a;
  --muted: #f0f0f0;
  --muted-foreground: #737373;
  --accent: #f0f0f0;
  --accent-foreground: #0a0a0a;
  --destructive: oklch(0.577 0.245 27.325);
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #FF6B35;
  --radius: 0.625rem;
  --sidebar: #f5f5f5;
  --sidebar-foreground: #0a0a0a;
  --sidebar-primary: #E85D2A;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f0f0f0;
  --sidebar-accent-foreground: #0a0a0a;
  --sidebar-border: #e5e5e5;
  --sidebar-ring: #FF6B35;
}

/* ── Dark theme ── */
.dark {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --card: #141414;
  --card-foreground: #f5f5f5;
  --popover: #141414;
  --popover-foreground: #f5f5f5;
  --primary: #FF6B35;
  --primary-foreground: #ffffff;
  --secondary: #1f1f1f;
  --secondary-foreground: #f5f5f5;
  --muted: #1f1f1f;
  --muted-foreground: #a3a3a3;
  --accent: #1f1f1f;
  --accent-foreground: #f5f5f5;
  --destructive: oklch(0.704 0.191 22.216);
  --border: #222222;
  --input: #222222;
  --ring: #FF6B35;
  --sidebar: #141414;
  --sidebar-foreground: #f5f5f5;
  --sidebar-primary: #FF6B35;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #1f1f1f;
  --sidebar-accent-foreground: #f5f5f5;
  --sidebar-border: #222222;
  --sidebar-ring: #FF6B35;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading), var(--font-inter), sans-serif;
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add app/globals.css
git commit -m "feat: update CSS design tokens — orange accent, near-black dark, off-white light"
```

---

### Task 3: Create Navbar component

**Files:**
- Create: `services/frontend/components/Navbar.tsx`

- [ ] **Step 1: Create Navbar.tsx**

```tsx
"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ShoppingBag, Sun, Moon } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur-md bg-background/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Ropaya
        </Link>

        {/* Nav links + actions */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Inicio
          </Link>
          <Link href="/stores" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Locales
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <ShoppingBag size={20} className="text-foreground" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify the file was created correctly**

```bash
cat services/frontend/components/Navbar.tsx | head -5
```

Expected: starts with `"use client";`

- [ ] **Step 3: Commit**

```bash
cd services/frontend && git add components/Navbar.tsx
git commit -m "feat: add glassmorphism Navbar with cart badge and theme toggle"
```

---

### Task 4: Update ProductCard

**Files:**
- Modify: `services/frontend/components/ProductCard.tsx`

- [ ] **Step 1: Replace ProductCard.tsx**

```tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/api";

export function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,107,53,0.15)]">
        <div className="aspect-[4/5] relative bg-muted overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Sin foto
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-1.5">
          <p className="text-foreground font-medium text-sm line-clamp-1">{product.name}</p>
          <p className="text-primary font-bold">{formattedPrice}</p>
          <div className="flex gap-1 flex-wrap">
            {product.sizes.filter((s) => s.stock > 0).map((s) => (
              <span
                key={s.size}
                className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {s.size}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add components/ProductCard.tsx
git commit -m "feat: redesign ProductCard with hover lift, orange accent, scale image"
```

---

### Task 5: Update StoreCard

**Files:**
- Modify: `services/frontend/components/StoreCard.tsx`

- [ ] **Step 1: Replace StoreCard.tsx**

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Store } from "@/lib/api";
import { MapPin } from "lucide-react";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/stores/${store.id}`}>
      <Card className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer h-full hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,107,53,0.12)]">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-foreground text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {store.name}
            </CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              {store.is_verified && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Verificado
                </Badge>
              )}
              {store.is_featured && (
                <Badge className="bg-amber-500 text-zinc-900 text-xs">Destacado</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin size={14} />
            <span>{store.address}</span>
          </div>
          {store.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{store.description}</p>
          )}
          <p className="text-muted-foreground text-xs">
            {store.accepts_returns ? "✓ Acepta devoluciones" : "✗ No acepta devoluciones"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add components/StoreCard.tsx
git commit -m "feat: redesign StoreCard with hover lift, orange verified badge"
```

---

### Task 6: Update SizeTable — orange selected state

**Files:**
- Modify: `services/frontend/components/SizeTable.tsx`

- [ ] **Step 1: Replace SizeTable.tsx**

```tsx
"use client";
import type { SizeStock } from "@/lib/api";

interface SizeTableProps {
  sizes: SizeStock[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export function SizeTable({ sizes, selected, onSelect }: SizeTableProps) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm font-medium">Seleccioná tu talle</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const outOfStock = s.stock === 0;
          const isSelected = selected === s.size;
          return (
            <button
              key={s.size}
              onClick={() => !outOfStock && onSelect(s.size)}
              disabled={outOfStock}
              className={`
                px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150
                ${outOfStock
                  ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                  : isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,107,53,0.4)]"
                  : "border-border text-foreground hover:border-primary/60 hover:text-primary"
                }
              `}
            >
              {s.size}
              {!outOfStock && (
                <span className="text-xs ml-1 opacity-50">({s.stock})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add components/SizeTable.tsx
git commit -m "feat: update SizeTable with orange selected state and glow"
```

---

### Task 7: Update CartItem

**Files:**
- Modify: `services/frontend/components/CartItem.tsx`

- [ ] **Step 1: Replace CartItem.tsx**

```tsx
"use client";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem as CartItemType } from "@/lib/cart-store";

export function CartItem({ item }: { item: CartItemType }) {
  const removeItem = useCart((s) => s.removeItem);

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(item.product.price * item.quantity);

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <div className="w-20 h-24 relative bg-muted rounded-lg flex-shrink-0 overflow-hidden">
        {item.product.image_url ? (
          <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Sin foto
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-medium text-foreground">{item.product.name}</p>
        <p className="text-muted-foreground text-sm">Talle: {item.size}</p>
        <p className="text-muted-foreground text-sm">Cantidad: {item.quantity}</p>
        <p className="text-primary font-bold">{formattedPrice}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeItem(item.product.id, item.size)}
        className="text-muted-foreground hover:text-destructive flex-shrink-0"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add components/CartItem.tsx
git commit -m "feat: update CartItem with design tokens and orange price"
```

---

### Task 8: Update TrackingStatus

**Files:**
- Modify: `services/frontend/components/TrackingStatus.tsx`

- [ ] **Step 1: Replace TrackingStatus.tsx**

```tsx
import type { TrackingStep } from "@/lib/api";
import { CheckCircle, Circle } from "lucide-react";

export function TrackingStatus({ steps, message }: { steps: TrackingStep[]; message: string }) {
  return (
    <div className="space-y-4">
      <p className="text-foreground font-medium">{message}</p>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.status} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle size={20} className="text-primary flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-muted-foreground/30 flex-shrink-0" />
            )}
            <span className={step.completed ? "text-foreground" : "text-muted-foreground/50"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add components/TrackingStatus.tsx
git commit -m "feat: update TrackingStatus with orange completed steps"
```

---

### Task 9: Redesign Home page

**Files:**
- Modify: `services/frontend/app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { api } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [stores, products] = await Promise.all([
    api.stores.list(),
    api.products.list(),
  ]);

  const featuredStores = stores.filter((s) => s.is_featured);
  const latestProducts = products.slice(0, 8);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
      {/* Hero */}
      <section className="relative text-center space-y-6 py-20 overflow-hidden">
        {/* Radial glow behind text */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,53,0.12) 0%, transparent 70%)",
          }}
        />
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Ropa de{" "}
          <span
            className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
          >
            Avellaneda
          </span>
          <br />
          a tu puerta
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Los mejores locales de Avellaneda, sin filas, sin colectivo, sin perder el día.
          Elegí, pagá y recibilo hoy.
        </p>
        <Link href="/stores">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl shadow-[0_0_24px_rgba(255,107,53,0.35)] transition-all hover:shadow-[0_0_32px_rgba(255,107,53,0.5)]"
          >
            Ver locales
          </Button>
        </Link>
      </section>

      {/* Featured stores */}
      {featuredStores.length > 0 && (
        <section className="space-y-5">
          <h2
            className="text-2xl font-bold border-l-4 border-primary pl-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Locales destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Latest products */}
      {latestProducts.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold border-l-4 border-primary pl-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Últimas novedades
            </h2>
            <Link href="/stores" className="text-primary text-sm hover:underline">
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add app/page.tsx
git commit -m "feat: redesign home page — display hero with glow, orange gradient heading, section titles"
```

---

### Task 10: Update Stores page

**Files:**
- Modify: `services/frontend/app/stores/page.tsx`

- [ ] **Step 1: Replace app/stores/page.tsx**

```tsx
export const dynamic = "force-dynamic";

import { api } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

export default async function StoresPage() {
  const stores = await api.stores.list();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Locales en Avellaneda
        </h1>
        {stores.length > 0 && (
          <p className="text-muted-foreground text-sm">{stores.length} locales disponibles</p>
        )}
      </div>
      {stores.length === 0 ? (
        <p className="text-muted-foreground">No hay locales disponibles todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add app/stores/page.tsx
git commit -m "feat: update stores page with heading font and store count"
```

---

### Task 11: Update Product page

**Files:**
- Modify: `services/frontend/app/products/[id]/page.tsx`

- [ ] **Step 1: Replace app/products/[id]/page.tsx**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { api, type Product } from "@/lib/api";
import { SizeTable } from "@/components/SizeTable";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { ShoppingBag } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    api.products.get(Number(id)).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="aspect-[4/5] bg-muted rounded max-w-sm" />
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-[4/5] relative bg-muted rounded-2xl overflow-hidden">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sin foto
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm capitalize tracking-widest uppercase text-xs">
              {product.category}
            </p>
            <h1
              className="text-3xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {product.name}
            </h1>
            <p className="text-4xl font-extrabold text-primary">{formattedPrice}</p>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <SizeTable
            sizes={product.sizes}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_28px_rgba(255,107,53,0.45)] transition-all disabled:opacity-40 disabled:shadow-none"
          >
            <ShoppingBag size={18} className="mr-2" />
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-border text-foreground hover:bg-muted rounded-xl"
            onClick={() => router.push("/cart")}
          >
            Ver carrito
          </Button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add app/products/[id]/page.tsx
git commit -m "feat: redesign product page — larger image, display price, orange CTA with glow"
```

---

### Task 12: Update Cart page

**Files:**
- Modify: `services/frontend/app/cart/page.tsx`

- [ ] **Step 1: Replace app/cart/page.tsx**

```tsx
"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { CartItem } from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, total } = useCart();

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total());

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag size={48} className="text-muted-foreground/30 mx-auto" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Tu carrito está vacío
        </h1>
        <p className="text-muted-foreground">Explorá los locales y encontrá lo que buscás.</p>
        <Link href="/stores">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
            Ver locales
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        Tu carrito
      </h1>
      <div>
        {items.map((item) => (
          <CartItem key={`${item.product.id}-${item.size}`} item={item} />
        ))}
      </div>
      <div className="border-t border-border pt-4 flex items-center justify-between">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-primary">{formattedTotal}</span>
      </div>
      <Link href="/checkout">
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_28px_rgba(255,107,53,0.45)] transition-all"
        >
          Ir a pagar
        </Button>
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add app/cart/page.tsx
git commit -m "feat: update cart page with orange total and CTA glow"
```

---

### Task 13: Update Checkout page

**Files:**
- Modify: `services/frontend/app/checkout/page.tsx`

- [ ] **Step 1: Replace app/checkout/page.tsx**

```tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/lib/cart-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const DEMO_USER_ID = 1;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total());

  const handleCheckout = async () => {
    if (!address.trim()) {
      setError("Ingresá tu dirección de entrega");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const order = await api.orders.create({
        user_id: DEMO_USER_ID,
        delivery_address: address,
        items: items.map((i) => ({
          product_id: i.product.id,
          size: i.size,
          quantity: i.quantity,
          unit_price: i.product.price,
        })),
      });

      const { client_secret } = await api.payments.createIntent(order.id);

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not loaded");

      const { error: stripeError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: { token: "tok_visa" },
        },
      });

      if (stripeError) throw new Error(stripeError.message);

      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        Checkout
      </h1>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-foreground">Dirección de entrega</Label>
        <Input
          id="address"
          placeholder="Ej: Corrientes 1234, CABA"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-background border-border focus-visible:ring-primary"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <p className="text-muted-foreground text-sm">{items.length} producto(s)</p>
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-primary">{formattedTotal}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Stripe cobra ~2.9% + $0.30 adicional por transacción
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        size="lg"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_28px_rgba(255,107,53,0.45)] transition-all disabled:opacity-40 disabled:shadow-none"
      >
        {loading ? "Procesando..." : "Confirmar y pagar"}
      </Button>

      <p className="text-muted-foreground text-xs text-center">
        Pago 100% seguro vía Stripe. Modo test activo.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add app/checkout/page.tsx
git commit -m "feat: update checkout page with design tokens and orange CTA"
```

---

### Task 14: Update Order page

**Files:**
- Modify: `services/frontend/app/orders/[id]/page.tsx`

- [ ] **Step 1: Replace app/orders/[id]/page.tsx**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type TrackingResponse } from "@/lib/api";
import { TrackingStatus } from "@/components/TrackingStatus";
import { CheckCircle } from "lucide-react";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);

  useEffect(() => {
    const load = () => api.delivery.track(Number(id)).then(setTracking);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!tracking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle size={52} className="text-primary mx-auto" />
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ¡Pedido confirmado!
        </h1>
        <p className="text-muted-foreground">Orden #{tracking.order_id}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <TrackingStatus steps={tracking.steps} message={tracking.message} />
      </div>

      <p className="text-muted-foreground text-xs text-center">
        El estado se actualiza automáticamente cada 5 segundos.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd services/frontend && git add app/orders/[id]/page.tsx
git commit -m "feat: update order page with orange confirmation icon and card border"
```

---

### Task 15: Verify build passes

- [ ] **Step 1: Run TypeScript check**

```bash
cd services/frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run Next.js build**

```bash
cd services/frontend && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` or similar, no TypeScript errors.

- [ ] **Step 3: Commit final verification**

```bash
cd services/frontend && git add -A
git commit -m "chore: verify visual redesign builds cleanly" --allow-empty
```

---

## Summary

| Task | Files Changed | Commit |
|---|---|---|
| 1 | `package.json`, `layout.tsx` | Install next-themes, add font |
| 2 | `globals.css` | New design tokens |
| 3 | `components/Navbar.tsx` (new) | Glassmorphism navbar |
| 4 | `components/ProductCard.tsx` | Hover lift, orange accent |
| 5 | `components/StoreCard.tsx` | Hover lift, orange badge |
| 6 | `components/SizeTable.tsx` | Orange selected state |
| 7 | `components/CartItem.tsx` | Design tokens |
| 8 | `components/TrackingStatus.tsx` | Orange steps |
| 9 | `app/page.tsx` | Hero redesign |
| 10 | `app/stores/page.tsx` | Heading + store count |
| 11 | `app/products/[id]/page.tsx` | Full product page redesign |
| 12 | `app/cart/page.tsx` | Orange CTA |
| 13 | `app/checkout/page.tsx` | Design tokens |
| 14 | `app/orders/[id]/page.tsx` | Orange confirmation |
| 15 | — | Build verification |
