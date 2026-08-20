#!/bin/bash
set -e

echo "================================================================================"
echo " 🚀 IMHS PRODUCTION ZERO-DOWNTIME DEPLOYMENT"
echo "================================================================================"

# 1. Pull latest code
echo "📥 [1/6] Pulling latest updates from Git repository..."
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
