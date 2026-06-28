# Shared environment for DB scripts. Sourced, not executed.
# Defaults target the Dockerized Postgres (published on host port 5433);
# override any value by exporting it before running the script.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5433}"
export DB_USERNAME="${DB_USERNAME:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:-postgres}"
export DB_NAME="${DB_NAME:-simple_invoice}"
