#!/bin/sh
# Container entrypoint: apply DB migrations, seed once, then start the server.
#
# migrate deploy MUST succeed before the app starts — without the schema the app
# boots but every query fails (P2021 "table does not exist"). So we fail loud
# (set -e) instead of the old `|| true` that swallowed migration failures and
# left the app running against an empty database.
set -e

echo "[entrypoint] applying Prisma migrations..."
npx prisma migrate deploy

# Seed is idempotent (upserts the default user); don't abort startup if it's a
# no-op or the row already exists, but DO surface its output.
echo "[entrypoint] seeding (idempotent)..."
npx prisma db seed || echo "[entrypoint] seed skipped/failed (non-fatal)"

echo "[entrypoint] starting server..."
exec node server.js
