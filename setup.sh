#!/usr/bin/env bash
# Makhboz — Droplet Setup Script
# Cleans the droplet and installs: Node.js LTS, nginx, PM2, certbot
set -euo pipefail

echo "=== [1/5] Removing old content ==="
systemctl stop nginx 2>/dev/null || true
rm -rf /var/www/html /var/www/makhboz /etc/nginx/sites-enabled/* /etc/nginx/sites-available/makhboz
apt-get remove -y apache2 2>/dev/null || true

echo "=== [2/5] Installing dependencies ==="
apt-get update -qq
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

echo "=== [3/5] Installing Node.js LTS ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
npm install -g pm2

echo "=== [4/5] Configuring nginx (placeholder) ==="
mkdir -p /var/www/makhboz
cat > /var/www/makhboz/index.html << 'HTML'
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><title>مخبوز — قريباً</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#F4EFD1;color:#22333B}h1{font-size:2.5rem}</style>
</head>
<body><h1>مخبوز — قريباً 🍪</h1></body>
</html>
HTML

cat > /etc/nginx/sites-available/makhboz << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name makhboz.net www.makhboz.net;

    root /var/www/makhboz;
    index index.html;

    # Next.js app (active after deployment)
    location / {
        try_files $uri $uri/ @nextjs;
    }

    location @nextjs {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/makhboz /etc/nginx/sites-enabled/makhboz
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "=== [5/5] Configuring firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

echo ""
echo "✅ الـ droplet جاهز!"
echo ""
echo "الخطوة التالية — بعد ما makhboz.net يشير للـ droplet، شغّل:"
echo "  certbot --nginx -d makhboz.net -d www.makhboz.net --email waleed@dreamybuilders.com --agree-tos --non-interactive --redirect"
echo ""
echo "Node: $(node -v) | npm: $(npm -v) | PM2: $(pm2 -v)"
