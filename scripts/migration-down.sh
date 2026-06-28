#!/usr/bin/env bash
# Revert the most recent migration.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$ROOT/backend"
exec pnpm migration:revert
