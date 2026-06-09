Panduan singkat menggunakan `contact-template.csv`

1) Format file : CSV (Comma delimited)
2) Encoding     : UTF-8 tanpa BOM
3) Header wajib : `name,phone` — tambahan `link,email,group` boleh ada
4) Nomor telepon: gunakan format internasional tanpa +, contoh `6281234567890`
5) Contoh isi (sudah ada di file `contact-template.csv`):
   Rizki,628295341341001,https://wevitation.com/Chika-&-Dandy/27EAA84FW,,Invitation
6) Jika menggunakan Excel: saat menyimpan pilih CSV UTF-8 (Comma delimited)
7) Import: buka menu Contacts → Import CSV → upload file. Setelah upload, periksa mapping kolom dan klik Confirm/Import.
8) Troubleshooting:
   - Jika muncul "No valid contacts found": pastikan header ada dan ada kolom `phone` yang berisi angka.
   - Pastikan tidak ada karakter spasi atau `+` di depan nomor.

Jika mau, saya bisa juga membuat tombol export CSV di UI contoh atau menambahkan route backend untuk mengunduh template secara langsung.
