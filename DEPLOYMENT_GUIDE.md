# Complete Production Deployment Guide for CyberPanel VPS
### IMHS Platform (`imhsedu.com`)

This guide provides an end-to-end, step-by-step procedure to deploy, configure, secure, and maintain the **Institute of Medicine and Health Sciences (IMHS)** web application on a Linux VPS managed with **CyberPanel** (OpenLiteSpeed web server).

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & System Requirements](#2-prerequisites--system-requirements)
3. [Step 1: Website & SSL Setup in CyberPanel](#step-1-website--ssl-setup-in-cyberpanel)
4. [Step 2: Install Node.js 20 LTS & PM2 on VPS](#step-2-install-nodejs-20-lts--pm2-on-vps)
5. [Step 3: Create MySQL Database in CyberPanel](#step-3-create-mysql-database-in-cyberpanel)
6. [Step 4: Clone Codebase to Server](#step-4-clone-codebase-to-server)
7. [Step 5: Setup Environment Variables (.env)](#step-5-setup-environment-variables-env)
8. [Step 6: Database Synchronization (Prisma)](#step-6-database-synchronization-prisma)
9. [Step 7: Production Build](#step-7-production-build)
10. [Step 8: Configure Reverse Proxy (Port 3020)](#step-8-configure-reverse-proxy-port-3020)
11. [Step 9: Process Management & Auto-Start (PM2)](#step-9-process-management--auto-start-pm2)
12. [Step 10: One-Click Update Script (deploy.sh)](#step-10-one-click-update-script-deploysh)
13. [Step 11: Verification & Testing](#step-11-verification--testing)
14. [Troubleshooting & Common Issues](#troubleshooting--common-issues)
15. [Maintenance & Backups](#maintenance--backups)

---

## 1. Architecture Overview

```
                          ┌─────────────────────────────┐
                          │   Visitor / Browser         │
                          │   (https://imhsedu.com)     │
                          └──────────────┬──────────────┘
                                         │ HTTPS (Port 443)
                                         ▼
                          ┌─────────────────────────────┐
                          │   OpenLiteSpeed (CyberPanel)│
                          │   - SSL Termination (Let's  │
                          │     Encrypt)                │
                          │   - Reverse Proxy           │
                          │   - HTTP/3 & Gzip/Brotli    │
                          └──────────────┬──────────────┘
                                         │ Proxy (127.0.0.1:3020)
                                         ▼
                          ┌─────────────────────────────┐
                          │ Next.js 16 (React 19) (PM2) │
                          │   - Edge & Node.js Runtime  │
                          │   - Security Headers & CSP  │
                          │   - Rate Limiting & Auth    │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │ CyberPanel MySQL Database │                   │ Google Drive / Local Disk │
   │ (Field-Level AES-256-GCM) │                   │ (/public/courses, /uploads│
   └───────────────────────────┘                   └───────────────────────────┘
```

---

## 2. Prerequisites & System Requirements

- **Server OS**: Ubuntu 22.04 LTS / 24.04 LTS or AlmaLinux 8/9 with CyberPanel installed.
- **Hardware**: Minimum 2 vCPUs, 2GB RAM (4GB RAM recommended for Next.js builds).
- **Domain DNS**: `imhsedu.com` and `www.imhsedu.com` pointing to your VPS IP address (A Records).
- **SSH Access**: Root or `sudo` access to the VPS.

---

## Step 1: Website & SSL Setup in CyberPanel

1. **Log in to CyberPanel**: `https://<YOUR_VPS_IP>:8090`
2. **Create the Website**:
   - Go to **Websites** -> **Create Website**.
   - **Package**: `Default`
   - **Owner**: `admin`
   - **Domain Name**: `imhsedu.com`
   - **Email**: `info.imhsedu@gmail.com`
   - **PHP Version**: `PHP 8.1` (or latest available)
   - **Additional Features**: Check `SSL` and `DKIM Support` only.

   > **⚠️ WARNING**: Do **NOT** enable `open_basedir Protection`. This is a PHP-level restriction that also interferes with Node.js file I/O (uploads, logs directories), causing runtime errors on the Next.js server.

   - Click **Create Website**.
3. **Issue Let's Encrypt SSL Certificate**:
   - Go to **SSL** -> **Manage SSL**.
   - Select `imhsedu.com` and click **Issue SSL**.
   - *(Ensure your DNS A records have propagated to the VPS IP prior to issuing SSL)*.
4. **Enable Force HTTPS**:
   - Go to **Websites** -> **List Websites** -> Click **Manage** on `imhsedu.com`.
   - Toggle **Force HTTPS** to **ON**.

---

## Step 2: Install Node.js 20 LTS & PM2 on VPS

Connect to your VPS via SSH terminal:

```bash
ssh root@<YOUR_VPS_IP>
```

### A. Install Node.js 20.x LTS
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install build tools and git
sudo apt install -y build-essential git

# Add NodeSource repository for Node.js 20 LTS (updated 2024 method)
curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh

# Install Node.js
sudo apt install -y nodejs

# Verify installation (Node should be v20.x and npm v10.x)
node -v
npm -v
```

### B. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

---

## Step 3: Create MySQL Database in CyberPanel

1. In CyberPanel dashboard, go to **Databases** -> **Create Database**.
2. Select Domain: `imhsedu.com`.
3. Enter Database Name suffix: `db` (Full name will be something like `imhsedu_db` or `imhs_db`).
4. Enter Database Username: `user` (Full username: `imhsedu_user`).
5. Generate a **Strong Password** (e.g. 24+ characters with symbols) and **SAVE IT SAFELY**.
6. Click **Create Database**.

---

## Step 4: Clone Codebase to Server

CyberPanel websites are located at `/home/<domain>/public_html`.

```bash
# Navigate to the website root
cd /home/imhsedu.com

# If public_html already has default files, backup/clear it:
mv public_html public_html_backup

# Clone your project into public_html
git clone <YOUR_GIT_REPOSITORY_URL> public_html

# Navigate into the project folder
cd /home/imhsedu.com/public_html

# Install all project dependencies
# Note: npm ci requires package-lock.json to be committed to the repository.
# If package-lock.json is missing, run: npm install
npm ci
```

---

## Step 5: Setup Environment Variables (.env)

Generate high-entropy cryptographic keys and create the production `.env` file.

### A. Generate Cryptographic Secrets
Run these commands in your SSH terminal to generate unique keys:

```bash
# 1. NextAuth Secret (32-byte Base64)
openssl rand -base64 32

# 2. Field Encryption Key (32-byte / 64-char Hex)
openssl rand -hex 32

# 3. Blind Index Salt (16-byte / 32-char Hex)
openssl rand -hex 16
```

### B. Create and Edit `.env`
```bash
nano /home/imhsedu.com/public_html/.env
```

Paste the following configuration, inserting your generated keys and database credentials:

```env
# ==============================================================================
# IMHS PLATFORM - PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================

# 1. DATABASE CONFIGURATION (CyberPanel MySQL with Connection Pool)
DATABASE_URL="mysql://imhsedu_user:YOUR_DB_PASSWORD@127.0.0.1:3306/imhsedu_db?connection_limit=15&pool_timeout=20"

# 2. NEXTAUTH & AUTHENTICATION
NEXTAUTH_SECRET="<INSERT_GENERATED_NEXTAUTH_SECRET>"
NEXTAUTH_URL="https://imhsedu.com"

# 3. FIELD-LEVEL ENCRYPTION AT REST (AES-256-GCM)
ENCRYPTION_SECRET="<INSERT_GENERATED_64_CHAR_HEX_KEY>"
BLIND_INDEX_SALT="<INSERT_GENERATED_32_CHAR_HEX_SALT>"

# 4. EMAIL / TRANSACTIONAL OTP MAILER (Gmail App Password)
GMAIL_USER="info.imhsedu@gmail.com"
GMAIL_APP_PASSWORD="<YOUR_16_CHAR_GMAIL_APP_PASSWORD>"

# 5. GOOGLE GEMINI AI (For AI Assistant & Prescription Generator)
GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"

# 6. WHATSAPP & PUBLIC CHANNELS
NEXT_PUBLIC_WHATSAPP_NUMBER="+94778025050"

# 7. GOOGLE DRIVE BACKUP & STORAGE (Optional)
GOOGLE_DRIVE_FOLDER_ID="<YOUR_GOOGLE_DRIVE_FOLDER_ID>"
GOOGLE_CLIENT_ID="<YOUR_GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<YOUR_GOOGLE_CLIENT_SECRET>"
GOOGLE_REFRESH_TOKEN="<YOUR_GOOGLE_REFRESH_TOKEN>"

# 8. RUNTIME SETTINGS
NODE_ENV="production"
PORT=3020
```

Press `CTRL + O`, then `Enter` to save, and `CTRL + X` to exit `nano`.

---

## Step 6: Database Synchronization (Prisma)

Generate Prisma client and synchronize the schema with the MySQL database:

> **⚠️ WARNING — `prisma db push` vs `prisma migrate deploy`**:
> - **`prisma db push`** (used here): Directly syncs the schema to the database. Safe for first-time setup, but **can silently drop columns** if they are removed from the schema. No migration history is kept.
> - **`prisma migrate deploy`**: Production-safe with full migration history. Requires `prisma/migrations/` folder to be committed to Git.
>
> For this project we use `db push` for initial setup since we manage schema changes manually. **Always take a database backup before running `db push` on a live database.**

```bash
cd /home/imhsedu.com/public_html

# 1. Generate Prisma Client (also runs automatically via postinstall)
npx prisma generate

# 2. Sync schema tables and indexes to MySQL
npx prisma db push

# 3. (Optional) Run Initial Core Seed if setting up from scratch (Admin, Students, Faculty, Sample Courses):
# npx tsx prisma/seed.ts

# 4. (Optional) Run Media CMS Seed (Video Highlights, Convocation, & Gallery Showcase):
# npx tsx scripts/seed-media-cms.ts

# 5. (Optional) If migrating legacy data from SQL dump:
# npx tsx scripts/migrate-full-backup.ts
```

---

## Step 7: Production Build

Create all required runtime directories, set correct permissions, and run the optimized Next.js build:

```bash
cd /home/imhsedu.com/public_html

# Create all required runtime directories for uploads and logs
mkdir -p logs
mkdir -p public/uploads/submissions
mkdir -p public/uploads/briefs
mkdir -p public/courses
mkdir -p public/practice/prescriptions

# Set correct permissions (755 for dirs, 644 for files)
# On CyberPanel, the web process runs as 'nobody'. Use nobody as owner:
sudo chown -R nobody:nobody public/uploads public/courses public/practice
sudo chown -R nobody:nobody logs
chmod -R 755 public/
chmod -R 755 logs/

# Build Next.js application (increase memory limit if VPS has limited RAM)
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

> **Tip**: If the build fails with a heap out of memory error, see [Troubleshooting Issue 2](#issue-2-javascript-heap-out-of-memory-during-npm-run-build) below.

---

## Step 8: Configure Reverse Proxy (Port 3020)

The front-facing web server handles SSL termination (HTTPS/HTTP2/HTTP3), static header caching, and routes all traffic to Next.js running on `127.0.0.1:3020`.

### Option A: OpenLiteSpeed / CyberPanel vHost (Recommended for CyberPanel)
1. In CyberPanel, navigate to **Websites** -> **List Websites**.
2. Click **Manage** on `imhsedu.com`.
3. Scroll down and click **vHost Conf**.
4. Append the following reverse proxy and rewrite configuration to the bottom of the vHost config file:

```apache
# ── OpenLiteSpeed Reverse Proxy to Next.js (Port 3020) ──
extprocessor imhs_node {
  type                    proxy
  address                 127.0.0.1:3020
  maxConns                1000
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respURI                 /
}

context / {
  type                    proxy
  handler                 imhs_node
  addDefaultCharset       off
}
```

5. Click **Save** to apply changes and restart OpenLiteSpeed.

> **⚠️ Note**: Do NOT use `.htaccess` for reverse proxying with OpenLiteSpeed. OpenLiteSpeed does not process Apache `mod_proxy` directives in `.htaccess`. Only the vHost Conf method above works reliably. The `.htaccess` approach only works with Apache.

---

### Option B: NGINX Reverse Proxy (For Ubuntu / Debian VPS)
If your VPS uses standard NGINX, configure `/etc/nginx/sites-available/imhsedu.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name imhsedu.com www.imhsedu.com;
    return 301 https://imhsedu.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.imhsedu.com;
    
    # SSL Certificates (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/imhsedu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/imhsedu.com/privkey.pem;
    
    return 301 https://imhsedu.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name imhsedu.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/imhsedu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/imhsedu.com/privkey.pem;

    # Max upload size (PDF coursework & student submissions)
    client_max_body_size 50M;

    # Everything proxied to Next.js on port 3020
    location / {
        proxy_pass http://127.0.0.1:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

After saving, activate and test:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/imhsedu.com /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

---

### Firewall Configuration (Required)

Ensure only necessary ports are publicly accessible. Port 3020 must **not** be open to the internet:

```bash
# Allow SSH, HTTP, HTTPS, and CyberPanel
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 8090/tcp   # CyberPanel Admin UI

# Block direct access to Node.js port (only accessible internally)
sudo ufw deny 3020/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Step 9: Process Management & Auto-Start (PM2)

Use PM2 to run the application in the background, balance CPU cores in cluster mode, and auto-restart on crashes or server reboots.

### A. Start the Application
```bash
cd /home/imhsedu.com/public_html

# Start with ecosystem config
pm2 start ecosystem.config.js

# Check status
pm2 status
```

### B. Configure Auto-Start on System Boot
```bash
# Save current PM2 processes list
pm2 save

# Generate systemd startup script
# IMPORTANT: PM2 will print a command starting with "sudo env PATH=..."
# You MUST copy that full command and run it manually. Example:
pm2 startup systemd
# ↑ This prints something like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
# Run THAT command exactly as printed.
```

### C. Useful PM2 Monitoring Commands
```bash
# View real-time application logs
pm2 logs imhs-portal

# View memory and CPU dashboard
pm2 monit

# Reload without downtime
pm2 reload imhs-portal

# Restart
pm2 restart imhs-portal
```

---

## Step 10: One-Click Update Script (deploy.sh)

To automate future updates from GitHub, create a deployment script:

```bash
nano /home/imhsedu.com/public_html/deploy.sh
```

Paste the following bash script:

```bash
#!/bin/bash
set -e

echo "================================================================================"
echo " 🚀 IMHS PRODUCTION ZERO-DOWNTIME DEPLOYMENT"
echo "================================================================================"

# 1. Pull latest code
echo "📥 [1/6] Pulling latest updates from Git repository..."
cd "$(dirname "$0")" || cd /home/imhsedu.com/public_html
git pull origin main

# 2. Install dependencies
echo "📦 [2/6] Installing dependencies..."
npm ci

# 3. Prisma generate & db push
echo "🗄️ [3/6] Synchronizing Prisma schema with MySQL database..."
npx prisma generate
npx prisma db push

# 4. Production Next.js build
echo "🏗️ [4/6] Compiling production Next.js build..."
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# 5. Reload PM2 cluster
echo "🔄 [5/6] Gracefully reloading PM2 cluster..."
pm2 reload ecosystem.config.js --update-env

# 6. Run automated test suite
echo "🧪 [6/6] Executing automated security and system test suites..."
npx tsx scripts/run-all-tests.ts

echo "================================================================================"
echo " ✅ DEPLOYMENT COMPLETED SUCCESSFULLY AT $(date)"
echo "================================================================================"
```

Make the script executable:
```bash
chmod +x /home/imhsedu.com/public_html/deploy.sh
```

Whenever you push new updates to Git, deploy instantly with:
```bash
./deploy.sh
```

---

## Step 11: Verification & Testing

Verify that all systems and security features are working properly:

1. **Visit Website**: Navigate to `https://imhsedu.com` in your browser.
2. **Verify HTTPS Redirection**: Try visiting `http://imhsedu.com` — it must automatically redirect (301) to `https://imhsedu.com`.
3. **Verify Security Headers**:
   ```bash
   curl -I https://imhsedu.com
   ```
   Check for headers:
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Content-Security-Policy: ... upgrade-insecure-requests`
4. **Verify Sitemap & Robots**:
   - `https://imhsedu.com/sitemap.xml`
   - `https://imhsedu.com/robots.txt`
5. **Run Test Suites on Server**:
   ```bash
   cd /home/imhsedu.com/public_html
   npx tsx scripts/run-all-tests.ts
   ```

---

## Troubleshooting & Common Issues

### Issue 1: "502 Bad Gateway" or "503 Service Unavailable"
- **Cause**: Next.js is not running or crashed on startup.
- **Fix**: Check PM2 logs:
  ```bash
  pm2 logs imhs-portal --err --lines 50
  ```
  Verify `.env` exists and `DATABASE_URL` is reachable:
  ```bash
  npx tsx -e "import { prisma } from './lib/prisma'; prisma.\$connect().then(() => console.log('DB Connected!')).catch(console.error);"
  ```

### Issue 2: "JavaScript heap out of memory" during `npm run build`
- **Cause**: VPS has limited RAM (e.g. 1GB or 2GB).
- **Fix**: Create a persistent Linux swap file:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile

  # Make swap persistent across reboots (IMPORTANT — without this, swap disappears after restart)
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
  Or increase Node memory limit for the build only:
  ```bash
  NODE_OPTIONS="--max-old-space-size=2048" npm run build
  ```

### Issue 3: OpenLiteSpeed Static Cache caching Dynamic User Sessions
- **Cause**: LiteSpeed cache is caching protected `/dashboard` or `/api` routes.
- **Fix**: In CyberPanel -> Website -> Manage -> LiteSpeed Cache -> Ensure cache is disabled for `/dashboard/*`, `/admin/*`, and `/api/*`.

### Issue 4: File Upload Permission Errors
- **Cause**: OpenLiteSpeed runs as `nobody` user, not as root, so upload and log directories need to be owned by `nobody`.
- **Fix**: Run:
  ```bash
  # CyberPanel / OpenLiteSpeed web process user is 'nobody'
  sudo chown -R nobody:nobody /home/imhsedu.com/public_html/logs
  sudo chown -R nobody:nobody /home/imhsedu.com/public_html/public/uploads
  sudo chown -R nobody:nobody /home/imhsedu.com/public_html/public/courses
  sudo chown -R nobody:nobody /home/imhsedu.com/public_html/public/practice
  chmod -R 775 /home/imhsedu.com/public_html/logs
  chmod -R 775 /home/imhsedu.com/public_html/public/uploads
  chmod -R 775 /home/imhsedu.com/public_html/public/courses
  chmod -R 775 /home/imhsedu.com/public_html/public/practice
  # Note: If using NGINX, replace 'nobody' with 'www-data'
  ```

---

## Maintenance & Backups

### Automated Database Backup Cron

First, create a MySQL credentials file to avoid exposing passwords in shell history and `ps aux` output:

```bash
# Create a secure credentials file
nano /root/.my.cnf
```

Add these contents:
```ini
[client]
user=imhsedu_user
password=YOUR_DB_PASSWORD
```

Secure the file:
```bash
chmod 600 /root/.my.cnf
```

Create the backup directory and add a daily cron job in CyberPanel -> **Cron Jobs**:
```bash
mkdir -p /home/imhsedu.com/backups

# Daily backup cron (no password exposed in command)
mysqldump --defaults-file=/root/.my.cnf imhsedu_db | gzip > /home/imhsedu.com/backups/db_$(date +\%F).sql.gz

# Optional: Remove backups older than 30 days
find /home/imhsedu.com/backups/ -name "*.sql.gz" -mtime +30 -delete
```

### Rotating Security Audit Logs
Logs are recorded in `/home/imhsedu.com/public_html/logs/security.log`. You can view recent security alerts at any time:
```bash
tail -n 100 /home/imhsedu.com/public_html/logs/security.log
```
