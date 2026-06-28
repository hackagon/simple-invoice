#!/usr/bin/env bash
# Apply all pending database migrations.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$ROOT/backend"
exec pnpm migration:run
