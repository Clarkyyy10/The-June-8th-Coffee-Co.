# The June 9th Coffee Co. — Management System

A premium, production-grade Coffee Shop Management System: POS, inventory, orders,
customers, employees, analytics, and reports — beautifully unified. Built to the
standards defined in [`../System_Rule.md`](../System_Rule.md).

## Tech Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** with a custom coffee-inspired design system
- **Framer Motion** for premium animations
- **Radix UI** primitives (Shadcn-style components) · **Lucide** icons
- **Zustand** (client state) · **TanStack Query** (server state)
- **React Hook Form** + **Zod** (forms & validation)
- **Recharts** (analytics) · **React Hot Toast** (notifications) · **cmdk** (command palette)
- **Prisma** + **PostgreSQL** · **Auth.js / NextAuth v5** (RBAC)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env      # then fill in DATABASE_URL and AUTH_SECRET

# 3. Set up the database (requires a running PostgreSQL)
npm run db:push
npm run db:seed           # seeds staff, catalog, and settings

# 4. Run the dev server
npm run dev               # http://localhost:3000
```

Demo login (works immediately, no database required):

| Email | Role |
|-------|------|
| `maria@june9.co` | Owner |
| `maya@june9.co` | Manager |
| `leo@june9.co` | Cashier |
| `ivy@june9.co` | Barista |
| `kenji@june9.co` | Kitchen |

Password for all demo accounts: **coffee123**

> The UI runs fully on mock data (`src/lib/mock-data.ts`) without a database, so
> you can explore every screen immediately. A lightweight cookie-based demo auth
> (`/api/session` + `middleware.ts`) protects all routes and powers login/logout.
> Swap in NextAuth + Prisma (`src/lib/auth.ts`) when your database is ready.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint the codebase |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push schema to the database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├─ app/
│  ├─ (auth)/login/            # Authentication screens
│  ├─ (dashboard)/             # Authenticated app shell + feature routes
│  │  ├─ dashboard/  pos/  orders/  products/  menu-builder/
│  │  ├─ inventory/  customers/  employees/  analytics/  reports/  settings/
│  │  └─ layout.tsx            # AppShell (sidebar + topbar + command palette)
│  ├─ api/auth/[...nextauth]/  # NextAuth route handler
│  ├─ globals.css              # Design tokens & theme
│  └─ layout.tsx               # Root layout, fonts, providers
├─ components/
│  ├─ ui/                      # Reusable primitives (Button, Card, Badge, Input…)
│  ├─ layout/                  # Sidebar, Topbar, AppShell, CommandPalette, PageHeader
│  └─ providers.tsx            # Theme + Query + Toaster
├─ features/                   # Feature-based modules (dashboard, products, pos, analytics)
├─ lib/                        # utils, types, mock-data, navigation, prisma, auth, rbac
└─ types/                      # Ambient type augmentation
prisma/
├─ schema.prisma              # Full data model / ERD
└─ seed.ts                    # Seed script
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full architecture, data model,
workflows, and design-system reference.
