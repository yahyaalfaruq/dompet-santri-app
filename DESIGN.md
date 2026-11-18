# DESIGN.md - Dompet Santri App

## Design Read
Reading this as: Aplikasi buku kas dan pencatatan uang saku harian untuk santri pesantren, in a Buku Kas Pesantren yang Tenang & Rapi (warm ledger) style, dial ENERGY 1 / RHYTHM 2 / MOTION 1.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

## Brand Identity & Soul
- **Product Name:** Dompet Santri
- **Audience:** Santri pondok pesantren yang mencatat pemasukan kiriman orang tua dan pengeluaran harian (makan, kitab, koperasi, kebutuhan asrama).
- **Personality:** Jujur, tenang, rapi, amanah, dan mudah dipahami seperti buku kas tulis tangan di pesantren.
- **Identity Motif:** Garis ganda pembukuan (*double ledger rule*) pada kepala bagian utama dan ornamen lengkung kubah/mihrab kecil yang selaras dengan ikon peci pada logo resmi `public/dompet-santri.png`.

## Color Palette (2 Core + 1 Neutral Base + 1 Deliberate Accent)
Semua kombinasi warna telah diuji agar memenuhi standar kontras WCAG AA (minimal 4.5:1 untuk teks normal, 3:1 untuk teks besar).

### Light Mode (Default: Kertas Buku Kas Hangat)
- **Neutral Base (Kertas & Tinta):**
  - Canvas Background: `#F5F2EB` (Krem hangat selaras dengan latar belakang logo `dompet-santri.png`)
  - Surface / Card Background: `#FFFFFF` dan `#FAF8F3`
  - Border / Ledger Hairline: `#D8D2C5`
  - Primary Text: `#1B2620` (Hijau-hitam tinta tua, rasio kontras >13:1 di atas `#F5F2EB`)
  - Secondary Text: `#4A5850` (Hijau batu tulis, rasio kontras >6.6:1 di atas `#F5F2EB`)
- **Core Color 1 (Hijau Pesantren Tua):** `#244D3E` (Diambil langsung dari warna garis peci & dompet pada `dompet-santri.png`, kontras >9.4:1 dengan teks putih `#FFFFFF`)
- **Core Color 2 (Hijau Sage Lembut):** `#E7EFEA` (Latar aksen lembut untuk area ringkasan buku kas)
- **Deliberate Accent (1 Aksen Fokus):** `#1D6348` (Digunakan khusus pada tombol aksi utama / CTA primer dan penanda fokus aktif)
- **Semantic Polarity Tokens (Status Transaksi):**
  - Pemasukan: Teks `#14532D` di atas latar `#DCFCE7` dengan garis tepi `#86EFAC` (Kontras >8.5:1)
  - Pengeluaran: Teks `#7F1D1D` di atas latar `#FEE2E2` dengan garis tepi `#FCA5A5` (Kontras >8.2:1)

### Dark Mode (Mode Malam Asrama)
- **Canvas Background:** `#111815`
- **Surface / Card Background:** `#19231E` dan `#202C26`
- **Border / Ledger Hairline:** `#2D3E36`
- **Primary Text:** `#EDF2EF` (Kontras >13.5:1 di atas `#19231E`)
- **Secondary Text:** `#A3B5AC` (Kontras >6.4:1 di atas `#19231E`)
- **Core Color 1 / Primary CTA:** `#2E7D5B` dengan teks `#FFFFFF` (Kontras >4.8:1)
- **Semantic Polarity Tokens (Mode Malam):**
  - Pemasukan: Teks `#BBF7D0` di atas latar `#143824` dengan garis tepi `#22543D`
  - Pengeluaran: Teks `#FECACA` di atas latar `#3B1818` dengan garis tepi `#632626`

## Typography (R-06 & R-31)
- **UI & Narrative Body:** `'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif`
  - *Alasan:* Mudah dibaca pada layar ponsel maupun laptop untuk istilah keuangan berbahasa Indonesia tanpa kesan kaku.
