# Project Review And Remediation Plan

Tanggal review: 2026-05-10

Dokumen ini merangkum risiko, kekurangan, dan rencana perbaikan untuk project WhatsApp Gateway. Prioritas disusun dari dampak terbesar terhadap keamanan, stabilitas, dan pengalaman pengguna.

## Ringkasan Alur Project

Project ini adalah aplikasi SaaS WhatsApp Gateway dengan komponen utama:

- Frontend Next.js untuk dashboard pengguna.
- Backend Fastify dengan API versi `/v1`.
- Prisma dan MySQL untuk data utama.
- Redis dan BullMQ untuk queue message/blast/cron.
- Baileys untuk koneksi WhatsApp dan pengiriman pesan.
- WebSocket untuk QR, status device, progress blast, dan live chat event.
- AI auto-responder dengan knowledge base/RAG.

Alur utama:

1. User login/register, lalu frontend menyimpan JWT.
2. User membuat device, backend membuat session Baileys dan mengirim QR lewat WebSocket.
3. User mengirim pesan single atau blast.
4. Backend menyimpan log pesan, mengirim langsung atau memasukkan job ke Redis queue.
5. Baileys menerima pesan masuk, backend menyimpan inbox, mengirim event WebSocket, trigger webhook, dan menjalankan auto-responder bila aktif.

## Jawaban Cepat Untuk Pertanyaan Arsitektur Baru

### 1. Apakah project ini sudah stateless?

Jawaban: belum sepenuhnya stateless.

Bagian yang sudah mendekati stateless:

- API HTTP memakai JWT, sehingga request API tidak bergantung pada session server HTTP.
- Data utama sudah disimpan di MySQL.
- Queue sudah memakai Redis/BullMQ.

Bagian yang masih stateful:

- `sessionManager` menyimpan session Baileys aktif di memory process.
- WebSocket client disimpan di memory process.
- Session WhatsApp bisa disimpan lokal di `SESSION_DIR` bila S3 belum dipakai.
- Upload media disimpan lokal di folder `uploads`.
- Worker dan API masih bisa berada dalam process yang sama untuk beberapa flow.

Implikasi:

- Jika backend dijalankan multi instance tanpa desain ownership session, satu device/session bisa bentrok antar instance.
- Jika container restart, local session/upload bisa hilang kecuali volume dipasang benar.
- WebSocket event tidak otomatis tersebar antar instance kecuali memakai Redis pub/sub atau message broker.

Target perbaikan:

- Jadikan API stateless untuk HTTP.
- Pisahkan worker dan Baileys session runtime dari API.
- Gunakan S3/object storage untuk session dan media.
- Tambahkan Redis pub/sub untuk WebSocket broadcast antar instance.
- Tambahkan distributed lock atau device ownership agar satu device hanya aktif di satu worker/instance.

### 2. Apakah database sudah support high availability dan multi instance?

Jawaban: belum dari konfigurasi repository saat ini.

Kondisi sekarang:

- `docker-compose.yml` memakai satu container MySQL.
- Prisma memakai satu `DATABASE_URL`.
- Belum ada konfigurasi read replica, failover, backup otomatis, atau connection pooler/proxy.

Yang dibutuhkan untuk HA:

- Gunakan managed MySQL HA atau cluster MySQL, misalnya primary-replica dengan failover.
- Tambahkan backup otomatis dan restore drill.
- Gunakan connection pooling atau proxy yang kompatibel dengan Prisma.
- Pisahkan konfigurasi `DATABASE_URL` production dari development.
- Pastikan migration Prisma dijalankan satu kali, bukan oleh semua instance bersamaan.

### 3. Frontend admin dan user sebaiknya dipisah?

Jawaban: iya. Keputusan terbaru: frontend dipisah menjadi dua aplikasi terpisah.

Target pemisahan:

- `frontend-user`: dashboard user untuk operasional WhatsApp Gateway.
- `frontend-admin`: dashboard admin untuk monitoring, management, security, billing, content, dan support.
- Keduanya tetap stateless di sisi frontend, tidak menyimpan state server-side yang wajib sticky session.
- Keduanya memakai backend API yang sama, auth token yang valid, dan permission model yang sama.

