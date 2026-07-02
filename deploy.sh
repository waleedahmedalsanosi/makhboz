#!/usr/bin/env bash
# Run on the droplet to deploy or update Makhboz
# Usage: bash deploy.sh
set -euo pipefail

APP_DIR="/var/www/makhboz-app"
BRANCH="main"

echo "=== Pulling latest code ==="
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git checkout $BRANCH
  git pull origin $BRANCH
else
  git clone --branch $BRANCH https://github.com/waleedahmedalsanosi/makhboz.git "$APP_DIR"
  cd "$APP_DIR"
fi

echo "=== Installing dependencies ==="
npm ci --production=false

echo "=== Building ==="
npm run build

echo "=== Restarting PM2 ==="
if pm2 describe makhboz > /dev/null 2>&1; then
  pm2 restart makhboz
else
  pm2 start npm --name makhboz -- start
fi
pm2 save

echo "✅ Makhboz deployed!"
echo "   https://makhboz.net"
