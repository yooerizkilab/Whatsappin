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

## 💬 1. Mengirim Pesan (Send Message)

Endpoint ini digunakan untuk mengirim pesan tunggal secara real-time atau terjadwal.

- **URL:** `POST /messages/send`
- **Method:** `POST`

### A. Pesan Teks (Teks Biasa)

**Request Body:**

```json
{
  "deviceId": "device_id_anda",
  "to": "628123456789",
  "type": "TEXT",
  "content": "Halo, ini pesan dari API!"
}
```

### B. Pesan Gambar / Dokumen

**Request Body:**

```json
{
  "deviceId": "device_id_anda",
  "to": "628123456789",
  "type": "IMAGE",
  "content": "Lihat gambar ini",
  "mediaUrl": "https://example.com/image.jpg"
}
```

### C. Pesan Terjadwal (Scheduling)

Tambahkan field `scheduledAt` dengan format ISO 8601.

```json
{
  "deviceId": "device_id_anda",
  "to": "628123456789",
  "type": "TEXT",
  "content": "Pesan ini akan dikirim besok",
  "scheduledAt": "2026-03-09T09:00:00Z"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "msg_123456",
    "status": "SENT"
  }
}
```

---

## 📱 2. Cek Status Perangkat (Device Status)

Pastikan perangkat WhatsApp Anda dalam status `CONNECTED` sebelum mengirim pesan.

- **URL:** `GET /devices/:id/status`
- **Method:** `GET`

**Response Example:**

```json
{
  "success": true,
  "data": {
    "status": "CONNECTED",
    "phoneNumber": "628123456789",
    "pushName": "My Business WA"
  }
}
```

---

## 📊 3. Mengambil Log Pesan (Message Logs)

Mengecek status pengiriman pesan yang sudah dikirim.

- **URL:** `GET /messages/logs`
- **Method:** `GET`
- **Query Params:** `deviceId`, `status`, `limit`, `offset`

**Contoh Request:** `/messages/logs?status=FAILED&limit=10`

---

## 💻 Contoh Implementasi (Code Examples)

### Menggunakan cURL

```bash
curl -X POST http://localhost:3001/messages/send \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "123",
    "to": "628123456789",
    "type": "TEXT",
    "content": "Hello World"
  }'
```

### Menggunakan Node.js (Axios)

```javascript
const axios = require("axios");

const sendMessage = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3001/messages/send",
      {
        deviceId: "your_device_id",
        to: "628123456789",
        type: "TEXT",
        content: "Hello from Node.js",
      },
      {
        headers: {
          "x-api-key": "your_api_key",
        },
      },
    );
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};

sendMessage();
```

---

## ⚠️ Batasan (Limits)

1. **Kuota**: Tergantung pada paket langganan Anda. Cek kuota di `GET /billing/me`.
2. **Rate Limit (API)**:
   - Maksimal **100 request per menit** per User/IP.
   - Jika melampaui batas, server akan mengembalikan error `429 Too Many Requests`.
3. **WhatsApp Safety**: Disarankan untuk tidak mengirim lebih dari 1 pesan per detik secara terus-menerus guna menghindari deteksi spam oleh sistem WhatsApp.