Alasan:

- Admin dan user punya workflow yang berbeda.
- UI admin butuh monitoring, user management, billing, audit, security, dan support tools.
- UI user butuh devices, contacts, send message, blast, chat, templates, API keys, webhooks, media, dan knowledge base.
- Deployment, permission, dan navigasi menjadi lebih jelas.

Kebutuhan penting:

- Admin tetap bisa masuk ke konteks user untuk membantu membuat device, cek campaign, debugging, dan management support.
- Akses admin ke konteks user harus menggunakan mekanisme impersonation/delegated access yang aman.
- Semua aksi admin di konteks user wajib memiliki audit log.
- Admin tidak boleh memakai password user.
- Token impersonation harus scoped, time-limited, dan jelas mencatat `adminId`, `targetUserId`, alasan akses, waktu mulai, dan waktu selesai.
- Frontend admin bisa membuka user workspace dengan mode "acting as user" tanpa mengubah ownership data.

Rekomendasi struktur:

- `frontend-user/`
  - Login/register user.
  - Dashboard user.
  - Device management.
  - Send message.
  - Blast campaign.
  - Live chat.
  - Contacts, tags, templates, media.
  - API keys, webhooks, documentation API.
  - Profile dan security settings.
- `frontend-admin/`
  - Login admin.
  - Admin dashboard dan monitoring.
  - User management.
  - Subscription plan dan billing management.
  - Queue, device, webhook, AI, dan system monitoring.
  - Content/security management.
  - Audit log.
  - Impersonation/delegated support mode.

Backend yang perlu disiapkan:

- Endpoint auth admin dan user boleh tetap satu domain API, tetapi role/permission harus kuat.
- Tambahkan endpoint admin untuk membuat token impersonation.
- Tambahkan middleware yang mengenali actor asli:
  - `actorUserId`: admin yang melakukan aksi.
  - `effectiveUserId`: user yang sedang diakses.
  - `impersonationSessionId`: sesi support/admin access.
- Tambahkan audit log untuk semua aksi sensitif.

### 4. Perlu halaman dokumentasi API untuk user?

Jawaban: iya, perlu halaman dokumentasi API user-facing yang lengkap di frontend.

Isi minimum:

- Quick start.
- Authentication dengan API key.
- Base URL.
- Format response sukses/error.
- Endpoint send message.
- Endpoint message logs.
- Endpoint devices.
- Endpoint contacts.
- Endpoint templates.
- Endpoint blast campaign.
- Endpoint media upload.
- Endpoint webhook setup dan payload event.
- Rate limit, quota, error code, dan contoh request/response.
- Code examples untuk cURL, JavaScript/Node.js, PHP, dan Python.

Dokumentasi detail yang harus dibuat:

- Penjelasan aplikasi:
  - Apa itu WhatsApp Gateway.
  - Komponen utama aplikasi.
  - Perbedaan user dashboard dan admin dashboard.
  - Kapan memakai API, webhook, blast, live chat, dan auto-responder.
- Cara kerja:
  - Alur login dan API key.
  - Alur koneksi device dan scan QR.
  - Alur kirim pesan single.
  - Alur blast campaign dan queue.
  - Alur pesan masuk, webhook, live chat, dan auto-responder.
  - Alur media upload.
  - Alur knowledge base dan AI responder.
- Dokumentasi API lengkap:
  - Base URL.
  - Authentication header `x-api-key`.
  - Format response standar.
  - Format error standar.
  - Pagination/filtering bila tersedia.
  - Rate limit dan quota.
  - Endpoint devices.
  - Endpoint messages.
  - Endpoint blast.
  - Endpoint contacts dan groups.
  - Endpoint tags.
  - Endpoint templates.
  - Endpoint media.
  - Endpoint webhooks.
  - Endpoint API keys.
  - Endpoint knowledge base.
  - Webhook event payload dan signature verification.
  - Error code reference.
  - Changelog API.

### 5. Auth tidak boleh menampilkan default admin/password

Jawaban: benar. Login page harus kosong.

Yang harus dikerjakan:

