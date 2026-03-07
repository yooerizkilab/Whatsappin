# Roadmaps & Ide Pengembangan

Project ini dibangun dengan arsitektur skalabel sehingga sangat mudah untuk dikembangkan menjadi SaaS tingkat lanjut. Berikut adalah beberapa fitur potensial untuk pengembangan berikutnya:

1. ~~**🤖 Auto-Responder / Chatbot Builder**~~ (✅ Selesai)
   Membuat fitur _keyword detection_ atau visual flow builder yang membalas pesan secara otomatis tanpa campur tangan admin.
2. ~~**🔗 Webhook Management**~~ (✅ Selesai)
   Kemampuan meneruskan (_forward_) pesan yang masuk (Incoming Messages) ke server/aplikasi milik pengguna pihak ketiga secara _Real-time_.
3. ~~**💳 SaaS Billing & Tiering Quota**~~ (✅ Selesai)
   Integrasi payment gateway (Midtrans/Stripe) beserta kuota pesan bulanan per user untuk memonetisasi platform secara B2B.
4. ~~**💬 Shared Team Inbox (Live Chat CS)**~~ (✅ Selesai)
   UI khusus mirip WhatsApp Web yang memungkinkan Multi-Customer Service milik _User_ membalas chat secara manual dari satu nomor yang sama.
5. ~~**🚀 Migrasi Queue ke Redis (BullMQ)**~~ (✅ Selesai)
   Mengganti sistem _Database-Queue_ bawaan dengan **Redis** (BullMQ). Kode lama yang menggunakan database queue telah dihapus sepenuhnya untuk efisiensi dan skalabilitas.
