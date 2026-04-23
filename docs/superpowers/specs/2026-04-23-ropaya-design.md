# Ropaya — Design Spec
**Date:** 2026-04-23  
**Status:** Approved

---

## 1. Problema y propuesta de valor

Avellaneda es uno de los centros de ropa más grandes y baratos de Argentina, pero ir en persona es incómodo: siempre está lleno, no se puede probar la ropa, y consume mucho tiempo. Ropaya permite comprar ropa de los locales de Avellaneda desde la app, con entrega rápida el mismo día en el AMBA, eliminando la fricción de ir en persona sin cambiar la experiencia de compra (ya que de todos modos no se prueba la ropa en los locales).

**Diferenciador clave:** tabla de talles interactiva por producto para generar confianza y reducir el miedo al error de talle — la principal barrera para comprar ropa online.

---

## 2. Actores

| Actor | Descripción |
|-------|-------------|
| **Cliente** | Comprador final. Busca, filtra y compra ropa desde web o mobile. Principalmente AMBA. |
| **Local (vendor)** | Dueño de local físico en Avellaneda. Carga productos, talles, stock y configura su política de devoluciones. |
| **Admin** | El dueño de la plataforma. Aprueba locales manualmente, configura featured listings, ve métricas. |

---

## 3. Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend web | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| App mobile | Expo (React Native) — comparte hooks y lógica con la web |
| Backend | FastAPI (Python) + SQLAlchemy |
| Base de datos | PostgreSQL |
| Cache | Redis (catálogo, sesiones) |
| Pagos | Stripe + Stripe Connect (split automático de comisiones) |
| Logística | Rappi Envíos (mockeado en POC, integrado antes del lanzamiento) |
| Infraestructura | Docker Compose (local), containers en producción |

---

## 4. Módulos principales

### 4.1 Catálogo
- Todos los locales son de Avellaneda — no hay filtro por zona
- Listado de locales con filtros: categoría, precio, featured
- Listado de productos con filtros: tipo de prenda, talle, precio, color
- Búsqueda full-text por prenda, local, color, talle
- Ficha de local: nombre, descripción, dirección física en Avellaneda, mapa (Google Maps embed), política de devoluciones, badge "Local verificado"
- Ficha de producto: galería de fotos, descripción, tabla de talles interactiva, stock por talle, precio
- Badge "Featured" para locales con suscripción activa

### 4.2 Vendor dashboard (locales)
- Registro iniciado por el admin (onboarding manual — el dueño de la plataforma visita el local y lo da de alta)
- Carga de productos: fotos, descripción, precio, stock por talle, categoría
- Tabla de talles configurable por producto
- Política de devoluciones: acepta sí/no; si sí, campo de contacto directo
- Vista de órdenes recibidas con estados
- Cuenta Stripe Connect para recibir pagos automáticamente

### 4.3 Carrito y pagos
- Carrito multi-local (productos de varios locales en un solo checkout)
- Pago con Stripe — split automático: local recibe precio menos comisión de plataforma (2.5%)
- Stripe cobra su fee por separado (~2.9% + $0.30 por transacción)
- Historial de órdenes del cliente con estados

### 4.4 Logística
- Integración con Rappi Envíos (acuerdo comercial a gestionar antes del lanzamiento)
- Entrega same-day para AMBA
- Envíos al interior del país con correo tradicional (fase 2, post-lanzamiento)
- Tracking en tiempo real: pendiente → preparando → en camino → entregado
- En POC: Rappi completamente mockeado con estados simulados

### 4.5 Admin panel
- Aprobación y gestión de locales
- Configuración de featured listings y suscripciones
- Métricas: ventas, comisiones generadas, locales activos, órdenes por estado

---

## 5. Flujo de compra (cliente)

```
Home
  → Explorar (grid de productos con filtros)
    → Ficha de producto (fotos, talles, stock, política de devoluciones)
      → Carrito (resumen, desglose de envío)
        → Checkout (datos de entrega + pago Stripe)
          → Confirmación (número de orden + tracking en tiempo real)
```

---

## 6. UX y diseño visual

- Estética moderna y urbana orientada a moda (referencia: Vinted, Depop — más limpio)
- Mobile-first — mayoría de usuarios entran desde celular
- Dark mode disponible
- Fotos de productos grandes como protagonistas
- Elementos de confianza visibles: tabla de talles, dirección física + mapa, badge verificado, reviews por local

---

## 7. Monetización

### Capa 1 — Comisión por venta
- 2.5% sobre cada transacción (rango 2–3%, ajustable)
- Split automático via Stripe Connect — el local recibe su parte directo, sin que la plataforma toque el dinero

### Capa 2 — Featured listings
- **Featured Basic:** el local aparece primero en su categoría
- **Featured Premium:** banner en el home + primero en búsquedas relevantes
- Suscripción mensual fija (precio a definir en negociación con locales)

### Capa 3 — Futuro (post-lanzamiento)
- Sponsored products dentro del catálogo
- Envíos al interior como servicio premium

---

## 8. Testing

### POC
- Tests unitarios para lógica de negocio: cálculo de comisiones, validación de talles, estados de órdenes
- Tests de integración: flujo completo de compra, webhooks de Stripe, API de locales
- E2E con Playwright: happy path cliente de punta a punta
- Cobertura mínima: 80%
- Rappi y Stripe en modo mock/test

### CI
- GitHub Actions: tests corren en cada push
- No se mergea con tests rotos

---

## 9. Fases de desarrollo

### Fase 1 — POC
- Catálogo básico (locales + productos)
- Flujo de compra completo con Stripe test mode
- Logística mockeada
- Web responsive (Next.js)
- Tests desde el día 1

### Fase 2 — v0
- Vendor dashboard completo
- App mobile (Expo)
- Integración real con Rappi Envíos
- Admin panel
- Docker Compose

### Fase 3 — Lanzamiento
- Featured listings y suscripciones
- Reviews
- Envíos al interior
- Métricas y analytics

---

## 10. Estructura de repositorio

```
ropaya/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── services/
    ├── api/          # FastAPI
    ├── frontend/     # Next.js
    ├── mobile/       # Expo
    └── db/           # PostgreSQL + migraciones
```