- Hapus default value/admin credential dari form login.
- Jangan tampilkan credential seed di UI.
- Jika perlu demo mode, aktifkan hanya lewat flag env khusus development.
- Ubah dokumentasi agar credential default hanya ada di local setup docs, bukan di UI production.

### 6. Perlu page register, lupa password, dan ganti profile untuk user/admin?

Jawaban: iya.

Yang harus dibuat:

- Register page.
- Forgot password page.
- Reset password page via token email.
- Profile page untuk update nama, email, phone, timezone, working hours.
- Change password page.
- Admin profile/settings page.
- Security page untuk API key, active sessions, dan audit aktivitas penting.

## High Risk

### 1. Scheduled message tidak diproses otomatis

Masalah:

- Endpoint single message bisa memasukkan pesan ke `message-queue`.
- Worker untuk queue tersebut ada di `src/workers/messageWorker.ts`.
- Namun server default hanya menjalankan `blastWorker` dan `cronWorker`.
- `docker-compose.yml` juga belum menjalankan service worker message terpisah.

Dampak:

- Pesan yang dijadwalkan atau tertahan working-hours bisa tetap `PENDING`.
- User mengira pesan sudah dijadwalkan, tetapi tidak pernah terkirim.

Yang harus dikerjakan:

- Tambahkan worker message ke runtime.
- Pilih salah satu pendekatan:
  - Jalankan `messageWorker` dari `server.ts`, atau
  - Buat service Docker terpisah untuk `npm run worker:message`.
- Tambahkan health/logging khusus untuk queue message.
- Tambahkan test integrasi sederhana: create scheduled message, pastikan job diproses dan status berubah dari `PENDING` ke `SENT` atau `FAILED`.

Prioritas: P0

### 2. Validasi kepemilikan device belum konsisten

Masalah:

- Beberapa controller menerima `deviceId` dari request tanpa memastikan device itu milik `ownerId`.
- Jalur rawan meliputi kirim pesan single, blast, auto-responder create, webhook create, dan knowledge base create.

Dampak:

- User berpotensi mengirim pesan, blast, webhook, atau knowledge base ke device milik user lain jika mengetahui `deviceId`.
- Ini adalah boundary authorization utama untuk aplikasi multi-tenant.

Yang harus dikerjakan:

- Buat helper/service shared, misalnya `assertDeviceOwnership(deviceId, ownerId)`.
- Terapkan di semua endpoint yang menerima `deviceId`.
- Gunakan `ownerId`, bukan selalu `id`, agar agent/sub-user tetap mengikuti owner tenant.
- Tambahkan test authorization:
  - User A tidak bisa akses device User B.
  - Agent hanya bisa akses device owner sesuai permission.

Prioritas: P0

### 3. WebSocket belum aman untuk multi-user

Masalah:

- WebSocket subscribe memakai payload `userId`/`deviceId` dari client tanpa verifikasi token.
- Backend tidak memvalidasi JWT pada koneksi WebSocket.
- Filter event berdasarkan `deviceId` belum ketat; client tanpa deviceId masih bisa menerima event device.

Dampak:

- Event QR, status device, blast progress, dan live chat bisa bocor antar user.
- QR WhatsApp adalah data sensitif karena bisa dipakai untuk login device.

Yang harus dikerjakan:

- Kirim JWT saat connect WebSocket, misalnya query `?token=...` atau message auth pertama.
- Validasi token di backend sebelum menerima subscribe.
- Simpan `ownerId` dan daftar device yang boleh diakses oleh client.
- Ubah broadcast agar event device hanya dikirim ke client yang berhak.
- Tambahkan reconnect logic yang benar di frontend, karena saat ini `onclose` hanya mengosongkan ref tetapi tidak membuat koneksi baru.

Prioritas: P0

### 4. Aplikasi belum siap full stateless multi-instance

Masalah:

- Baileys session aktif disimpan di memory process.
- WebSocket clients disimpan di memory process.
- Media upload dan session WhatsApp masih bisa disimpan lokal.
- Belum ada distributed lock untuk memastikan satu device hanya aktif di satu instance.

Dampak:

- Saat scale horizontal, satu device bisa diproses oleh lebih dari satu instance.
- Event WebSocket bisa hanya muncul di instance tertentu.
- Restart container bisa menyebabkan kehilangan file session/media bila storage tidak persistent.

