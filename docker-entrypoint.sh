#!/bin/sh
set -e

echo "[entrypoint] Starting application..."
exec node build/app.js