- **Nominal Rupiah & Tanggal (Tabular Ledger):** `'JetBrains Mono', ui-monospace, 'Cascadia Mono', 'Consolas', monospace` dengan `font-variant-numeric: tabular-nums`
  - *Alasan:* Hanya diterapkan pada angka nominal `Rp` dan tanggal transaksi agar digit satuan, ribuan, dan ratusan ribu sejajar vertikal layaknya buku kas akuntansi.

## Layout, Rhythm & Dials (R-05, R-11, R-12, R-14, R-19, R-31)
- **ENERGY 1 (Calm):** Tanpa gradien mencolok, tanpa *glow* berlebih, dan tanpa animasi mengambang. Fokus pada keterbacaan angka dan kemudahan input transaksi.
- **RHYTHM 2 (Consistent with Structural Variation):**
  - Bagian 1: Pita Ringkasan Buku Kas (Total Saldo Bersih sebagai satu titik fokus utama / *focal point*, didampingi Pemasukan dan Pengeluaran periode aktif).
  - Bagian 2: Area Kerja Dua Kolom Asimetris pada layar lebar (Kolom kiri: Formulir "Catat Transaksi Baru" yang selalu siap dijangkau; Kolom kanan: Filter Periode & Pencarian beserta Tabel Buku Kas Transaksi).
- **MOTION 1 (Hover & Focus States Only):** Hanya menggunakan perubahan warna dan bayangan halus saat `:hover` dan `:focus-visible`, serta semua transisi otomatis dimatikan saat pengguna mengaktifkan `prefers-reduced-motion: reduce`.
- **Border Radius Hierarchy (R-11):**
  - Kontainer kartu utama & dialog modal: `12px`
  - Input formulir, pemilih (*select*), dan tombol: `8px`
  - Penanda kategori (*badge* Pemasukan/Pengeluaran): `6px` (bukan kapsul penuh pada semua elemen).
- **Elevation / Shadow (R-12):**
  - Kartu biasa menggunakan garis tepi tegas `1px solid` menyerupai lembar buku kas dengan bayangan sangat tipis (`0 1px 3px rgba(27, 38, 32, 0.05)`).
  - Bayangan penuh (`0 16px 36px rgba(17, 24, 21, 0.22)`) hanya diberikan pada dialog modal yang mengambang di atas halaman.

## One-Line Decision Log (R-31)
- **Warna:** Palet krem kertas (`#F5F2EB`) dan hijau pesantren (`#244D3E`) dipilih langsung dari aset logo `dompet-santri.png` agar menyatu dengan identitas santri dan nyaman dibaca lama.
- **Tipografi:** Sans-serif humanis untuk antarmuka dipadukan dengan font monospace tabular khusus pada kolom nominal Rupiah dan tanggal agar angka sejajar lurus dari atas ke bawah.
- **Tata Letak (Layout):** Menggunakan pita ringkasan saldo di atas dan pembagian dua kolom asimetris (formulir pencatatan di kiri, daftar buku kas di kanan) agar tugas utama santri (mencatat dan memeriksa sisa uang saku) selesai dalam satu layar tanpa berpindah halaman.
- **Spasi (Spacing):** Menggunakan skala kelipatan 4px/8px (`8px`, `12px`, `16px`, `24px`, `32px`) untuk memisahkan kelompok formulir dari tabel data secara jelas.
- **Komponen Kartu vs Tabel:** Ringkasan saldo disajikan dalam kartu berstruktur buku kas untuk orientasi cepat, sedangkan riwayat transaksi disajikan dalam tabel berlajur dengan aksi langsung (*Edit* dan *Hapus*) agar mudah dipindai per baris.
- **Ikon & Aset Visual:** Menggunakan logo resmi `dompet-santri.png` yang sudah tersedia tanpa membuat avatar fiktif atau ilustrasi dekoratif tambahan; tombol sakelar tema menggunakan ikon SVG matahari dan bulan sabit (`aria-hidden="true"` dengan `aria-label` aksesibel pada tombol) untuk menandakan perpindahan Mode Terang dan Mode Malam secara ringkas.