Yang harus dikerjakan:

- Pisahkan API, worker message, worker blast, cron, dan WhatsApp session worker.
- Gunakan S3/object storage untuk media dan auth/session file.
- Gunakan Redis pub/sub untuk broadcast WebSocket antar instance.
- Gunakan distributed lock per device, misalnya Redis lock, agar satu device hanya aktif di satu runtime.
- Dokumentasikan mode deployment single instance vs multi instance.

Prioritas: P0

### 5. Database belum high available

Masalah:

- Setup saat ini memakai satu MySQL container.
- Tidak ada failover, replica, backup policy, atau migration lock strategy production.

Dampak:

- Jika MySQL mati, semua fitur inti berhenti.
- Risiko data loss lebih tinggi.
- Multi-instance backend tidak otomatis berarti database ikut HA.

Yang harus dikerjakan:

- Tentukan target production database: managed MySQL HA atau self-hosted cluster.
- Tambahkan backup otomatis, retention backup, dan prosedur restore.
- Gunakan connection pooling/proxy bila diperlukan.
- Pastikan Prisma migration hanya dijalankan oleh satu job release/deploy.
- Tambahkan health check database dan alerting.

Prioritas: P0/P1

## Medium Risk

### 6. Knowledge base rawan ownership bypass dan SSRF

Masalah:

- `createKnowledgeBase` melakukan upsert berdasarkan `deviceId` tanpa cek device milik user.
- URL ingestion melakukan request server-side ke URL input user.

Dampak:

- User bisa membuat/mengubah knowledge base untuk device yang bukan miliknya.
- Fitur ingestion URL berisiko SSRF ke private/internal network.

Yang harus dikerjakan:

- Validasi ownership device sebelum create/update knowledge base.
- Batasi URL ingestion hanya `http` dan `https`.
- Blok private IP, localhost, link-local, metadata service, dan redirect ke private address.
- Tambahkan batas ukuran response dan content-type.
- Pindahkan ingestion panjang ke queue agar tidak berjalan sebagai background promise di request handler.

Prioritas: P1

### 7. Upload media perlu hardening

Masalah:

- Nama file memakai `data.filename` langsung.
- Validasi MIME, extension, dan ukuran masih minimal.
- File disimpan lokal, sementara deployment container bisa ephemeral kecuali volume disiapkan.

Dampak:

- Risiko path/name abuse, overwrite naming edge case, file berbahaya, dan file hilang saat deploy.
- Blast media bisa gagal jika URL tidak dapat diakses Baileys atau file tidak persistent.

Yang harus dikerjakan:

- Generate nama file acak dengan extension aman.
- Sanitize original filename hanya untuk display.
- Whitelist MIME/extension sesuai kebutuhan: image, pdf, doc, docx, xlsx, csv, dan sebagainya.
- Tambahkan scan atau batas content-type bila production.
- Pertimbangkan S3/object storage untuk media seperti session auth yang sudah punya opsi S3.

Prioritas: P1

### 8. Secret dan konfigurasi production belum fail-fast

Masalah:

- `JWT_SECRET` default ke `changeme`.
- `docker-compose.yml` belum mengisi JWT secret, Midtrans key, AI key, BASE_URL, dan konfigurasi penting lain.
- `DATABASE_URL` bisa kosong tanpa validasi startup yang eksplisit.

Dampak:

- Deployment production bisa berjalan dengan secret lemah.
- Error konfigurasi muncul terlambat pada runtime.

Yang harus dikerjakan:

- Buat validasi env dengan schema, misalnya `zod` atau validasi manual.
- Di production, aplikasi harus gagal start jika secret/key wajib kosong.
- Tambahkan `.env.example` lengkap untuk backend dan frontend.
- Jangan gunakan default secret untuk production.

Prioritas: P1

### 9. Quota dan billing belum transaksional

Masalah:

- Blast menaikkan `messagesSentThisMonth` saat job dibuat, bukan saat pesan benar-benar terkirim.
- Single scheduled message tidak selalu increment quota saat worker mengirim.
- Update quota tidak dibungkus transaksi dengan pembuatan job/recipient.

Dampak:

