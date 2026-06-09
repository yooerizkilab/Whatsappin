# Database

Folder ini berisi script dan dokumentasi terkait database.

## Files

| File | Isi |
| --- | --- |
| [init.sql](init.sql) | Inisialisasi awal database (create database, grants) |

## Migration

Prisma digunakan untuk mengelola schema migration.

### Development

```bash
cd backend
npx prisma migrate dev        # Buat migration baru + apply
npx prisma migrate dev --name description
npx prisma studio              # GUI database client
```

### Production (Docker)

```bash
docker exec whatsappin-backend npx prisma migrate deploy
```

### Backup & Restore

```bash
# Backup
docker exec whatsappin-db mysqldump -uroot -p"$PASSWORD" whatsapp_gateway > backup.sql

# Restore
docker exec -i whatsappin-db mysql -uroot -p"$PASSWORD" whatsapp_gateway < backup.sql
```
