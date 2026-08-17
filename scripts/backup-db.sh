#!/usr/bin/env bash
# Sauvegarde manuelle / cron — nécessite pg_dump et DATABASE_URL
set -euo pipefail
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL manquant" >&2
  exit 1
fi
OUT="${1:-backups/alym-$(date +%Y%m%d-%H%M%S).dump}"
mkdir -p "$(dirname "$OUT")"
pg_dump "$DATABASE_URL" -Fc -f "$OUT"
echo "Backup OK: $OUT"
