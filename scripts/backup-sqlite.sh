#!/usr/bin/env bash
# Respaldo SQLite — EmpleaNet / Continental Oportunidades
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_PATH="$REPO_ROOT/database/empleanet.db"
BACKUP_DIR="$REPO_ROOT/database/backups"

if [[ ! -f "$DB_PATH" ]]; then
  echo "No se encontró la base de datos en $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$BACKUP_DIR/empleanet-$TIMESTAMP.db"
cp "$DB_PATH" "$DEST"
echo "Respaldo creado: $DEST"
