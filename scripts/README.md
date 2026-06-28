# Scripts

Convenience wrappers for common tasks. Run from anywhere, e.g. `./scripts/start-dev.sh`.

## Docker

| Script | What it does |
|--------|--------------|
| `start-dev.sh` | Start db + backend + frontend with **hot reload** (Nest watch + Vite HMR). Frontend → http://localhost:5173 |
| `start.sh` | Start the **production** stack. Frontend → http://localhost:8080 |
| `stop.sh` | Stop the stack (keeps the database volume) |
| `reset-db.sh` | Stop and **delete the database volume** (fresh data next start) |
| `logs.sh [service]` | Follow logs; optionally pass `db`, `backend`, or `frontend` |

## Database (run against the Postgres on host port 5433 by default)

| Script | What it does |
|--------|--------------|
| `migration-up.sh` | Apply all pending migrations |
| `migration-down.sh` | Revert the most recent migration |
| `migration-generate.sh <Name>` | Generate a migration from entity changes |
| `migration-show.sh` | List applied / pending migrations |
| `seed.sh` | Reseed the database (reviewer user + sample invoices) |

The DB scripts default to `localhost:5433` (the Dockerized Postgres). Override any
connection value by exporting it first, e.g. `DB_PORT=5432 ./scripts/migration-up.sh`.
They require the database to be running and backend dependencies installed
(`cd backend && pnpm install`).

## Misc

| Script | What it does |
|--------|--------------|
| `test.sh` | Run backend + frontend unit tests |
