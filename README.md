# SimpleInvoice

A full-stack invoice management application built for the 101 Digital Full-Stack
Engineer assessment. It provides secure authentication, a searchable/filterable/
sortable paginated invoice list, an invoice detail view, and invoice creation with
all monetary totals calculated on the server.

- **Frontend:** React 18 + TypeScript (Vite), React Router, TanStack Query, React Hook Form
- **Backend:** NestJS + TypeScript, TypeORM, PostgreSQL, Passport JWT, Swagger
- **Tooling:** Jest (backend unit + e2e), Vitest + Testing Library (frontend), Docker Compose

---

## Table of contents

1. [Architecture](#architecture)
2. [Quick start (Docker)](#quick-start-docker)
3. [Running locally without Docker](#running-locally-without-docker)
4. [Default login](#default-login)
5. [Database seeding](#database-seeding)
6. [API & Swagger](#api--swagger)
7. [Testing](#testing)
8. [Environment configuration](#environment-configuration)
9. [Assumptions & design decisions](#assumptions--design-decisions)
10. [Known limitations](#known-limitations)

---

## Architecture

This is a **monorepo** with two independently deployable applications plus a
Docker Compose file that orchestrates them with a PostgreSQL database.

```
simple-invoice/                 (repository root)
├── frontend/                   # React + TypeScript SPA (Vite)
│   └── src/
│       ├── auth/               # Auth context + protected routes
│       ├── components/         # Layout, Toast, Pagination, StatusBadge
│       ├── hooks/              # useDebounce
│       ├── lib/                # axios client, API calls, formatting
│       ├── pages/              # Login, List, Detail, Create
│       └── types/              # Shared TypeScript types
├── backend/                    # NestJS REST API
│   └── src/
│       ├── auth/               # JWT login, strategy, guard
│       ├── models/
│       │   ├── invoices/       # Controller, service, DTOs, enums, business logic
│       │   └── users/          # User lookup service
│       ├── common/             # Exception filter, decorators, validators
│       ├── database/
│       │   ├── entities/       # TypeORM entities (User, Invoice, InvoiceItem)
│       │   ├── migrations/     # TypeORM migrations (up / down)
│       │   ├── data-source.ts  # DataSource for the migration CLI
│       │   └── seed/           # Seed script + mock data generator
│       └── config/             # Typed env configuration
├── docker-compose.yml          # db + backend + frontend, one command
├── .env.example                # Root compose configuration
└── README.md
```

**Request flow:** the React SPA stores the JWT in `localStorage` and attaches it
as a `Bearer` token via an axios interceptor. Every `/invoices` route and
`/auth/me` is protected by a NestJS JWT guard. On a `401` the client clears the
token and redirects to the login screen. All amounts and the derived `Overdue`
status are computed by the backend; the frontend only renders them.

Why these choices: **monorepo** keeps the two apps versioned and reviewed
together with a single clone; **TanStack Query** gives cache-aware server-state
with `keepPreviousData` for smooth pagination; **TypeORM + Postgres** matches the
assessment's recommended stack with first-class NestJS integration.

---

## Quick start (Docker)

Requires Docker with the Compose plugin. From the repository root:

```bash
docker compose up --build
```

This single command starts three services and **seeds the database on first
boot**:

| Service  | URL                              | Notes                                  |
|----------|----------------------------------|----------------------------------------|
| Frontend | http://localhost:8080            | nginx serving the built SPA            |
| Backend  | http://localhost:3000            | NestJS REST API                        |
| Swagger  | http://localhost:3000/api/docs   | Interactive API docs                   |
| Postgres | localhost:5433 (host) → 5432     | Published on 5433 to avoid clashes     |

Open **http://localhost:8080** and sign in with the [default login](#default-login).

To stop and remove everything (including the database volume):

```bash
docker compose down -v
```

> Seeding on boot is controlled by `RUN_SEED_ON_BOOT` (default `true`) and will
> **not** overwrite a database that already contains invoices, so your created
> invoices survive a restart. To force a fresh dataset, run `docker compose down -v`
> first, or reseed manually (see [Database seeding](#database-seeding)).

---

## Running locally without Docker

### Prerequisites
- Node.js 22+
- [pnpm](https://pnpm.io) 9+ — if you don't have it: `corepack enable pnpm`
  (the repo pins the exact version via each package's `packageManager` field)
- A running PostgreSQL 14+ instance and an empty database (e.g. `simple_invoice`)

### 1. Backend

```bash
cd backend
cp .env.example .env          # edit DB_* values to match your Postgres
pnpm install
pnpm run seed                 # create the reviewer user + sample invoices
pnpm run start:dev            # API on http://localhost:3000
```

The schema is created automatically on boot (`DB_SYNCHRONIZE=true`).

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_BASE_URL defaults to http://localhost:3000
pnpm install
pnpm run dev                  # SPA on http://localhost:5173
```

Open **http://localhost:5173** and sign in.

> The backend's default `CORS_ORIGIN` already allows both `http://localhost:5173`
> (Vite dev) and `http://localhost:8080` (Docker frontend).

---

## Default login

Seeded into the database and used for reviewer access:

| Email                  | Password       |
|------------------------|----------------|
| `admin@101digital.io`  | `Password123!` |

These are configurable via `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` before seeding.

---

## Database seeding

The seed script creates the reviewer account and **32 sample invoices** (within
the recommended 20–50 range) with a deterministic but diverse spread of statuses
(`Draft`, `Pending`, `Paid`), currencies, customers, dates, and amounts — including
several with past due dates so the derived **Overdue** status is demonstrable.
`Overdue` is **never stored**; it is derived at read time.

```bash
# Local (ts-node):
cd backend && pnpm run seed

# Inside the running backend container (compiled):
docker compose exec backend pnpm run seed:prod
```

Running `pnpm run seed` directly always resets and reseeds the invoice tables.
When `DB_SYNCHRONIZE=false`, the seed script applies any pending migrations first
so the schema exists before seeding.

---

## Database migrations

The project supports two schema-management modes (selected via env):

- **`DB_SYNCHRONIZE=true`** (local dev default) — TypeORM auto-syncs the schema
  from entities on boot. No migrations needed; fastest for iteration.
- **`DB_SYNCHRONIZE=false` + `DB_RUN_MIGRATIONS=true`** — migrations are the
  source of truth. This is what **Docker Compose uses** (production-style), and
  the API applies pending migrations on boot.

Migrations live in [`backend/src/database/migrations/`](backend/src/database/migrations);
the CLI loads [`backend/src/database/data-source.ts`](backend/src/database/data-source.ts).
The initial migration (`InitialSchema`) creates the `users`, `invoices`, and
`invoice_items` tables, the status enum, the unique invoice-number index, and the
FK — with a matching `down()` that fully reverts it.

From `backend/` (uses `ts-node`, no build needed):

```bash
pnpm migration:run              # apply pending migrations (up)
pnpm migration:revert           # roll back the last migration (down)
pnpm migration:show             # list applied / pending migrations
pnpm migration:generate src/database/migrations/MyChange   # diff entities -> new migration
pnpm migration:create   src/database/migrations/MyChange   # empty migration scaffold
```

Against a compiled build (e.g. inside the container): `pnpm migration:run:prod`
and `pnpm migration:revert:prod` (these run the `.js` migrations from `dist/`).

> Migrations are tracked in the `migrations_history` table. `migration:run` is
> idempotent — already-applied migrations are skipped.

---

## API & Swagger

Interactive OpenAPI docs are available at **`/api/docs`** when the backend is
running (e.g. http://localhost:3000/api/docs).

| Method | Endpoint         | Auth | Description                                      |
|--------|------------------|------|--------------------------------------------------|
| POST   | `/auth/login`    | –    | Authenticate, returns a JWT                      |
| GET    | `/auth/me`       | ✓    | Current authenticated user profile               |
| GET    | `/invoices`      | ✓    | List with search, filter, sort, pagination       |
| GET    | `/invoices/:id`  | ✓    | Invoice detail by ID                             |
| POST   | `/invoices`      | ✓    | Create an invoice (totals computed server-side)  |

**`GET /invoices` query parameters:** `page`, `pageSize`, `sortBy`
(`invoiceDate` | `dueDate` | `totalAmount`), `ordering` (`ASC` | `DESC`),
`status` (`Draft` | `Pending` | `Paid` | `Overdue`), `keyword` (partial,
case-insensitive on invoice number or customer name), `fromDate`, `toDate`.

Response shape:

```json
{ "data": [ /* invoices */ ], "paging": { "page": 1, "pageSize": 10, "total": 32 } }
```

**Business rules (all enforced server-side):**

```
subTotal      = quantity × rate
taxAmount     = subTotal × (tax% / 100)        // tax defaults to 10%
totalAmount   = subTotal + taxAmount − discount // discount defaults to 0
balanceAmount = totalAmount − totalPaid

Overdue (derived, never persisted):
  if status != "Paid" AND dueDate < today  → "Overdue"
  otherwise                                 → the persisted status
```

Invoice numbers are unique (enforced by a unique DB index + a friendly pre-check),
due date must be on or after the invoice date, and new invoices are always created
with status `Draft`.

---

## Testing

**Backend** (from `backend/`):

```bash
pnpm test          # unit tests (no database required)
pnpm run test:e2e  # end-to-end tests (requires a running Postgres + .env)
```

- Unit tests cover the critical business logic: invoice total calculations,
  Overdue derivation, due-date validation, and duplicate invoice-number handling.
- The e2e test covers a full workflow: login → create an invoice → verify it
  appears in the list and detail, plus auth guarding, validation (400),
  duplicates (409), and not-found (404).

**Frontend** (from `frontend/`):

```bash
pnpm test          # Vitest + Testing Library
```

- Covers the login form validation/flow, the invoice list rendering (including
  the derived status badge and empty state), and currency/date formatting.

---

## Environment configuration

All configuration is sourced from environment variables; **no secrets are
hardcoded**. Each app ships an `.env.example`:

- **Root `.env.example`** — consumed by `docker-compose.yml` (DB credentials,
  published ports, JWT secret/expiry, seed user, CORS, frontend API URL).
- **`backend/.env.example`** — for running the backend standalone.
- **`frontend/.env.example`** — `VITE_API_BASE_URL` for the SPA.

Key backend variables: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`,
`DB_NAME`, `DB_SYNCHRONIZE`, `JWT_SECRET`, `JWT_EXPIRES_IN` (seconds, **default
3600**), `CORS_ORIGIN`, and the `SEED_USER_*` values.

---

## Assumptions & design decisions

- **Customer is embedded** on the `invoices` table (the spec explicitly allows
  embedded fields or a separate table). This keeps the assessment scope simple;
  a dedicated `customers` table could be introduced later without changing the
  API response shape (which still nests a `customer` object).
- **One line item per invoice** is implemented as required, but the data model
  uses a separate `invoice_items` table with a foreign key, so multiple items are
  supported by the schema for the future.
- **Schema management** supports both modes: `synchronize` for fast local dev
  (default), and **versioned migrations** for a production-style flow (used by
  Docker). See [Database migrations](#database-migrations).
- **Token storage** uses `localStorage` for simplicity (the spec excludes
  advanced session policies). The trade-off is noted under limitations.
- **Appendix A discrepancies:** the mock dataset shows `"status": "Overdue"`,
  `"totalRecords": 94980`, and extra fields (`type`, `invoiceGrossTotal`,
  `paging.pageNumber/totalRecords`). The body of the specification takes
  precedence, so this implementation: never persists `Overdue`, seeds 20–50
  records, omits the non-modelled fields, and uses the section 2.3.1 response
  shape `paging: { page, pageSize, total }`. Appendix A was used only as a guide
  for field structure and relationships.
- The frontend shows an **estimated total** on the create form purely as a UX
  hint; it is clearly labelled and the server computes the authoritative amount.
- The invoice list state (search/filter/sort/page) is synced to the URL query
  string so views are shareable and survive a refresh.

---

## Known limitations

- **No refresh tokens / token rotation.** A single short-lived access token is
  issued; when it expires the user is redirected to log in again. Storing it in
  `localStorage` is convenient but susceptible to XSS — an HttpOnly cookie with
  refresh rotation would be the production approach.
- **Editing, deleting, and recording payments are out of scope.** `totalPaid`
  exists in the model and is seeded, but there is no UI/endpoint to update it.
- **Single line item** per invoice in the UI/API, by assessment requirement.
- **No rate limiting / advanced password policy**, per the assessment's explicit
  exclusions.
