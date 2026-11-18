# Dompet Santri - Aplikasi Buku Kas & Uang Saku Santri

Aplikasi pencatatan uang saku harian (pemasukan kiriman dan pengeluaran kebutuhan) untuk santri pondok pesantren, dibangun dengan Next.js, TypeScript, Drizzle ORM, dan validasi Zod.

## Fitur Utama

1. **Autentikasi Santri (JWT HttpOnly Cookie):**
   - Pendaftaran akun santri baru (`POST /api/auth/register`).
   - Masuk ke lembar buku kas (`POST /api/auth/login`) dan keluar sesi (`POST /api/auth/logout`).
   - Pemeriksaan sesi aktif beserta profil nama santri (`GET /api/auth/me`).
2. **Manajemen Buku Kas Transaksi Lengkap (CRUD):**
   - Daftar seluruh catatan transaksi milik santri (`GET /api/transactions`).
   - Detail satu catatan transaksi berdasarkan ID (`GET /api/transactions?id=:id`).
   - Pencatatan transaksi baru (`POST /api/transactions`).
   - Pembaruan catatan transaksi (`PUT /api/transactions?id=:id`).
   - Penghapusan catatan transaksi (`DELETE /api/transactions?id=:id`).
3. **Ringkasan Saldo & Filter Periode:**
   - Akumulasi pemasukan, pengeluaran, dan sisa saldo bersih (`GET /api/transactions/summary?month=:m&year=:y`).
   - Penyaringan berdasarkan bulan, tahun, jenis catatan (Pemasukan/Pengeluaran), dan pencarian kata kunci.
4. **Dukungan Database Ganda (PostgreSQL & SQLite Lokal):**
   - Menggunakan Neon PostgreSQL apabila variabel lingkungan `DATABASE_URL` (`postgresql://...`) tersedia.
   - Otomatis beralih ke database SQLite lokal (`file:./local.db` melalui `@libsql/client`) beserta akun contoh (`admin` / `password123`) apabila `DATABASE_URL` belum dikonfigurasi.
5. **Antarmuka Buku Kas Pesantren (Light & Dark Mode):**
   - Mengikuti panduan arah desain di `DESIGN.md` (palet kertas buku kas hangat `#F5F2EB` dan hijau pesantren `#244D3E` selaras dengan logo `public/dompet-santri.png`).
   - Mendukung Mode Terang dan Mode Malam Asrama serta aksesibilitas keyboard penuh.

## Menjalankan Aplikasi

```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Atau bangun dan jalankan versi produksi
npm run build
npm run start
```

Buka `http://localhost:3000` pada peramban Anda.
