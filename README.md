# SIM-LAB: Laboratory Inventory & Borrowing Management System

Aplikasi web manajemen inventaris dan transaksi peminjaman barang laboratorium komputer secara digital, responsif, dan mudah diakses.

Dibangun untuk memenuhi persyaratan tugas **Coding Talent Challenge** (Praktikum Pemrograman Platform Khusus).

---

## 1. Integrasi Database Supabase (Cloud Database)

Aplikasi telah terhubung penuh dengan **Supabase** (PostgreSQL). Seluruh skema tabel, relasi, dan data awal telah disiapkan pada file [`supabase/schema.sql`](supabase/schema.sql).

### Cara Menghubungkan ke Proyek Supabase Anda:
1. Buka [Supabase](https://supabase.com) dan buat proyek baru (gratis).
2. Di dashboard Supabase, buka menu **SQL Editor** > **New Query**.
3. Salin seluruh isi file [`supabase/schema.sql`](supabase/schema.sql) dan jalankan (**Run**). Skema tabel `items`, `users`, `transactions`, `activity_logs` beserta data awal akan otomatis terbuat.
4. Buka **Project Settings** > **API**. Salin **Project URL** dan **anon public key**.
5. Isi pada file `.env` di komputer lokal:
   ```env
   VITE_SUPABASE_URL=https://proyek-anda.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
6. Saat di-deploy ke Vercel atau Netlify, tambahkan dua variabel tersebut pada menu **Environment Variables**.
7. Jika variabel belum diisi, aplikasi secara cerdas akan menggunakan engine **Local Storage** sehingga tetap dapat diuji secara lancar tanpa *crash*.

---

## 2. Fitur Utama Aplikasi

Sesuai dengan spesifikasi dokumen `Coding Talent Challenge.pdf`:

### A. Autentikasi & Otorisasi Berbasis Peran (RBAC)
- **Role Admin**:
  - Akses penuh ke seluruh fitur dan pengaturan.
  - Memantau dashboard seluruh aktivitas operasional lab.
  - CRUD barang (menambah, mengubah, mencari, dan menghapus barang).
  - Memantau dan mengelola transaksi peminjaman dan pengembalian.
  - Mengelola data staf (menambah akun staf, mengubah nama/password, mengaktifkan/menonaktifkan akun staf).
  - Melihat riwayat log audit seluruh aktivitas sistem.
- **Role Staff**:
  - Memantau daftar inventaris dan status ketersediaan barang.
  - Mencatat transaksi peminjaman barang baru.
  - Memproses pengembalian barang dan memperbarui stok.
  - Melihat riwayat transaksi peminjaman.
  - Dibatasi secara ketat: Staff tidak dapat menghapus barang, tidak dapat mengelola akun pengguna, dan tidak dapat mengakses menu admin.

### B. Dashboard Operasional
- Total unit barang terdaftar.
- Jumlah unit barang yang tersedia (siap dipinjam).
- Jumlah unit barang yang sedang dipinjam.
- Total transaksi kumulatif.
- Daftar peminjaman aktif yang belum dikembalikan.
- Ringkasan log aktivitas terbaru dengan waktu dan pelaku.

### C. Manajemen Data Barang (Minimal 5 Data Awal)
Data awal yang telah tersedia dan tersimpan di sistem:
1. `BR001` - Laptop Lenovo (Stok: 5 unit)
2. `BR002` - Mouse Logitech (Stok: 10 unit)
3. `BR003` - Keyboard Mechanical (Stok: 8 unit)
4. `BR004` - Proyektor Epson (Stok: 3 unit)
5. `BR005` - Monitor LG (Stok: 6 unit)
6. `BR006` - Switch TP-Link 16-Port (Stok: 4 unit)
7. `BR007` - Router Mikrotik RB750 (Stok: 5 unit)
8. `BR008` - Kabel HDMI 5M (Stok: 12 unit)
9. `BR009` - Web Camera Logitech C920 (Stok: 4 unit)
10. `BR010` - Wireless Presenter Laser (Stok: 6 unit)

### D. Manajemen Peminjaman & Pengembalian
- Peminjaman barang memvalidasi kuantitas yang diminta terhadap stok yang tersedia.
- Kuantitas yang dipinjam secara otomatis mengurangi stok barang yang tersedia dan menambah total barang dipinjam.
- Pengembalian barang memulihkan kuantitas ke stok tersedia dan menandai transaksi berstatus Selesai beserta tanggal pengembalian.

---

## 3. Menjalankan Aplikasi Secara Lokal

### Prasyarat:
- Node.js versi 18+ terinstal pada komputer.

### Langkah Instalasi:
```bash
# 1. Masuk ke direktori proyek
cd project

# 2. Instal dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```

Buka peramban di `http://localhost:5173`.

### Build untuk Produksi:
```bash
npm run build
```
Hasil build siap saji berada di direktori `dist/`.

---

## 4. Panduan Publikasi ke Hosting Publik (Vercel & Netlify)

Aplikasi telah dilengkapi dengan konfigurasi `vercel.json` dan `netlify.toml` sehingga dapat di-deploy tanpa error routing 404:

### Cara 1: Deploy melalui GitHub ke Vercel (Rekomendasi)
1. Buat repository baru di [GitHub](https://github.com).
2. Lakukan push kode ke repository Anda:
   ```bash
   git add .
   git commit -m "feat: complete lab inventory management system"
   git remote add origin https://github.com/[username-anda]/sim-lab-inventory.git
   git branch -M main
   git push -u origin main
   ```
3. Buka [Vercel](https://vercel.com) dan masuk dengan akun GitHub.
4. Klik **Add New Project**, pilih repository `sim-lab-inventory`.
5. Vercel akan otomatis mendeteksi Framework Preset **Vite**. Klik **Deploy**.
6. URL publik aplikasi akan langsung aktif (misal: `https://sim-lab-inventory.vercel.app`).

### Cara 2: Deploy melalui Netlify
1. Buka [Netlify](https://netlify.com) dan klik **Add new site** > **Import an existing project**.
2. Pilih repository GitHub Anda.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Klik **Deploy site**.

