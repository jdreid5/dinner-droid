#!/bin/sh
set -e

# The SQLite database lives on the mounted Fly volume at /data so it survives
# deploys and restarts. DATABASE_URL must point at /data/dev.db (see fly.toml).
DB_PATH="/data/dev.db"

if [ ! -f "$DB_PATH" ]; then
  echo "No database on volume. Seeding from bundled snapshot..."
  cp /app/prisma/seed.db "$DB_PATH"
fi

# Apply any pending migrations. Migrations already recorded in the seeded DB
# are skipped automatically.
echo "Applying migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/server.js
