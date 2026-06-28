#!/usr/bin/env bash
# Start the full production stack in Docker. Frontend: http://localhost:8080
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec docker compose up --build "$@"
