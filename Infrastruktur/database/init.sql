-- =============================================
-- Whatsappin — Database Initialization Script
-- =============================================
-- Cara pakai:
--   docker exec -i whatsappin-db mysql -uroot -p"$PASSWORD" < init.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS whatsapp_gateway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Grant untuk user aplikasi (opsional)
-- CREATE USER IF NOT EXISTS 'whatsappin'@'%' IDENTIFIED BY 'your-password';
-- GRANT ALL PRIVILEGES ON whatsapp_gateway.* TO 'whatsappin'@'%';
-- FLUSH PRIVILEGES;

-- Schema tabel dibuat oleh Prisma migration, bukan di sini.
-- Lihat: backend/prisma/migrations/
