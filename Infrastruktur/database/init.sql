-- =============================================
-- Whatsappin — Database Initialization Script
-- =============================================
-- Cara pakai:
--   docker exec -i whatsappin-db mysql -uroot -p"$PASSWORD" < init.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS whatsapp_gateway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- (Opsional) Buat user khusus untuk aplikasi
-- CREATE USER IF NOT EXISTS 'whatsappin'@'%' IDENTIFIED BY 'your-password';
-- GRANT ALL PRIVILEGES ON whatsapp_gateway.* TO 'whatsappin'@'%';
-- FLUSH PRIVILEGES;

-- Prisma akan membuat tabel otomatis saat migration dijalankan:
--   npx prisma migrate dev
-- atau di Docker:
--   docker exec whatsappin-backend npx prisma migrate deploy
