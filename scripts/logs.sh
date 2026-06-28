#!/usr/bin/env bash
# Follow container logs. Optional: pass a service name (db | backend | frontend).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec docker compose logs -f "$@"
