#!/bin/bash
set -e

# ============================================
# WhatsApp Gateway — Database Backup Script
# ============================================

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-whatsapp_gateway}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASSWORD:-password}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up database: ${DB_NAME}"
docker exec whatsappin-db mysqldump -u"${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" > "$BACKUP_FILE"

gzip "$BACKUP_FILE"
echo "✅ Backup saved: ${BACKUP_FILE}.gz"

# Hapus backup lebih dari 7 hari
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
echo "🧹 Old backups cleaned (retention: 7 days)"
