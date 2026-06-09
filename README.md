# Whatsappin

WhatsApp Gateway (SaaS) — Kirim & kelola pesan WhatsApp secara terprogram dengan REST API, AI Auto-Responder, Blast Campaign, dan Webhooks.

**Stack:** Node.js / Fastify / Prisma / MySQL / Redis / Baileys (Backend) · Next.js / Tailwind CSS (Frontend)

---

## Dokumentasi

| Tujuan | Link |
| --- | --- |
| Panduan Installasi & Konfigurasi | [docs/](docs/README.md) |
| API Reference | [`/api`](frontend/app/api/page.tsx) |
| Developer Guide | [`/docs`](frontend/app/docs/page.tsx) |
| Infrastruktur (Docker, deploy) | [Infrastruktur/](Infrastruktur/README.md) |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-repo/whatsapp-gateway.git
cd whatsapp-gateway/backend

# 2. Setup backend
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev
npm run dev

# 3. Setup frontend (terminal baru)
cd ../frontend
npm install
npm run dev
```

## Docker

```bash
# Development stack (MySQL + Redis + Backend + Frontend)
docker compose up -d --build

# Production stack (with Nginx + Monitoring)
docker compose -f Infrastruktur/docker-compose.prod.yml up -d --build
```

---

Built with ❤️ for scalability.
