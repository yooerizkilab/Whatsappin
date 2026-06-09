# Runbook — WhatsApp Gateway Operations

## Service Management

```bash
# Start semua service (development)
docker compose -f ../docker-compose.yml up -d

# Start semua service (production)
docker compose -f ../docker-compose.prod.yml up -d

# Lihat logs
docker compose logs -f backend
docker compose logs -f nginx

# Restart service tertentu
docker compose restart backend

# Stop semua
docker compose down

# Stop + hapus volume (⚠️ data hilang!)
docker compose down -v
```

## Deployment

```bash
# Deploy via script
cd /opt/whatsapp-gateway/Infrastruktur
./scripts/deploy.sh
```

## Database

```bash
# Backup manual
./scripts/backup.sh

# Restore
cat backups/whatsapp_gateway_20250101_120000.sql.gz | gunzip | docker exec -i whatsappin-db mysql -uroot -p"$DB_PASSWORD" whatsapp_gateway

# Masuk ke MySQL
docker exec -it whatsappin-db mysql -uroot -p"$DB_PASSWORD" whatsapp_gateway
```

## SSL Certificate (Let's Encrypt)

```bash
# Install certbot pertama kali
docker exec -it whatsappin-nginx apk add certbot certbot-nginx
certbot --nginx -d yourdomain.com

# Auto-renew (cron)
echo "0 3 * * * docker exec whatsappin-nginx certbot renew && docker exec whatsappin-nginx nginx -s reload" | crontab -
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend cannot connect to DB | `docker compose logs db` — cek healthcheck |
| QR code not showing | WebSocket must connect via `/ws` path, check nginx config |
| "Waiting for message" | HP utama (pengirim) harus online saat blast |
| Redis version warning | Upgrade Redis image to v7+ |
| Session lost after restart | Session disimpan di volume `session_data` |

## Monitoring

- **Grafana:** http://VPS_IP:3002 (admin/admin)
- **Prometheus:** http://VPS_IP:9090
- **Backend Metrics:** http://VPS_IP/api/metrics
