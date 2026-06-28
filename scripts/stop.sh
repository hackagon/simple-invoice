#!/usr/bin/env bash
# Stop the stack (keeps the database volume).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec docker compose down "$@"
