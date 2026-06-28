#!/usr/bin/env bash
# Stop the stack and delete the database volume (fresh data on next start).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec docker compose down -v "$@"
