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
10. [Step 8: Configure OpenLiteSpeed Reverse Proxy](#step-8-configure-openlitespeed-reverse-proxy)
11. [Step 9: Process Management & Auto-Start (PM2)](#step-9-process-management--auto-start-pm2)
12. [Step 10: One-Click Update Script (deploy.sh)](#step-10-one-click-update-script-deploysh)
13. [Step 11: Verification & Testing](#step-11-verification--testing)
14. [Troubleshooting & Common Issues](#14-troubleshooting--common-issues)

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
                          │   Next.js 15 Server (PM2)   │
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
   - **Additional Features**: Check `SSL`, `DKIM Support`, and `open_basedir Protection`.
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

### A. Install Node.js 20.x LTS (NodeSource)
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Add NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and build tools
sudo apt install -y nodejs build-essential git

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

Generate Prisma client and push the schema directly to the MySQL database:

```bash
cd /home/imhsedu.com/public_html

# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema tables and indexes to MySQL
npx prisma db push

# 3. (Optional) Run Initial Seed if setting up from scratch:
# npx tsx prisma/seed.ts

# 4. (Optional) If migrating legacy WordPress SQL dump:
# npx tsx scripts/migrate-full-backup.ts
```

---

## Step 7: Production Build

Create directories for uploads and logs, set permissions, and run the optimized Next.js build:

```bash
cd /home/imhsedu.com/public_html

# Create required runtime directories
mkdir -p logs public/uploads

# Ensure proper permissions
chmod -R 755 public/
chmod -R 755 logs/

# Build Next.js application
npm run build
```

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

#### Alternative: Via `.htaccess`
Alternatively, navigate to **File Manager** -> `/home/imhsedu.com/public_html/.htaccess` and add:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

RewriteRule ^(.*)$ http://127.0.0.1:3020/$1 [P,L]
RequestHeader set X-Forwarded-Proto "https"
```

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

# Generate systemd startup script (copy and run the command PM2 prints)
pm2 startup systemd
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

echo "🚀 Starting IMHS Production Deployment..."
cd /home/imhsedu.com/public_html

echo "📥 Pulling latest changes from Git..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci

echo "🗄️ Syncing Prisma Database Schema..."
npx prisma generate
npx prisma db push

echo "🏗️ Building Next.js application..."
npm run build

echo "🔄 Reloading PM2 Cluster with Zero Downtime..."
pm2 reload ecosystem.config.js --update-env

echo "🧪 Running Automated Health & Security Test Suites..."
npx tsx scripts/run-all-tests.ts

echo "✅ IMHS Deployment Successfully Completed!"
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

## 14. Troubleshooting & Common Issues

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
- **Fix**: Create a temporary Linux swap file:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```
  Or allocate memory to Node during build:
  ```bash
  NODE_OPTIONS="--max-old-space-size=2048" npm run build
  ```

### Issue 3: OpenLiteSpeed Static Cache caching Dynamic User Sessions
- **Cause**: LiteSpeed cache is caching protected `/dashboard` or `/api` routes.
- **Fix**: In CyberPanel -> Website -> Manage -> LiteSpeed Cache -> Ensure cache is disabled for `/dashboard/*`, `/admin/*`, and `/api/*`.

### Issue 4: File Upload Permission Errors
- **Cause**: User permissions on `public/uploads` or `logs/`.
- **Fix**: Run:
  ```bash
  sudo chown -R $USER:$USER /home/imhsedu.com/public_html/logs
  sudo chown -R $USER:$USER /home/imhsedu.com/public_html/public/uploads
  chmod -R 775 /home/imhsedu.com/public_html/logs
  chmod -R 775 /home/imhsedu.com/public_html/public/uploads
  ```

---

## Maintenance & Backups

### Automated Database Backup Cron
In CyberPanel -> **Cron Jobs**, add a daily backup:
```bash
mysqldump -u imhsedu_user -p'YOUR_DB_PASSWORD' imhsedu_db | gzip > /home/imhsedu.com/backups/db_$(date +\%F).sql.gz
```

### Rotating Security Audit Logs
Logs are recorded in `/home/imhsedu.com/public_html/logs/security.log`. You can view recent security alerts at any time:
```bash
tail -n 100 /home/imhsedu.com/public_html/logs/security.log
```
