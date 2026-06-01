#!/bin/sh
set -e

# The SQLite database lives on the mounted Fly volume at /data so it survives
# deploys and restarts. DATABASE_URL must point at /data/dev.db (see fly.toml).
DB_PATH="/data/dev.db"
SEED_PATH="/app/prisma/seed.db"

if [ ! -f "$DB_PATH" ]; then
  if [ -f "$SEED_PATH" ]; then
    echo "No database on volume; seeding from bundled snapshot ($SEED_PATH)..."
    cp "$SEED_PATH" "$DB_PATH"
  else
    echo "No database on volume and no bundled seed; starting with an empty database."
  fi
fi

# Apply any pending migrations. Migrations already recorded in the database are
# skipped; on an empty database this creates the full schema.
echo "Applying migrations (prisma migrate deploy)..."
npx prisma migrate deploy

echo "Starting server on port ${PORT:-3001}..."
exec node dist/server.js
