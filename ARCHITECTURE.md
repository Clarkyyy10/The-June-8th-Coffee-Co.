# Architecture — The June 9th Coffee Co.

This document covers the deliverables required by `System_Rule.md` §10.

## 1. Software Architecture

A modular, feature-based Next.js App Router application following clean
architecture and SOLID principles.

```
┌───────────────────────────────────────────────────────┐
│                    Presentation                        │
│  App Router routes · Server & Client Components         │
│  UI primitives (components/ui) · Feature modules        │
├───────────────────────────────────────────────────────┤
│                  State & Data Access                    │
│  Zustand (client) · TanStack Query (server cache)       │
│  Zod schemas · React Hook Form                          │
├───────────────────────────────────────────────────────┤
│                    Domain / Services                    │
│  lib/rbac · lib/auth · lib/utils · services (Prisma)    │
├───────────────────────────────────────────────────────┤
│                    Persistence                          │
│  Prisma ORM → PostgreSQL                                │
└───────────────────────────────────────────────────────┘
```

- **Server Components by default**; client components only where interactivity is
  required (POS, charts, forms, animations).
- **Feature-based folders** under `src/features/*` keep domain logic cohesive.
- **Design tokens** centralized in `globals.css`; no hardcoded colors in components.

## 2. Database Schema (Prisma) & 3. ERD

Full schema in `prisma/schema.prisma`. Core entities and relationships:

```
User 1─* Order *─1 Customer
User 1─* Shift
Category 1─* Subcategory 1─* Product *─1 Supplier
Product 1─* RecipeItem *─1 Ingredient 1─* StockMovement
Order 1─* OrderItem *─1 Product
Order *─1 Discount
Setting (singleton)   ActivityLog   Account/Session/VerificationToken (Auth.js)
```

Key enums: `Role`, `ProductStatus`, `Temperature`, `OrderStatus`, `OrderType`,
`PaymentMethod`, `PaymentStatus`, `DiscountType`, `StockMovementType`.

## 4. User Flows

- **Cashier**: Login → POS → build cart → apply discount → select payment →
  charge → order enters queue.
- **Barista/Kitchen**: Login → Orders queue → advance status
  (Pending → Preparing → Ready → Completed).
- **Owner/Manager**: Login → Dashboard → manage products, inventory, staff,
  view analytics, export reports, configure settings.

## 5. Information Architecture / Route Structure

```
/login                      Auth
/dashboard                  KPIs, trends, activity, goals
/pos                        Point of sale
/orders                     Order management + statuses
/products                   Catalog (grid, filters, CRUD)
/menu-builder               Drag-and-drop menu + live preview
/inventory                  Ingredients, stock, alerts
/customers                  Loyalty & profiles
/employees                  Staff, roles, performance
/analytics                  Charts & time filters
/reports                    Exportable reports (PDF/Excel/CSV)
/settings                   Business, appearance, notifications, security, backup
/api/auth/[...nextauth]     Auth endpoints
```

## 6. Design System

Defined in `src/app/globals.css` via Tailwind v4 `@theme`.

- **Colors**: cream, latte, caramel, mocha, coffee, espresso + semantic
  (primary, secondary, accent, success, warning, danger, info) and surfaces.
- **Radius / Shadows**: soft, card, float, glow. **Fonts**: Inter (sans),
  Fraunces (display), JetBrains Mono. **Animations**: smooth & spring easings.
- **Dark mode**: deep-espresso palette via `.dark` class (`next-themes`).
- Utilities: `.glass`, `.bg-coffee-gradient`, `.bg-cream-radial`,
  `.text-gradient-coffee`, `.skeleton`, floating-bean animations.

## 7. Component Library

`components/ui`: Button, Card, Badge, Input, AnimatedCounter.
`components/layout`: Sidebar, Topbar, AppShell, CommandPalette, ThemeToggle,
PageHeader. Feature components: KpiCard, charts, ProductCard, ActivityFeed.

## 8–9. State Management & API

- **Client state**: Zustand (`features/pos/cart-store.ts`).
- **Server cache**: TanStack Query via `Providers`.
- **API**: Next.js Route Handlers + Server Actions (Prisma-backed) — the mock
  data layer (`lib/mock-data.ts`) mirrors the schema for a DB-free demo.

## 10. Authentication & Authorization

- **NextAuth v5** (`lib/auth.ts`) with Credentials provider, JWT sessions,
  Prisma adapter, bcrypt password hashing — the production auth path.
- **Demo auth** (`lib/demo-auth.ts`, `app/api/session/route.ts`) — a
  cookie-based, database-free login used for the live demo. Sets an httpOnly
  session cookie on login and clears it on logout.
- **Route protection** (`middleware.ts`) — redirects unauthenticated users to
  `/login` (with a `from` return path) and authenticated users away from
  `/login`. The dashboard layout also re-validates the session server-side.
- **RBAC** (`lib/rbac.ts`): permission matrix + `can(role, permission)` and
  role-based landing routes. Roles: Owner, Manager, Cashier, Barista, Kitchen.

## 11–13. Core Workflows

- **POS**: tap product → cart store → subtotal/discount/tax/total → payment →
  checkout toast + queue.
- **Order processing**: status pipeline with filter/search; edit/refund/cancel.
- **Inventory**: recipe-driven automatic deduction (`RecipeItem` → `StockMovement`),
  min/max thresholds, low-stock alerts, restock reminders.

## 14. Animation Guidelines

Framer Motion for page/element entrances, layout transitions (sidebar active
pill, cart lines, reorder), micro-interactions (hover lift, tap scale),
animated counters, and chart reveals. Honors `prefers-reduced-motion`.

## 15. Accessibility Checklist

Semantic HTML, keyboard-navigable command palette and controls, focus-visible
rings, ARIA labels on icon buttons, color contrast targeting WCAG AA, and a
global reduced-motion fallback.

## 16. Testing Strategy

- Unit: utilities & RBAC (Vitest recommended).
- Component: Testing Library for UI primitives.
- E2E: Playwright for POS → checkout and auth flows.
- Type safety: `tsc --noEmit` + ESLint in CI.

## 17. Deployment Plan

- **Host**: Vercel (Next.js). **DB**: managed PostgreSQL (Neon/Supabase/RDS).
- Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, image provider keys.
- Pipeline: `prisma migrate deploy` → `next build` → deploy.

## 18. Scalability & Performance

Server Components, route-level code splitting, `optimizePackageImports` for
lucide/recharts/framer-motion, image optimization, Query caching, and indexed
Prisma models (`Order.status`, `Order.createdAt`, `Product.category`, etc.).
