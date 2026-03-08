# Dokumentasi API & WebSocket

Bagian ini berisi referensi teknis untuk integrasi dengan API WhatsApp Gateway.

## 🔌 Keamanan & Autentikasi

Seluruh API (kecuali rute publik) diamankan menggunakan salah satu metode berikut:

1.  **Bearer Token JWT** (Direkomendasikan untuk Frontend):
    Header: `Authorization: Bearer <token_anda>`
2.  **API Key** (Direkomendasikan untuk Integrasi Script/Server):
    Header: `x-api-key: <api_key_anda>`

> API Key dapat digenerate secara mandiri melalui menu **Settings** di Dashboard.

### 1. Authentication (`/api/auth`)

- **`POST /register`**: Mendaftarkan akun baru.
- **`POST /login`**: Mendapatkan token JWT.
  - Payload: `{ "email": "...", "password": "..." }`
- **`GET /me`**: Mendapatkan profil pengguna yang sedang login.
- **`PUT /profile`**: Memperbarui Nama, Email, dan No Telepon.
- **`PUT /profile/password`**: Mengganti password user.

---

### 2. Devices - Perangkat WA (`/api/devices`)

- **`GET /`**: Menampilkan daftar semua sesi perangkat.
- **`POST /connect`**: Inisialisasi koneksi perangkat baru (QR Code).
- **`GET /:id/status`**: Cek status koneksi perangkat tertentu.
- **`DELETE /:id`**: Putus koneksi dan hapus sesi perangkat.

---

### 3. Messaging - Pesan (`/api/messages`)

- **`POST /send`**: Mengirim pesan real-time.
  - Payload: `{ "deviceId": "...", "to": "6281...", "type": "TEXT", "content": "Halo!" }`
  - Mendukung `"type": "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO"` dengan parameter `mediaUrl`.
- **`GET /logs`**: Riwayat pengiriman pesan.
- **`POST /blast`**: Membuat kampanye broadcast masal.
- **`GET /blast`**: Daftar semua kampanye blast.
- **`GET /blast/:id`**: Detail status pekerjaan blast tertentu.

---

### 4. Contacts & Groups (`/api/contacts`)

- **`GET /`**: Daftar semua kontak.
- **`POST /`**: Tambah kontak baru.
- **`PUT /:id`**: Update data kontak.
- **`DELETE /:id`**: Hapus kontak.
- **`POST /import`**: Impor kontak dari CSV.
- **`GET /groups`**: Daftar grup kontak.
- **`POST /groups`**: Buat grup kontak baru.

---

### Tags / Segments (`/api/tags`)

Manage contact segments with custom colors.

- **GET `/`**: List all tags.
- **POST `/`**: Create a new tag.
  - Body: `{ "name": "VIP", "color": "#ff0000" }`
- **PUT `/:id`**: Update a tag.
- **DELETE `/:id`**: Delete a tag.

---

### Media

- `GET /api/media` - List media items
- `POST /api/media` - Upload media
- `DELETE /api/media/:id` - Delete media

---

### Agents

- `GET /api/agents` - List team members
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

---

### 5. Analytics Dashboard (`/api/analytics`)

Statistik performa pesan dan kampanye.

- **`GET /summary`**: Angka statistik umum (Total Sent, Pending, Failed, Success Rate).
- **`GET /chart`**: Data volume pesan harian untuk grafik.
- **`GET /blasts`**: Statistik performa kampanye blast terbaru.

---

### 6. Media Library & Storage (`/api/media`)

Penyimpanan aset media internal.

- **`GET /`**: Daftar semua file yang diunggah.
- **`POST /upload`**: Mengunggah file baru (Multipart).
- **`DELETE /:id`**: Menghapus file dari library.

---

### 7. Templates (`/api/templates`)

- **`GET /`**: Daftar template pesan.
- **`POST /`**: Buat template baru.
- **`PUT /:id`**: Update template.
- **`DELETE /:id`**: Hapus template.

---

### 8. Auto Responder (`/api/auto-responder`)

- **`GET /`**: Daftar auto-responder.
- **`POST /`**: Buat auto-responder baru.
- **`GET /:id`**: Detail auto-responder.
- **`PUT /:id`**: Update auto-responder.
- **`DELETE /:id`**: Hapus auto-responder.
- **`POST /:id/rules`**: Tambah aturan (_rule_) pada auto-responder.

---

### 9. Webhooks (`/api/webhooks`)

- **`GET /`**: Daftar webhook terdaftar.
- **`POST /`**: Daftarkan URL webhook baru.
- **`PUT /:id`**: Update konfigurasi webhook.
- **`DELETE /:id`**: Hapus webhook.

---

### 10. Billing & Plans (`/api/billing`)

- **`GET /plans`** (Publik): Daftar paket langganan yang tersedia.
- **`POST /webhook`** (Publik): Endpoint untuk notifikasi Midtrans.
- **`POST /checkout`**: Inisialisasi pembayaran (Midtrans SNAP).
- **`GET /me`**: Status tagihan dan kuota pengguna saat ini.

---

### 11. Chats (`/api/chats`)

- **`GET /`**: Daftar percakapan aktif.
- **`GET /history`**: Riwayat pesan dalam percakapan tertentu.

---

### 12. Admin Management (`/api/admin`)

_Hanya dapat diakses oleh pengguna dengan role Admin._

- **Plans**: `GET`, `POST`, `PUT`, `DELETE` pada `/plans`.
- **Users**: `GET /users` (Daftar user), `PUT /users/:id/subscription` (Update manual langganan user).

---

## 📡 WebSocket Server (Real-time Updates)

Koneksi tersedia di: `ws://localhost:3001/ws`

Digunakan untuk sinkronisasi live:

- Status koneksi perangkat (QR Code, Connected, Disconnected).
- Status pengiriman pesan (Sent, Delivered, Read).
- Notifikasi sistem lainnya.
