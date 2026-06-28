#!/usr/bin/env bash
# List applied and pending migrations.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$ROOT/backend"
exec pnpm migration:show
