#!/usr/bin/env bash
# Run this script ON your Hostinger VPS (Ubuntu 22.04/24.04) as root or with sudo.
# Usage: curl -fsSL <raw-url> | bash   OR   bash judge0-vps-setup.sh

set -euo pipefail

JUDGE0_DIR="/opt/judge0"

echo "==> Installing Docker if missing..."
if ! command -v docker &>/dev/null; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "==> Creating Judge0 directory at $JUDGE0_DIR"
mkdir -p "$JUDGE0_DIR"
cd "$JUDGE0_DIR"

curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/judge0/judge0/master/docker-compose.yml
curl -fsSL -o judge0.conf https://raw.githubusercontent.com/judge0/judge0/master/judge0.conf

POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -hex 24)}"
REDIS_PASSWORD="${REDIS_PASSWORD:-$(openssl rand -hex 24)}"
AUTHN_TOKEN="${AUTHN_TOKEN:-$(openssl rand -hex 32)}"

# Append required secrets to judge0.conf
cat >> judge0.conf <<EOF

# --- Added by judge0-vps-setup.sh ---
REDIS_PASSWORD=$REDIS_PASSWORD
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
AUTHN_HEADER=X-Auth-Token
AUTHN_TOKEN=$AUTHN_TOKEN
EOF

echo "==> Starting database and redis..."
docker compose up -d db redis
echo "==> Waiting 15s for database..."
sleep 15

echo "==> Starting Judge0 server and workers..."
docker compose up -d

echo ""
echo "=============================================="
echo " Judge0 installed successfully!"
echo "=============================================="
echo "API URL (local):  http://$(hostname -I | awk '{print $1}'):2358"
echo ""
echo "Save these for Vercel environment variables:"
echo "  JUDGE0_URL=https://judge0.YOUR_DOMAIN.com"
echo "  JUDGE0_API_KEY=$AUTHN_TOKEN"
echo "  JUDGE0_AUTH_MODE=selfhosted"
echo ""
echo "Test locally:"
echo "  curl -H \"X-Auth-Token: $AUTHN_TOKEN\" http://localhost:2358/languages"
echo ""
echo "Next: set up Nginx + HTTPS — see docs/JUDGE0_SELF_HOSTED_SETUP.md"
echo "=============================================="
