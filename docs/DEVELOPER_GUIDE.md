# 🚀 Developer Integration Guide

Panduan ini ditujukan bagi developer yang ingin mengintegrasikan layanan WhatsApp Gateway ke dalam sistem mereka sendiri menggunakan **API Key**.

## 🔑 Autentikasi

Semua permintaan API harus menyertakan Header `x-api-key`.

1. Login ke Dashboard.
2. Buka menu **Settings**.
3. Klik **Generate New Key** pada bagian Developer API Keys.
4. Salin key tersebut dan simpan dengan aman.

**Header Format:**
```http
x-api-key: your_api_key_here
Content-Type: application/json
```

---

## 📱 1. Manage Devices (Perangkat)

Sebelum mengirim pesan, Anda harus memastikan perangkat terhubung.

### A. List Devices
Melihat semua perangkat yang Anda miliki.
*   **URL:** `GET /v1/devices`
*   **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dev_123",
      "name": "Marketing Phone",
      "status": "CONNECTED",
      "phoneNumber": "628123456789"
    }
  ]
}
```

### B. Device Status
Mengecek status spesifik satu perangkat.
*   **URL:** `GET /v1/devices/:id/status`
*   **Response:**
```json
{
  "success": true,
  "data": {
    "status": "CONNECTED",
    "phoneNumber": "628123456789",
    "pushName": "Business WA"
  }
}
```

---

## 💬 2. Mengirim Pesan (Messaging)

### A. Pesan Teks
*   **URL:** `POST /v1/messages/send`
*   **Body:**
```json
{
  "deviceId": "dev_123",
  "to": "628123456789",
  "type": "TEXT",
  "content": "Halo Dunia!"
}
```

### B. Pesan Media (Gambar/Dokumen)
*   **URL:** `POST /v1/messages/send`
*   **Body:**
```json
{
  "deviceId": "dev_123",
  "to": "628123456789",
  "type": "IMAGE",
  "content": "Caption gambar",
  "mediaUrl": "https://example.com/image.jpg"
}
```

### C. Pesan Terjadwal (Scheduling)
Gunakan format ISO 8601 untuk `scheduledAt`.
*   **Body:**
```json
{
  "deviceId": "dev_123",
  "to": "628123456789",
  "type": "TEXT",
  "content": "Pesan terjadwal",
  "scheduledAt": "2026-03-20T10:00:00Z"
}
```

---

## 👥 3. Kontak & Grup (Contacts)

### A. Tambah Kontak
*   **URL:** `POST /v1/contacts`
*   **Body:**
```json
{
  "name": "Budi",
  "phone": "6285211223344",
  "email": "budi@mail.com",
  "groupId": "group_abc"
}
```

### B. List Groups
*   **URL:** `GET /v1/contacts/groups`

---

## 📝 4. Message Templates

Gunakan template untuk standarisasi pesan.
*   **List Templates:** `GET /v1/templates`
*   **Create Template:** `POST /v1/templates`
```json
{
  "name": "OTP Template",
  "content": "Kode OTP Anda adalah: {{code}}"
}
```

---

## 🔗 5. Webhooks

Dapatkan notifikasi real-time saat ada pesan masuk atau perubahan status.
*   **Register Webhook:** `POST /v1/webhooks`
*   **Body:**
```json
{
  "url": "https://your-server.com/callback",
  "secret": "my_secret_key"
}
```
*Sistem akan mengirimkan POST request ke URL tersebut dengan signature HMAC SHA256.*

---

## 💳 6. Billing & Quota

Mengecek penggunaan dan sisa kuota.
*   **URL:** `GET /v1/billing/me`
*   **Response:**
```json
{
  "success": true,
  "data": {
    "plan": "Pro",
    "messagesSentThisMonth": 450,
    "maxMessagesPerMonth": 5000,
    "deviceQuota": 5,
    "devicesUsed": 2
  }
}
```

---

## 💻 Contoh Implementasi (Node.js)

```javascript
const axios = require("axios");

const api = axios.create({
  baseURL: "http://localhost:3001/v1",
  headers: { "x-api-key": "your_api_key" }
});

async function send() {
  const res = await api.post("/messages/send", {
    deviceId: "your_id",
    to: "62812...",
    content: "Hi!"
  });
  console.log(res.data);
}
```

---

## ⚠️ Batasan (Limits)
1. **Rate Limit**: 100 req/min.
2. **Safety**: Jeda antar pesan minimal 3-5 detik sangat disarankan.
