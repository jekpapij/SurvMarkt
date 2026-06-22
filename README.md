# SurvMarkt — Marketplace Responden Penelitian

> Tugas Besar Kewirausahaan Berbasis Teknologi

SurvMarkt adalah platform web yang mempertemukan **peneliti** yang membutuhkan responden dengan **responden** yang ingin mendapatkan insentif dari pengisian survey. Dibangun dengan Vanilla JavaScript dan Tailwind CSS, menggunakan `localStorage` sebagai media penyimpanan data (untuk keperluan demo/prototype).

---

## 📌 Latar Belakang

Peneliti (mahasiswa, dosen) sering kesulitan mendapatkan responden dengan kriteria spesifik dalam waktu terbatas, sementara banyak masyarakat yang sebenarnya bersedia mengisi survey jika diberi insentif/ apresiasi yang jelas. SurvMarkt menjembatani kedua kebutuhan ini dalam satu platform sederhana berbasis browser.

---

## 👥 Tiga Peran Pengguna

| Role | Deskripsi |
|---|---|
| **Peneliti** | Membuat survey, menentukan target responden, mengatur insentif, memantau progress |
| **Responden** | Mencari & mengisi survey yang relevan dengan profilnya, mendapat insentif ke wallet |
| **Admin** | Memantau performa platform, revenue, dan mengelola berjalannya respondensi survey |

---

## ✨ Fitur Utama

### Untuk Peneliti
- Buat survey dengan judul, deskripsi, durasi, link, dan jumlah target responden
- Atur **kriteria responden**: gender, rentang umur, status (mahasiswa/pekerja/umum)
- Kalkulator insentif otomatis (subtotal, platform fee 20%, biaya featured)
- Deadline survey fleksibel (preset 7/14/30/60/90 hari atau custom tanggal)
- **Featured Survey** (+Rp 5.000) untuk naik ke posisi teratas daftar responden
- Kelola survey: pause, resume, atau hapus (soft delete) lewat modal detail survey
- Lihat analytics per survey: views, jumlah responden, conversion rate
- Deposit dana ke wallet

### Untuk Responden
- Lihat hanya survey yang **relevan dengan profilnya** (gender/umur/status otomatis match)
- Cari survey berdasarkan judul & filter minimal insentif
- Modal detail survey lengkap sebelum memutuskan untuk mengisi survey
- Insentif otomatis masuk ke wallet setelah mengisi survey
- Riwayat survey yang sudah dikerjakan
- Request withdraw saldo

### Untuk Admin
- Dashboard statistik platform (total survey, survey aktif/selesai, revenue)
- Grafik tren revenue 4 minggu terakhir
- Widget Top Survey (ranking berdasarkan views)
- Kelola withdrawal request (approve/reject)
- Riwayat survey yang dihapus peneliti (soft delete, untuk audit)
- Generate/reset demo data untuk keperluan presentasi

### Fitur Lintas Role
- 🌙 Dark Mode
- 🔔 Sistem notifikasi real-time untuk setiap aktivitas penting
-  Empty state yang informatif di setiap list kosong
-  Sidebar collapsible

---

## 🛠️ Tech Stack

- **HTML5 + Tailwind CSS** (via CDN) — struktur & styling
- **Vanilla JavaScript** — seluruh logika aplikasi, tanpa framework
- **Google Fonts**: Lora (display), Inter (body), JetBrains Mono (label/eyebrow)
- **localStorage** — penyimpanan data sisi klien (surveys, wallet, notifikasi, dll.)

---

## 📁 Struktur File

```
├── landing.html     → Landing page perkenalan platform
├── index.html       → Halaman login (pilih role: peneliti/responden/admin)
├── dashboard.html   → Dashboard utama (berbeda tampilan tiap role)
└── script.js        → Seluruh logika aplikasi
```

---

##  Cara Menjalankan

1. Buka `landing.html` untuk melihat halaman perkenalan, atau langsung ke `index.html`
2. Pilih role (Peneliti / Responden / Admin)
3. Jika memilih Responden, isi profil (gender, umur, status) — minimal 17 tahun
4. Klik **Masuk ke SurvMarkt** → diarahkan ke `dashboard.html`
5. Wallet awal otomatis terisi Rp 100.000 untuk simulasi

> ! Untuk demo cepat saat presentasi, masuk sebagai **Admin** lalu klik **Generate Demo Data** — dashboard akan terisi contoh survey, withdrawal, dan notifikasi secara instan.

---

##  Alur Sistem (Flow Singkat)

**Peneliti** → Deposit dana → Buat survey + kriteria → Bayar (insentif × target + fee 20%) → Survey tampil ke responden yang cocok → Pantau progress & analytics

**Responden** → Login dengan profil → Lihat survey yang match → Isi survey → Insentif masuk wallet → Withdraw saldo

**Admin** → Pantau seluruh aktivitas platform → Approve/reject withdrawal → Audit survey & revenue

---

## ⚠️ Catatan

- Karena menggunakan `localStorage`, data tersimpan per-browser dan tidak disinkronkan ke server — cocok untuk prototype/demo, belum untuk produksi multi-user nyata.
- Status survey otomatis berubah jadi `CLOSED` ketika deadline terlewati (dicek setiap kali dashboard dibuka).
- Soft delete diterapkan pada penghapusan survey: data tetap tersimpan untuk keperluan audit admin, namun disembunyikan dari peneliti & responden.
