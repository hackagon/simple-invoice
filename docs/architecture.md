# Architecture

## Overview

SimpleInvoice is a full-stack invoice management application organised as a
**monorepo** with two independently deployable apps and a PostgreSQL database,
orchestrated by Docker Compose.

```
┌──────────────┐        HTTPS / JSON        ┌──────────────┐        TypeORM        ┌────────────┐
│   Frontend   │  ───────────────────────►  │   Backend    │  ──────────────────►  │ PostgreSQL │
│ React + Vite │   Bearer JWT in header     │   NestJS     │   pg driver           │            │
│  (SPA, :5173 │  ◄───────────────────────  │  REST API    │  ◄──────────────────  │            │
│   / :8080)   │      { data, paging }      │   (:3000)    │                       │            │
└──────────────┘                            └──────────────┘                       └────────────┘
```

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, React Hook Form |
| Backend  | NestJS, TypeScript, TypeORM, Passport JWT, class-validator, Swagger |
| Database | PostgreSQL 16 |
| Tooling  | pnpm, Jest (backend), Vitest + Testing Library (frontend), Docker, GitHub Actions |

## Repository layout

```
simple-invoice/
├── frontend/                   # React SPA
│   └── src/
│       ├── auth/               # Auth context + protected routes
│       ├── theme/              # Light/dark ThemeProvider
│       ├── components/         # Folder-per-component (Layout/, UserMenu/, …)
│       ├── pages/              # Folder-per-page (index.tsx + __tests__/)
│       ├── hooks/              # useDebounce
│       ├── lib/                # axios client, API calls, formatting
│       └── types/              # Shared TypeScript types
├── backend/                    # NestJS REST API
│   └── src/
│       ├── auth/               # JWT login, strategy, guard
│       ├── models/
│       │   ├── invoices/       # Controller, service, DTOs, enums, calculations
│       │   └── users/          # User lookup service
│       ├── common/             # Exception filter, decorators, validators
│       ├── database/
│       │   ├── entities/       # TypeORM entities
│       │   ├── migrations/     # TypeORM migrations (up/down)
│       │   ├── data-source.ts  # DataSource for the migration CLI
│       │   └── seed/           # Seed script + mock data
│       └── config/             # Typed env configuration
├── scripts/                    # Dev convenience scripts
├── docs/                       # This documentation
├── docker-compose.yml          # Production stack
└── docker-compose.dev.yml      # Dev override (hot reload)
```

## Backend architecture

A standard NestJS layered/modular design:

- **Controllers** handle HTTP, validation (via global `ValidationPipe`), and
  Swagger metadata. They delegate to services.
- **Services** hold business logic (totals, status derivation, querying).
- **Entities** are TypeORM models mapped to tables.
- **DTOs** define and validate request/response shapes with `class-validator`.
- **Common** holds cross-cutting concerns: a global exception filter for
  consistent error responses, the `@CurrentUser()` decorator, custom validators,
  and a decimal transformer.

### Request flow (protected route)

```
HTTP request
  → JwtAuthGuard (verifies Bearer token, loads user via JwtStrategy)
  → ValidationPipe (validates/transforms DTO)
  → Controller → Service → TypeORM repository → PostgreSQL
  → Service maps entity → response DTO (derives Overdue at read time)
  → AllExceptionsFilter normalises any error
HTTP response
```

### Key backend decisions

- **Server-side amounts.** All monetary totals are computed by the backend
  (`calculateInvoiceTotals`); the frontend never calculates them. See
  [data-model.md](./data-model.md#computed-amounts).
- **Derived `Overdue` status.** Only `Draft | Pending | Paid` are persisted.
  `Overdue` is computed at read time and never written to the database.
- **Embedded customer.** Customer fields live on the `invoices` table for
  simplicity; line items are a separate table to support multiple items later.
- **Unique invoice number** enforced by a unique index at the database level.

## Frontend architecture

- **Folder-per-component** — each component/page is a folder with `index.tsx`
  and co-located `__tests__/`.
- **Providers** (in `main.tsx`): `ThemeProvider` → `QueryClientProvider` →
  `BrowserRouter` → `AuthProvider` → `ToastProvider`.
- **Data fetching** via TanStack Query (`keepPreviousData` for smooth
  pagination); the axios client attaches the JWT and redirects to `/login` on
  `401`.
- **Routing** — public `/login`; everything else is behind `ProtectedRoute`
  inside the `Layout` shell.
- **Theme** — light/dark via `data-theme` on `<html>`, system-default,
  persisted to `localStorage`, with a no-flash inline script.

## Authentication & authorization

- `POST /auth/login` verifies credentials (bcrypt) and returns a signed **JWT**.
- The token is stored client-side (`localStorage`) and sent as
  `Authorization: Bearer <token>`.
- A **JWT guard** protects every `/invoices` route and `/auth/me`. Unauthenticated
  requests get `401`; the client clears the token and redirects to login.
- Token lifetime is configurable via `JWT_EXPIRES_IN` (default **3600s**).

## Schema management

Two modes, selected by environment variables:

| Mode | Env | Used by |
|------|-----|---------|
| Auto-sync | `DB_SYNCHRONIZE=true` | local dev (default), fastest iteration |
| Migrations | `DB_SYNCHRONIZE=false` + `DB_RUN_MIGRATIONS=true` | Docker / production-style |

Migrations live in `backend/src/database/migrations` and are applied on boot (or
manually via the `scripts/migration-*.sh` helpers).

## Data seeding

`pnpm run seed` populates a reviewer user and ~32 sample invoices with a diverse
spread of statuses, currencies, dates, and amounts (including past-due ones so
`Overdue` is demonstrable). In Docker it runs on first boot and skips if the
database already has data.

## Containerization

- **Production:** `docker compose up --build` → nginx-served SPA (`:8080`),
  compiled NestJS API (`:3000`), Postgres (`:5433`). Migrations + seed run on boot.
- **Development (hot reload):**
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` → Vite HMR
  (`:5173`) and NestJS watch mode, with source bind-mounted.

## Continuous integration

GitHub Actions runs on push/PR to `main`, path-filtered per app:

- **Backend CI** — build, unit tests, migration up/down validation, and e2e
  against a Postgres service container.
- **Frontend CI** — type-check + build and Vitest unit tests.

## See also

- [API endpoints](./api-endpoints.md)
- [Data model](./data-model.md)
- Interactive API docs (Swagger) at `http://localhost:3000/api/docs` when running.
