# SurvMarkt 

> Marketplace Responden Penelitian — Platform yang menghubungkan peneliti dengan responden secara efisien dan transparan.

---

##  Tentang Proyek

SurvMarkt adalah platform berbasis web yang mempertemukan **peneliti** yang membutuhkan responden dengan **responden** yang ingin mendapatkan insentif dari mengisi survey. Platform ini dilengkapi dengan dashboard **admin** untuk memonitor performa dan mengelola transaksi.

Proyek ini dibuat sebagai Tugas Besar mata kuliah **Kewirausahaan Berbasis Teknologi**.

---

##  Role Pengguna

| Role | Deskripsi |
|---|---|
| **Peneliti** | Membuat survey, menentukan target responden & insentif, memantau progress |
| **Responden** | Menemukan survey yang sesuai profil dan mendapatkan insentif |
| **Admin** | Memonitor statistik platform dan mengelola withdrawal request |

---

##  Fitur Utama

**Peneliti**
- Buat survey dengan judul, deskripsi, link, estimasi durasi, dan insentif
- Filter target responden berdasarkan gender, umur, dan status
- Estimasi matching responden sebelum submit
- Opsi Featured Survey agar tampil di urutan teratas
- Kalkulator otomatis biaya survey + platform fee 20%
- Pantau progress tiap survey secara real-time

**Responden**
- Lihat daftar survey yang sesuai profil
- Filter berdasarkan keyword dan minimal insentif
- Insentif otomatis masuk ke wallet setelah mengisi survey
- Riwayat survey yang sudah dikerjakan
- Withdraw saldo ke rekening

**Admin**
- Dashboard statistik: total survey, survey aktif, survey selesai, revenue
- Business metrics: statistik pengguna & keuangan
- Kelola withdrawal request (approve / reject)

**Umum**
- Dark mode / Light mode
- Notifikasi real-time tiap aktivitas
- Wallet per pengguna

---

##  Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | HTML5, Tailwind CSS (CDN) |
| Logic | Vanilla JavaScript |
| Storage | Browser localStorage |

Implementasi Backend database in-progress.

---

##  Struktur File

```
survmarkt/
├── index.html       # Halaman login & pemilihan role
├── dashboard.html   # Dashboard utama (researcher / respondent / admin)
└── script.js        # Seluruh logika aplikasi
```

---

##  Cara Menjalankan

1. Clone atau download repository ini
2. Buka file `index.html` lewat Live-Server di browser
3. Pilih role, isi data, klik **Masuk ke SurvMarkt**

Tidak perlu install apapun.

---

##  Reset Data (untuk testing ulang)

Buka browser console (`F12` → Console) lalu jalankan:

```js
localStorage.clear()
```
Refresh page

---

##  Alur Penggunaan

```
Login (index.html)
    │
    ├── Peneliti  → Deposit → Buat Survey → Pantau Progress
    │
    ├── Responden → Cari Survey → Isi Survey → Dapat Insentif → Withdraw
    │
    └── Admin     → Monitor Statistik → Approve / Reject Withdrawal
```

---

##  Catatan

- Wallet awal setiap pengguna baru: **Rp 100.000**
- Platform fee: **20%** dari total biaya survey
- Featured Survey: tambahan biaya **Rp 5.000**
- Rekomendasi insentif per responden: **Rp 1.000 – Rp 5.000**

---

*Dibuat dengan sepenuh ❤️ untuk Tugas Besar Kewirausahaan Berbasis Teknologi*
