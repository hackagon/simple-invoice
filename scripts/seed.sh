#!/usr/bin/env bash
# Reseed the database (reviewer user + sample invoices).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$ROOT/backend"
exec pnpm run seed
