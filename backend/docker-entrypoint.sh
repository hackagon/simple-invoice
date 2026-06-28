#!/bin/sh
set -e

# Optionally seed the database on boot. Guarded by SEED_SKIP_IF_POPULATED so an
# already-populated database is never wiped on container restart.
if [ "$RUN_SEED_ON_BOOT" = "true" ]; then
  echo "[entrypoint] Seeding database (skips if already populated)..."
  SEED_SKIP_IF_POPULATED=true node dist/database/seed/seed.js || \
    echo "[entrypoint] Seed step failed; continuing to start the API."
fi

echo "[entrypoint] Starting SimpleInvoice API..."
exec node dist/main.js
