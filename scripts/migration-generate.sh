#!/usr/bin/env bash
# Generate a migration from entity changes.
# Usage: scripts/migration-generate.sh <MigrationName>
set -euo pipefail
NAME="${1:?Usage: scripts/migration-generate.sh <MigrationName>}"
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$ROOT/backend"
exec pnpm migration:generate "src/database/migrations/${NAME}"
