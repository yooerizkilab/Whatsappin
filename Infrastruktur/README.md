# Infrastruktur

Folder ini berisi konfigurasi infrastruktur untuk WhatsApp Gateway.

## Struktur

```text
Infrastruktur/
├── README.md                  ← Dokumentasi ini
├── docker-compose.prod.yml    ← Docker Compose untuk production
├── docker/                    ← Dockerfile & monitoring config
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── grafana/
│   └── prometheus/
├── nginx/
│   └── default.conf           ← Reverse proxy config
├── env/
│   ├── .env.backend           ← Backend environment template
│   └── .env.frontend          ← Frontend environment template
├── database/                  ← DB scripts (init, migration)
├── scripts/
│   ├── deploy.sh              ← One-command deployment
│   └── backup.sh              ← Database backup
└── runbooks/
    └── README.md              ← Operational guide
```

## Cara Deploy ke VPS

### 1. Clone project di VPS

```bash
git clone https://github.com/your-repo/whatsapp-gateway.git
cd whatsapp-gateway/Infrastruktur
```

### 2. Setup environment variables

```bash
cp env/.env.backend .env
# Edit .env — isi DB_ROOT_PASSWORD, JWT_SECRET, REDIS_PASSWORD, dll
nano .env
```

### 3. Jalankan

```bash
# Development
docker compose -f ../docker-compose.yml up -d --build

# Production (with Nginx)
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Setup SSL (optional)

```bash
docker exec -it whatsappin-nginx apk add certbot certbot-nginx
certbot --nginx -d yourdomain.com
```

## Requirements

- Docker & Docker Compose
- Node.js 20+ (hanya untuk development)
- MySQL 8.0 (via Docker)
- Redis 6+ (via Docker)
- VPS dengan minimal 2GB RAM, 20GB storage