- Kuota bisa tidak akurat.
- User bisa terkena potong quota untuk pesan gagal, atau sebaliknya scheduled message terkirim tanpa increment.

Yang harus dikerjakan:

- Tentukan aturan bisnis: quota dipotong saat queued atau saat sent.
- Terapkan konsisten di single message, scheduled message, blast, dan auto-responder.
- Gunakan transaksi saat membuat blast job dan recipients.
- Untuk worker, increment quota hanya saat status final sesuai aturan.

Prioritas: P1

### 10. Frontend admin dan user belum dipisah menjadi dua aplikasi

Masalah:

- Admin, user dashboard, billing, monitoring, dan management content masih berada dalam satu aplikasi frontend.
- Kebutuhan terbaru meminta dua frontend terpisah: user app dan admin app.
- Admin tetap harus bisa masuk ke konteks user untuk support dan management, tetapi lewat flow aman dan diaudit.

Dampak:

- UX admin dan user bercampur.
- Risiko user melihat menu/halaman yang bukan haknya.
- Monitoring/admin task sulit dikembangkan tanpa mengganggu workflow user.
- Jika impersonation tidak dirancang, admin support bisa berisiko memakai akses yang tidak tercatat.

Yang harus dikerjakan:

- Buat dua aplikasi frontend:
  - `frontend-user`.
  - `frontend-admin`.
- Pastikan kedua frontend tetap stateless.
- Buat auth guard masing-masing aplikasi.
- Buat permission matrix untuk user, agent, admin, dan super admin.
- Buat mekanisme admin impersonation/delegated access:
  - admin memilih target user.
  - sistem membuat session impersonation terbatas.
  - semua aksi mencatat actor admin dan effective user.
  - user data tetap milik user, bukan admin.
- Tambahkan halaman admin:
  - monitoring system
  - user management
  - plan/billing management
  - content/security management
  - device/user support mode
  - audit log
- Tambahkan halaman user:
  - dashboard operasional
  - devices
  - send message
  - blast
  - live chat
  - contacts/tags
  - templates
  - media
  - API keys
  - webhooks
  - API documentation
  - profile/security

Prioritas: P1

### 11. Halaman dokumentasi API user-facing belum lengkap

Masalah:

- Dokumentasi ada di folder docs, tetapi user aplikasi membutuhkan halaman frontend yang rapi, searchable, dan langsung bisa dipakai.

Dampak:

- User integrator sulit memakai API.
- Support burden meningkat karena contoh request/response tidak tersedia dalam dashboard.

Yang harus dikerjakan:

- Buat halaman frontend documentation di `frontend-user`.
- Tambahkan struktur:
  - overview
  - cara kerja aplikasi
  - authentication
  - rate limit dan quota
  - send message
  - blast
  - devices
  - contacts
  - templates
  - media
  - webhooks
  - errors
  - SDK/code examples
- Tambahkan dokumentasi admin di `frontend-admin` untuk operator:
  - monitoring
  - user management
  - impersonation/support access
  - audit log
  - security policy
- Tambahkan copyable code block.
- Tambahkan contoh cURL, JavaScript/Node.js, PHP, dan Python.
- Tambahkan daftar error code dan response schema.

Prioritas: P1

## Low Risk

### 12. Encoding dokumentasi dan komentar terlihat rusak

Masalah:

- Banyak karakter di README/docs/kode tampil sebagai mojibake, misalnya simbol emoji dan garis komentar rusak.

Dampak:

- Dokumentasi kurang rapi.
- Developer baru bisa bingung saat membaca komentar.

Yang harus dikerjakan:

- Pastikan semua file disimpan sebagai UTF-8.
- Rapikan README dan docs yang rusak.
- Hindari dekorasi komentar panjang yang mudah rusak lint/encoding.

Prioritas: P2

### 13. ESLint frontend belum dikonfigurasi

Masalah:

- `npm run lint` masih memicu prompt konfigurasi Next.js.

Dampak:

- CI/lokal tidak bisa menjalankan lint non-interaktif.
- Bug frontend lebih mudah lolos.

Yang harus dikerjakan:

- Tambahkan konfigurasi ESLint Next.js.
- Pastikan `npm run lint` berjalan tanpa prompt.
- Tambahkan lint ke CI.

