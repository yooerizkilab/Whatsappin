#!/bin/bash
set -e

# ============================================
# WhatsApp Gateway — Deploy Script
# Jalankan dari folder Infrastruktur/
# ============================================

cd "$(dirname "$0")/.."

echo "🚀 Pulling latest changes..."
git pull origin develop

echo "🐳 Building & starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "🧹 Cleaning unused Docker resources..."
docker image prune -f

echo "✅ Deploy complete!"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   Grafana:  http://$(curl -s ifconfig.me):3002"
