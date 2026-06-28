#!/bin/sh
set -e

# Apply pending database migrations (idempotent — already-applied ones are
# skipped). Enabled in docker-compose via DB_RUN_MIGRATIONS=true.
if [ "${DB_RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "[entrypoint] Running database migrations..."
  pnpm run migration:run:prod || \
    echo "[entrypoint] Migration step reported an error; continuing."
fi

# Optionally seed the database on boot. Guarded by SEED_SKIP_IF_POPULATED so an
# already-populated database is never wiped on container restart.
if [ "$RUN_SEED_ON_BOOT" = "true" ]; then
  echo "[entrypoint] Seeding database (skips if already populated)..."
  SEED_SKIP_IF_POPULATED=true node dist/database/seed/seed.js || \
    echo "[entrypoint] Seed step failed; continuing to start the API."
fi

echo "[entrypoint] Starting SimpleInvoice API..."
exec node dist/main.js