Prioritas: P2

### 14. Build frontend terhambat artefak `.next`

Masalah:

- `npm run build` frontend gagal pada `EPERM` saat membuka `.next/trace`.

Dampak:

- Build lokal/CI bisa gagal karena file lock atau permission.
- Sulit membedakan error permission dari error kode.

Yang harus dikerjakan:

- Pastikan tidak ada proses Next.js/Node yang mengunci `.next`.
- Bersihkan `.next` sebelum build di CI.
- Jika terjadi di Windows, cek permission dan antivirus/file watcher.
- Tambahkan script build bersih, misalnya `clean && next build`.

Prioritas: P2

### 15. Dokumentasi deployment belum selaras dengan worker

Masalah:

- Dokumentasi dan compose belum jelas membedakan backend API, blast worker, message worker, dan cron worker.

Dampak:

- Deployment production mudah salah, terutama untuk queue.

Yang harus dikerjakan:

- Update `docs/RUNNING.md` dan `docs/deployment.md`.
- Jelaskan service wajib:
  - backend API
  - Redis
  - MySQL
  - message worker
  - blast worker
  - cron worker
- Tambahkan contoh Docker Compose production.

Prioritas: P2

### 16. Auth dan account pages belum lengkap

Masalah:

- Login tidak boleh menampilkan default admin/password.
- Register, forgot password, reset password, profile, dan change password perlu dirapikan sebagai flow resmi.

Dampak:

- Pengalaman onboarding belum lengkap.
- Risiko credential demo terlihat di production.
- User/admin tidak punya self-service account management yang cukup.

Yang harus dikerjakan:

- Kosongkan form login.
- Buat atau rapikan halaman register.
- Buat forgot password dan reset password berbasis token email.
- Buat profile page user dan admin.
- Buat change password page.
- Tambahkan validasi password policy.
- Tambahkan security settings untuk API keys dan active sessions.

Prioritas: P2

## Kekurangan Produk Dan Arsitektur

### Observability belum cukup untuk production

Kekurangan:

- Sudah ada Prometheus/Grafana, tetapi event bisnis penting belum terlihat lengkap.
- Belum ada dashboard untuk queue lag, failed jobs, reconnect Baileys, webhook failures, dan AI failures.

Yang harus dikerjakan:

- Tambahkan metric:
  - jumlah pesan sent/failed/pending
  - queue waiting/active/failed/delayed
  - device connected/disconnected
  - webhook success/failure latency
  - AI provider failures
- Tambahkan structured logs dengan request id dan user/device context.

### Error handling dan validation masih tersebar

Kekurangan:

- Banyak endpoint menerima body dengan casting TypeScript, tetapi tanpa schema runtime.

Yang harus dikerjakan:

- Tambahkan validation schema per route.
- Standardisasi response error.
- Validasi enum, tanggal schedule, URL, phone number, dan payload multipart.

### Permission agent belum terlihat diterapkan merata

Kekurangan:

- Model user punya `AGENT`, `parentId`, dan `permissions`.
- Namun endpoint banyak hanya memakai `ownerId` tanpa cek permission granular.

Yang harus dikerjakan:

- Definisikan permission matrix.
- Terapkan middleware permission per fitur:
  - devices
  - send
  - blast
  - contacts
  - chat
  - templates
  - media
  - billing/admin

### Data retention perlu aturan yang jelas

Kekurangan:

- Cron menghapus pesan lama, tetapi belum jelas apakah ini sesuai kebutuhan user dan billing plan.

Yang harus dikerjakan:

- Tentukan retention per plan.
- Simpan audit/payment/admin log lebih lama dari message log bila perlu.
- Dokumentasikan kebijakan retention.

### Stateless dan high availability perlu desain eksplisit

Kekurangan:

- Project belum memiliki dokumen deployment mode untuk single instance, multi instance, dan HA.
- Belum ada pemisahan jelas antara API stateless, worker queue, WhatsApp session runtime, dan WebSocket gateway.

Yang harus dikerjakan:

