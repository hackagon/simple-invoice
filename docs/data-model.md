# Data Model

The schema is managed with TypeORM. Tables map to the entities in
`backend/src/database/entities`. The canonical schema is the initial migration
in `backend/src/database/migrations`.

## Entity relationship overview

```
┌────────────┐         ┌────────────────────────────┐         ┌──────────────────┐
│   users    │ 1     * │          invoices          │ 1     * │  invoice_items   │
│            │─────────│ (customer fields embedded) │─────────│                  │
│ id (PK)    │ created │ invoice_id (PK)            │ invoice │ id (PK)          │
│            │  _by    │ created_by (FK → users.id) │  _id    │ invoice_id (FK)  │
└────────────┘         └────────────────────────────┘         └──────────────────┘
```

- An **invoice** belongs to the **user** that created it (`created_by`).
- An **invoice** has many **invoice_items** (one item per invoice in this
  assessment, but modelled as one-to-many for the future).
- **Customer** details are embedded as columns on the invoice (no separate
  table).

---

## users

| Column          | Type        | Constraints                  | Notes |
|-----------------|-------------|------------------------------|-------|
| `id`            | uuid        | PK, generated                | |
| `email`         | varchar     | unique, not null             | Login identifier |
| `password_hash` | varchar     | not null                     | Bcrypt hash |
| `fullname`      | varchar     | not null                     | Display name |
| `created_at`    | timestamp   | not null, default `now()`    | |

---

## invoices

Customer fields are embedded (prefixed `customer_`). Persisted `status` is only
`Draft`, `Pending`, or `Paid` — `Overdue` is derived at read time and never
stored.

| Column              | Type           | Constraints                         | Notes |
|---------------------|----------------|-------------------------------------|-------|
| `invoice_id`        | uuid           | PK, generated                       | |
| `invoice_number`    | varchar        | **unique**, not null                | User-provided |
| `invoice_reference` | varchar        | nullable                            | Optional external reference |
| `invoice_date`      | date           | not null                            | |
| `due_date`          | date           | not null                            | Must be ≥ `invoice_date` (validated) |
| `currency`          | varchar        | not null                            | ISO 4217 code, e.g. `AUD` |
| `currency_symbol`   | varchar        | not null                            | Display symbol, e.g. `AU$` |
| `description`       | varchar        | nullable                            | |
| `status`            | enum           | not null, default `Draft`           | `Draft` \| `Pending` \| `Paid` |
| `customer_fullname` | varchar        | not null                            | Embedded customer |
| `customer_email`    | varchar        | not null                            | Embedded customer |
| `customer_mobile`   | varchar        | nullable                            | Embedded customer |
| `customer_address`  | varchar        | nullable                            | Embedded customer |
| `invoice_sub_total` | numeric(14,2)  | not null                            | `quantity × rate` |
| `total_tax`         | numeric(14,2)  | not null                            | Calculated server-side |
| `total_discount`    | numeric(14,2)  | not null, default `0`               | Calculated server-side |
| `total_amount`      | numeric(14,2)  | not null                            | Final payable amount |
| `total_paid`        | numeric(14,2)  | not null, default `0`               | Amount paid so far |
| `balance_amount`    | numeric(14,2)  | not null                            | `total_amount − total_paid` |
| `created_by`        | uuid           | not null, FK → `users.id`           | |
| `created_at`        | timestamp      | not null, default `now()`           | |

**Indexes / constraints**

- Unique index on `invoice_number` (`UQ_invoices_invoice_number`).
- Foreign key `created_by` → `users.id`.

---

## invoice_items

| Column       | Type           | Constraints                                  | Notes |
|--------------|----------------|----------------------------------------------|-------|
| `id`         | uuid           | PK, generated                                | |
| `invoice_id` | uuid           | not null, FK → `invoices.invoice_id`, cascade delete | |
| `name`       | varchar        | not null                                     | |
| `quantity`   | integer        | not null                                     | Positive |
| `rate`       | numeric(14,2)  | not null                                     | Positive |

Deleting an invoice cascades to its items.

---

## Status enum

| Value     | Persisted? | Meaning |
|-----------|:----------:|---------|
| `Draft`   | ✓          | Newly created, not yet issued |
| `Pending` | ✓          | Issued, awaiting payment |
| `Paid`    | ✓          | Fully paid |
| `Overdue` | ✗ (derived)| Not paid and past due date — computed at read time |

---

## Computed amounts

Amounts are **always calculated by the backend** — the client never computes
them.

```
invoiceSubTotal = quantity × rate
totalTax        = invoiceSubTotal × (tax% / 100)   // tax% defaults to 10
totalDiscount   = discount                          // defaults to 0
totalAmount     = invoiceSubTotal + totalTax − totalDiscount
balanceAmount   = totalAmount − totalPaid
```

Numeric columns use `numeric(14,2)`; the `pg` driver returns them as strings,
so the backend applies a decimal transformer to expose clean JS numbers in API
responses.

## Design notes

- **Embedded customer vs. separate table** — customer fields are embedded on
  `invoices` to keep the assessment scope simple. A dedicated `customers` table
  could be introduced later without changing the API response shape (which still
  nests a `customer` object).
- **One line item per invoice** is implemented, but `invoice_items` is a proper
  one-to-many table so multiple items are supported by the schema.
- **Derived `Overdue`** keeps the persisted state minimal and always consistent
  with the current date.

See also: [API endpoints](./api-endpoints.md) · [Architecture](./architecture.md)
