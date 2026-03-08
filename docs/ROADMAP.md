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

6. ~~**🔑 API Key Management for Developers**~~ (✅ Selesai)
   Menambahkan fitur pembuatan API Key di menu profil. API Key ini bersifat permanen (tidak expired seperti JWT), memudahkan integrasi script/server-side bagi customer (developer) tanpa perlu melakukan login berulang kali.

7. ~~**👤 My Profile Management**~~ (✅ Selesai)
   Memungkinkan Admin dan Customer untuk memperbarui data profil mereka sendiri (Nama, Email, Password). Khusus untuk User/Customer, ditambahkan field nomor telepon untuk melengkapi identitas akun.

8. ~~**📊 Advanced Analytics Dashboard**~~ (✅ Selesai)
   Visualisasi statistik pengiriman pesan, rate keberhasilan vs kegagalan, dan performa blast harian melalui chart yang interaktif.
9. ~~**🏷️ Contact Tagging & Segmentation**~~ (✅ Selesai)
   Sistem pelabelan kontak (seperti "VIP", "New Lead") untuk mempermudah pengiriman pesan blast yang lebih personal dan tersegmentasi.
10. ~~**📁 Media Library (Storage)**~~ (✅ Selesai)
    Penyimpanan cloud internal untuk file gambar, PDF, dan video. User bisa mengunggah file sekali dan menggunakannya berulang kali tanpa perlu URL eksternal.
    11.- [x] #11 Multi-Agent & Role Permissions (Sub-accounts for CS)
    Manajemen tim yang memungkinkan user utama membuat sub-akun untuk CS dengan hak akses terbatas (Role-Based Access Control).
11. **🕒 Global Message Scheduling**
    Fitur penjadwalan pesan satuan (oneshot) serta pengaturan "Jam Kerja" operasional sistem.
12. **🔗 Interactive Button & List Messages**
    Mengimplementasikan pesan tombol (Buttons) dan daftar menu (Lists) WhatsApp untuk meningkatkan interaksi dan konversi user.