- Buat dokumen arsitektur deployment.
- Pindahkan konfigurasi infrastruktur ke folder root `Infrastruktur`.
- Definisikan komponen stateful:
  - MySQL
  - Redis
  - object storage
  - Baileys session runtime
  - WebSocket gateway
- Definisikan strategi scaling masing-masing komponen.
- Tambahkan diagram arsitektur target production.
- Tambahkan runbook backup, restore, deploy, scaling, dan incident response.

### Frontend admin dan user perlu information architecture baru

Kekurangan:

- Admin dan user membutuhkan aplikasi frontend yang berbeda.
- Admin fokus pada monitoring, management, security, plan, billing, audit.
- User fokus pada operasional WhatsApp gateway: devices, contacts, send, blast, templates, chat, API keys, webhooks, media, knowledge.
- Admin tetap butuh kemampuan masuk ke konteks user secara aman untuk support.

Yang harus dikerjakan:

- Buat struktur repo dua frontend.
- Buat sitemap admin dan user secara terpisah.
- Buat permission matrix per menu.
- Buat auth guard dan layout terpisah di masing-masing frontend.
- Buat desain navigation yang tidak mencampur admin task dan user task.
- Buat desain impersonation yang mencatat audit.

### Dokumentasi API frontend perlu dibuat sebagai produk

Kekurangan:

- Dokumentasi API belum menjadi bagian kuat dari dashboard user.
- User butuh contoh integrasi yang dapat langsung dipakai.
- Dokumentasi belum cukup menjelaskan aplikasi secara utuh, cara kerja, dan API end-to-end.

Yang harus dikerjakan:

- Buat halaman docs interaktif.
- Jelaskan aplikasi secara detail: konsep, fitur, role, alur operasional, dan batasan.
- Jelaskan cara kerja end-to-end: device, message, blast, webhook, live chat, auto-responder, media, knowledge.
- Tambahkan code sample multi bahasa.
- Tambahkan contoh webhook payload dan signature verification.
- Tambahkan sandbox/test API key bila nanti diperlukan.

## Rencana Pengerjaan Bertahap

## Phase 1 - Security And Correctness

Target: menutup risiko P0.

Checklist:

- [ ] Tambahkan worker message ke runtime atau Docker service.
- [ ] Validasi ownership device di semua endpoint berbasis `deviceId`.
- [ ] Kunci WebSocket dengan JWT.
- [ ] Perbaiki broadcast WebSocket agar event hanya dikirim ke user/device yang berhak.
- [ ] Audit stateful component dan tentukan target stateless untuk API.
- [ ] Buat desain distributed lock per device untuk multi-instance.
- [ ] Tambahkan test authorization multi-user.
- [ ] Tambahkan test scheduled message queue.

Estimasi: 2-4 hari kerja.

## Phase 2 - Production Hardening

Target: stabil untuk deployment production.

Checklist:

- [ ] Validasi env dan fail-fast di production.
- [ ] Hardening upload media.
- [ ] Hardening URL ingestion knowledge base.
- [ ] Pindahkan knowledge ingestion ke queue.
- [ ] Rapikan quota logic agar konsisten dan transaksional.
- [ ] Update Docker Compose untuk semua worker.
- [ ] Pisahkan storage media/session ke object storage.
- [ ] Tambahkan Redis pub/sub untuk WebSocket multi-instance.
- [ ] Tentukan strategi database HA, backup, dan migration release job.

Estimasi: 3-5 hari kerja.

## Phase 3 - Two Frontend Apps And Admin Support Mode

Target: admin dan user menjadi dua aplikasi frontend terpisah, tetap stateless, dengan admin support mode yang aman.

Checklist:

- [ ] Buat keputusan nama folder final: `frontend-user` dan `frontend-admin`.
- [ ] Migrasikan dashboard user dari `frontend` ke `frontend-user`.
- [ ] Buat aplikasi `frontend-admin`.
- [ ] Buat sitemap admin.
- [ ] Buat sitemap user.
- [ ] Buat auth guard role/permission untuk masing-masing frontend.
- [ ] Buat admin dashboard untuk monitoring dan management.
- [ ] Buat user dashboard untuk operasional WhatsApp Gateway.
- [ ] Buat mekanisme admin impersonation/delegated access.
- [ ] Tambahkan audit log untuk aksi admin di konteks user.
- [ ] Pastikan kedua frontend tidak membutuhkan sticky session.

