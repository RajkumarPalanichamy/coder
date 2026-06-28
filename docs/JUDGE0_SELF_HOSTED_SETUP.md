# Self-Hosted Judge0 on Hostinger VPS

This guide deploys Judge0 CE on a Hostinger VPS and connects your Vercel app to it instead of the paid RapidAPI service.

## Requirements

| Resource | Minimum |
|----------|---------|
| VPS RAM | 4 GB (2 GB may work but is tight) |
| Disk | 20 GB+ |
| OS | Ubuntu 22.04 or 24.04 |
| Domain | Optional but recommended (e.g. `judge0.yourdomain.com`) |

## Part 1: VPS Setup (SSH into your Hostinger VPS)

### 1. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Deploy Judge0

```bash
sudo mkdir -p /opt/judge0
cd /opt/judge0

sudo curl -fsSL -o docker-compose.yml \
  https://raw.githubusercontent.com/judge0/judge0/master/docker-compose.yml
sudo curl -fsSL -o judge0.conf \
  https://raw.githubusercontent.com/judge0/judge0/master/judge0.conf
```

Generate secrets (save these — you will need them for Vercel):

```bash
export POSTGRES_PASSWORD=$(openssl rand -hex 24)
export REDIS_PASSWORD=$(openssl rand -hex 24)
export AUTHN_TOKEN=$(openssl rand -hex 32)

echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo "AUTHN_TOKEN=$AUTHN_TOKEN"
```

Edit `judge0.conf` and set these values at the bottom of the file (uncomment/set the lines):

```bash
sudo nano judge0.conf
```

Add or update:

```ini
REDIS_PASSWORD=your_redis_password_here
POSTGRES_PASSWORD=your_postgres_password_here
AUTHN_HEADER=X-Auth-Token
AUTHN_TOKEN=your_authn_token_here
```

### 3. Start Judge0 (database first, then full stack)

```bash
cd /opt/judge0
docker compose up -d db redis
sleep 15
docker compose up -d
```

Verify it is running:

```bash
curl -s http://localhost:2358/languages | head -c 200
curl -s -H "X-Auth-Token: YOUR_AUTHN_TOKEN" http://localhost:2358/languages | head -c 200
```

### 4. Expose with Nginx + HTTPS (recommended)

Install Nginx and Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Point a DNS **A record** for `judge0.yourdomain.com` to your VPS IP, then:

```bash
sudo nano /etc/nginx/sites-available/judge0
```

```nginx
server {
    listen 80;
    server_name judge0.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:2358;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/judge0 /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d judge0.yourdomain.com
```

Firewall (only allow SSH, HTTP, HTTPS — not port 2358 publicly):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Test from your machine:

```bash
curl -s -H "X-Auth-Token: YOUR_AUTHN_TOKEN" https://judge0.yourdomain.com/languages
```

## Part 2: Configure Vercel

In your Vercel project → **Settings** → **Environment Variables**, set:

| Variable | Value |
|----------|-------|
| `JUDGE0_URL` | `https://judge0.yourdomain.com` |
| `JUDGE0_API_KEY` | Same value as `AUTHN_TOKEN` on the VPS |
| `JUDGE0_AUTH_MODE` | `selfhosted` (optional — auto-detected when URL is not RapidAPI) |

Redeploy the app after saving env vars.

## Part 3: Verify from your app

After deploy, open:

```
https://your-vercel-app.vercel.app/api/judge0/test
```

You should see a successful connection and a sample JavaScript execution.

## Language IDs

Self-hosted Judge0 may use different language IDs than RapidAPI. Your app expects:

| Language | ID |
|----------|-----|
| JavaScript (Node.js) | 63 |
| Python 3 | 71 |
| Java | 62 |
| C++ | 54 |
| C | 50 |

Check your instance:

```bash
curl -s -H "X-Auth-Token: TOKEN" https://judge0.yourdomain.com/languages | jq '.[] | select(.name | test("JavaScript|Python|Java|C\\+\\+|C \\("))'
```

If IDs differ, update `SUPPORTED_LANGUAGES` in `src/lib/judge0.js`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Connection refused` | Run `docker compose ps` in `/opt/judge0` |
| `401 Unauthorized` | `JUDGE0_API_KEY` must match `AUTHN_TOKEN` in `judge0.conf` |
| Submissions hang | Check worker: `docker compose logs worker` |
| Vercel timeout | Increase polling or use a larger VPS; Hobby plan has 10s function limit |
| Out of memory | Upgrade VPS RAM or reduce `COUNT` workers in `judge0.conf` |

## Maintenance

```bash
cd /opt/judge0
docker compose pull
docker compose up -d
docker compose logs -f --tail=100
```

## Security notes

- Always set `AUTHN_TOKEN` on a public VPS.
- Do not expose port `2358` directly; use Nginx on 443 only.
- Rotate `AUTHN_TOKEN` periodically and update Vercel env vars.
