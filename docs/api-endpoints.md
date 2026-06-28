# API Endpoints

REST API exposed by the NestJS backend.

- **Base URL:** `http://localhost:3000`
- **Auth:** JWT Bearer token — send `Authorization: Bearer <accessToken>` on
  protected routes.
- **Interactive docs:** Swagger UI at `http://localhost:3000/api/docs` (generated
  from the code — always the source of truth).

## Endpoint summary

| Method | Path             | Auth | Description |
|--------|------------------|:----:|-------------|
| POST   | `/auth/login`    |  –   | Authenticate, return a JWT |
| GET    | `/auth/me`       |  ✓   | Current authenticated user profile |
| GET    | `/invoices`      |  ✓   | List invoices (search, filter, sort, pagination) |
| GET    | `/invoices/:id`  |  ✓   | Get an invoice by ID |
| POST   | `/invoices`      |  ✓   | Create an invoice |

---

## POST /auth/login

Authenticate with email and password.

**Request body**

```json
{ "email": "admin@101digital.io", "password": "Password123!" }
```

**Response `200`**

```json
{
  "accessToken": "<jwt>",
  "expiresIn": 3600,
  "user": { "id": "<uuid>", "email": "admin@101digital.io", "fullname": "Reviewer Admin" }
}
```

**Errors:** `401` invalid email or password · `400` validation error.

---

## GET /auth/me

Returns the profile of the authenticated user.

**Response `200`**

```json
{ "id": "<uuid>", "email": "admin@101digital.io", "fullname": "Reviewer Admin" }
```

**Errors:** `401` missing/invalid token.

---

## GET /invoices

Paginated list with search, filter, and sort. All parameters are optional.

| Param      | Type   | Default        | Description |
|------------|--------|----------------|-------------|
| `page`     | number | `1`            | Page number, starting at 1 |
| `pageSize` | number | `10`           | Records per page (1–100) |
| `sortBy`   | string | `invoiceDate`  | One of `invoiceDate`, `dueDate`, `totalAmount` |
| `ordering` | string | `DESC`         | `ASC` or `DESC` |
| `status`   | string | –              | `Draft`, `Pending`, `Paid`, or `Overdue` (derived) |
| `keyword`  | string | –              | Partial, case-insensitive match on invoice number **or** customer name |
| `fromDate` | string | –              | Invoices with `invoiceDate` on/after this date (`YYYY-MM-DD`) |
| `toDate`   | string | –              | Invoices with `invoiceDate` on/before this date (`YYYY-MM-DD`) |

> Filtering by `status` uses the **derived** status — e.g. `status=Overdue`
> returns all non-paid invoices whose due date has passed, and `status=Pending`
> excludes pending invoices that are now overdue.

**Example**

```
GET /invoices?page=1&pageSize=10&sortBy=totalAmount&ordering=DESC&status=Overdue
```

**Response `200`**

```json
{
  "data": [ /* array of Invoice objects (see below) */ ],
  "paging": { "page": 1, "pageSize": 10, "total": 32 }
}
```

---

## GET /invoices/:id

Returns a single invoice by its UUID.

- **Path param:** `id` — invoice UUID.
- **Response `200`:** an Invoice object (see [Invoice object](#invoice-object)).
- **Errors:** `404` invoice not found · `400` malformed UUID · `401` unauthenticated.

---

## POST /invoices

Creates an invoice. Each invoice has **exactly one line item**. New invoices are
always created with status `Draft`, and **all totals are calculated by the
server**.

**Request body**

```json
{
  "customerName": "Paul",
  "customerEmail": "paul@101digital.io",
  "customerMobile": "947717364111",
  "customerAddress": "Singapore",
  "invoiceNumber": "IV1780488206995",
  "invoiceReference": "#5721662",
  "invoiceDate": "2026-06-03",
  "dueDate": "2026-07-03",
  "currency": "AUD",
  "description": "Invoice is issued to Kanglee",
  "tax": 10,
  "discount": 20,
  "item": { "name": "Honda RC150", "quantity": 2, "rate": 1000 }
}
```

**Validation rules**

| Field | Rule |
|-------|------|
| `customerName` | Required, non-empty string |
| `customerEmail` | Required, valid email |
| `customerMobile` | Optional string |
| `customerAddress` | Optional string |
| `invoiceNumber` | Required, **unique** |
| `invoiceReference` | Optional string |
| `invoiceDate` | Required, `YYYY-MM-DD` |
| `dueDate` | Required, `YYYY-MM-DD`, **on or after** `invoiceDate` |
| `currency` | Required (e.g. `AUD`, `USD`, `GBP`) |
| `description` | Optional string |
| `tax` | Optional, non-negative number — **defaults to 10** |
| `discount` | Optional, non-negative number — **defaults to 0** |
| `item.name` | Required |
| `item.quantity` | Required, positive integer |
| `item.rate` | Required, positive number |

**Response `201`:** the created Invoice object.

**Errors:** `400` validation error · `409` duplicate invoice number · `401` unauthenticated.

---

## Invoice object

The shape returned by the list/detail/create endpoints. `status` is the
**derived** status (may be `Overdue`); amounts are server-calculated.

```json
{
  "invoiceId": "099ca7da-a290-40fa-93b9-1c43ae7bb887",
  "invoiceNumber": "IV1780488206995",
  "invoiceReference": "#5721662",
  "invoiceDate": "2026-06-03",
  "dueDate": "2026-07-03",
  "currency": "AUD",
  "currencySymbol": "AU$",
  "description": "Invoice is issued to Kanglee",
  "status": "Pending",
  "customer": {
    "fullname": "Paul",
    "email": "paul@101digital.io",
    "mobileNumber": "947717364111",
    "address": "Singapore"
  },
  "invoiceSubTotal": 2000.0,
  "totalTax": 200.0,
  "totalDiscount": 20.0,
  "totalAmount": 2180.0,
  "totalPaid": 0.0,
  "balanceAmount": 2180.0,
  "items": [
    { "id": "<uuid>", "name": "Honda RC150", "quantity": 2, "rate": 1000 }
  ],
  "createdBy": "<user-uuid>",
  "createdAt": "2026-06-03T12:03:26.995Z"
}
```

## Business rules

Amounts are computed server-side:

```
subTotal      = quantity × rate
taxAmount     = subTotal × (tax% / 100)        // tax defaults to 10%
totalAmount   = subTotal + taxAmount − discount // discount defaults to 0
balanceAmount = totalAmount − totalPaid
```

Derived status (never persisted):

```
if status != "Paid" AND dueDate < today  → "Overdue"
otherwise                                 → the persisted status
```

## Error format

All errors share a consistent shape (from the global exception filter):

```json
{ "statusCode": 404, "message": "Invoice not found", "error": "Not Found" }
```

Validation errors return an array of messages:

```json
{
  "statusCode": 400,
  "message": ["dueDate must be on or after invoiceDate"],
  "error": "Bad Request"
}
```

| Status | Meaning |
|--------|---------|
| `400`  | Validation error |
| `401`  | Missing/invalid token, or bad login credentials |
| `404`  | Resource not found |
| `409`  | Duplicate invoice number |