Estimasi: 4-7 hari kerja.

## Phase 4 - User Documentation And Account Flows

Target: onboarding user dan integrasi API lebih lengkap.

Checklist:

- [ ] Buat halaman dokumentasi API di `frontend-user`.
- [ ] Buat dokumentasi operator/admin di `frontend-admin`.
- [ ] Jelaskan aplikasi secara detail: konsep, role, fitur, dan batasan.
- [ ] Jelaskan cara kerja end-to-end: device, message, blast, webhook, live chat, auto-responder, media, knowledge.
- [ ] Tambahkan quick start dan API key guide.
- [ ] Tambahkan contoh request/response lengkap.
- [ ] Tambahkan code examples cURL, JavaScript/Node.js, PHP, dan Python.
- [ ] Tambahkan dokumentasi webhook dan error code.
- [ ] Kosongkan form login dari default credential.
- [ ] Buat atau rapikan register page.
- [ ] Buat forgot password dan reset password.
- [ ] Buat profile page untuk user dan admin.
- [ ] Buat change password dan security settings.

Estimasi: 5-8 hari kerja.

## Phase 5 - Quality And Maintainability

Target: meningkatkan maintainability dan developer workflow.

Checklist:

- [ ] Tambahkan ESLint frontend non-interaktif.
- [ ] Tambahkan CI untuk backend build, frontend build, lint, dan test.
- [ ] Rapikan encoding README/docs.
- [ ] Tambahkan `.env.example` lengkap.
- [ ] Update dokumentasi running/deployment.
- [ ] Tambahkan dashboard observability minimal untuk queue dan device status.
- [ ] Tambahkan dokumentasi arsitektur stateless, HA, dan scaling.
- [ ] Pindahkan dan rapikan konfigurasi infrastruktur ke folder `Infrastruktur`.

Estimasi: 3-6 hari kerja.

## Urutan Eksekusi Yang Disarankan

1. Perbaiki worker message agar scheduled message benar-benar terkirim.
2. Buat helper ownership device dan terapkan ke message, blast, webhook, auto-responder, knowledge.
3. Amankan WebSocket dengan JWT dan filter tenant.
4. Buat desain stateless dan distributed lock untuk device session.
5. Tentukan strategi database HA, backup, dan migration production.
6. Perbaiki Docker Compose agar backend dan semua worker berjalan jelas.
7. Tambahkan env validation dan `.env.example`.
8. Hardening upload media dan knowledge URL ingestion.
9. Rapikan quota/billing logic.
10. Pisahkan frontend menjadi `frontend-user` dan `frontend-admin`.
11. Buat admin impersonation/delegated support mode dengan audit log.
12. Buat halaman dokumentasi aplikasi dan API user-facing secara lengkap.
13. Buat folder dan struktur `Infrastruktur` untuk konfigurasi operasional.
14. Rapikan auth: login kosong, register, forgot password, reset password, profile, change password.
15. Tambahkan lint/CI/test.
16. Rapikan dokumentasi dan encoding.

## Definition Of Done

Perbaikan dianggap selesai bila:

- Scheduled message bisa diproses sampai status final.
- User tidak bisa mengakses resource tenant lain.
- WebSocket event tidak bocor antar user/device.
- Aplikasi gagal start di production bila secret/env wajib kosong.
- Upload media dan URL ingestion punya validasi aman.
- API HTTP siap dijalankan stateless.
- Device session punya strategi ownership/lock saat multi-instance.
- Database production punya strategi HA, backup, dan restore.
- Frontend admin dan user dipisah menjadi dua aplikasi stateless.
- Admin bisa masuk ke konteks user hanya melalui delegated access yang diaudit.
- Halaman dokumentasi aplikasi dan API tersedia lengkap untuk user.
- Folder `Infrastruktur` berisi struktur pengelolaan konfigurasi operasional.
- Auth/account flow lengkap tanpa default credential di UI.
- Frontend dan backend bisa build dari fresh checkout.
- Dokumentasi menjalankan aplikasi sesuai kondisi runtime sebenarnya.
