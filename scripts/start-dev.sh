#!/usr/bin/env bash
# Start db + backend + frontend in Docker with hot reload (Nest watch + Vite HMR).
# Frontend: http://localhost:5173  |  Backend: http://localhost:3000
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build "$@"
