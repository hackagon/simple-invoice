#!/usr/bin/env bash
# Run backend and frontend unit tests.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "== backend =="
(cd "$ROOT/backend" && pnpm test)
echo "== frontend =="
(cd "$ROOT/frontend" && pnpm test)
