<div align="center">

# ⚡ Resolv.ai

**Sistem Manajemen & Klasifikasi Keluhan Konsumen Berbasis Kecerdasan Buatan (AI)**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.11-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![MUI](https://img.shields.io/badge/MUI-v9.2.0-007FFF?style=for-the-badge&logo=mui)](https://mui.com/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-mBERT_Model-FFD21E?style=for-the-badge&logo=huggingface)](https://huggingface.co/)

</div>

---

##  Tentang Proyek

**Resolv.ai** adalah platform penanganan keluhan pelanggan berbasis web yang mengotomatiskan klasifikasi kategori dan penetapan prioritas tiket secara cerdas. 

Dengan memanfaatkan model NLP **mBERT (Multilingual BERT)** yang di-host di **Hugging Face Space** serta mesin aturan prioritas berbasis urgensi, Resolv.ai membantu tim operasional dan *customer support* merespons komplain pelanggan lebih cepat, tepat sasaran, dan terukur.

---

## ✨ Fitur Utama

###  Pengguna / Pelapor (Customer)
- **Autentikasi Aman**: Registrasi akun dan login berbasis JWT session dengan NextAuth (Auth.js v5) dan enkripsi password menggunakan `bcryptjs`.
- **Formulir Pengaduan Interaktif**: Antarmuka responsif dan modern untuk menyampaikan keluhan secara detail.
- **Pemrosesan Cepat**: Keluhan yang masuk langsung dianalisis oleh AI dalam hitungan detik.
- **Pelacakan Status Real-Time**: Memantau progres keluhan (`BARU` ➔ `DITINJAU` ➔ `DIPROSES` ➔ `SELESAI`).
- **Kotak Masuk Tanggapan**: Menerima pesan balasan (*feedback*) resmi langsung dari tim admin.

###  Dashboard Admin
- **Tinjauan Keluhan Terpusat**: Tabel interaktif untuk menyaring keluhan berdasarkan status, prioritas, kategori, dan pencarian teks.
- **Validasi & Koreksi AI (Human-in-the-Loop)**: Admin dapat mengoreksi kategori atau prioritas prediksi AI jika diperlukan. Setiap riwayat koreksi tercatat secara otomatis di tabel audit log (`complaint_corrections`).
- **Pemberian Respon / Tanggapan**: Mengirim pesan balasan langsung ke pelapor untuk transparansi progres penyelesaian.
- **Dashboard Analitik**:
  - Tren masuknya keluhan selama 30 hari terakhir (Area Chart).
  - Distribusi keluhan berdasarkan 5 kategori masalah (Bar Chart).
  - Proporsi status penyelesaian dan level urgensi prioritas (Donut Chart).
- **Ekspor Laporan**: Fitur unduh rekap data keluhan ke format **Microsoft Excel (`.xlsx`)** dan **CSV (UTF-8 BOM)**.
- **Wake AI Service**: Tombol khusus di dasbor untuk membangunkan Hugging Face Space yang sedang dalam mode *sleep/standby*.

###  Otomatisasi AI & Mesin Prioritas
- **Klasifikasi Kategori Otomatis**: Model mBERT memprediksi keluhan ke dalam salah satu dari 5 kategori resmi:
  1. `Billing inquiry` (Masalah tagihan/pembayaran)
  2. `Cancellation request` (Permintaan pembatalan)
  3. `Product inquiry` (Pertanyaan produk)
  4. `Refund request` (Permintaan pengembalian dana)
  5. `Technical issue` (Kendala teknis/aplikasi)
- **Skor Keyakinan (Confidence Score)**: Mengukur tingkat kepastian prediksi model mBERT (0 - 100%).
- **Mesin Prioritas Berbasis Aturan (Rule-Based Priority)**:
  - Base priority per kategori (contoh: *Technical issue* otomatis berprioritas `HIGH`).
  - Deteksi kata kunci urgensi (seperti *"segera"*, *"error"*, *"rugi"*, *"gagal"*, *"penipuan"*) yang menaikkan tingkat prioritas sebanyak +1 level hingga `CRITICAL`.
  - Penandaan otomatis `needsReview` jika skor keyakinan model di bawah ambang batas (85%).

---

##  Arsitektur Alur Sistem

```mermaid
flowchart TD
    User([Pelapor / Customer]) -->|Kirim Keluhan| NextApp[Next.js App Router]
    
    subgraph AI Engine & Logic
        NextApp -->|Teks Keluhan| HF[Hugging Face Space\nmBERT Model API]
        HF -->|Kategori & Confidence| NextApp
        NextApp -->|Analisis Urgensi| PriorityEngine[Priority Engine]
    end

    subgraph Database Layer
        NextApp -->|Simpan Keluhan, Kategori & Prioritas| DB[(PostgreSQL / Neon DB)]
    end

    subgraph Admin Management
        Admin([Tim Admin / CS]) -->|Review & Koreksi| AdminDash[Admin Dashboard]
        AdminDash -->|Ambil Data & Analitik| DB
        AdminDash -->|Beri Tanggapan| User
        AdminDash -->|Export XLSX / CSV| ExcelFile[Laporan Excel/CSV]
    end
```

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | React 19, Turbopack, Server Components & Server Actions |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type-safety end-to-end |
| **UI Library** | [Material UI (MUI) v9](https://mui.com/) | Emotion, Custom Theme, Responsive Design |
| **Icons** | [@tabler/icons-react](https://tabler.io/icons) | Icon set modern dan ringan |
| **Charts** | [React-ApexCharts](https://apexcharts.com/) | Visualisasi data interaktif & informatif |
| **Database** | [PostgreSQL (Neon Serverless)](https://neon.tech/) | Cloud Postgres database |
| **ORM** | [Prisma v7](https://www.prisma.io/) | `@prisma/client` + `@prisma/adapter-pg` |
| **Autentikasi** | [NextAuth.js v5 (Auth.js)](https://authjs.dev/) | Session JWT, Server Action compatibility |
| **AI Integration** | [@gradio/client](https://www.npmjs.com/package/@gradio/client) | Koneksi realtime ke Hugging Face Gradio Space |
| **Export Engine** | [ExcelJS](https://github.com/exceljs/exceljs) | Pembuatan file spreadsheet XLSX dan format CSV ber-BOM |

---

##  Struktur Direktori

```text
resolv-ai/
├── prisma/
│   ├── schema.prisma          # Definisi skema tabel & enum database
│   └── seed.ts                # Skrip inisialisasi akun admin default
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Halaman login pengguna & admin
│   │   │   └── register/      # Halaman pendaftaran pengguna baru
│   │   ├── admin/             # Dashboard admin (monitoring, keluhan, analitik)
│   │   ├── api/
│   │   │   ├── admin/         # Endpoint API admin (keluhan, analitik, export, wake)
│   │   │   ├── auth/          # Endpoint Auth.js
│   │   │   ├── complaints/    # Endpoint keluhan pengguna & feedback
│   │   │   └── register/      # Endpoint registrasi user
│   │   ├── keluhan/           # Halaman utama pelapor (input & daftar keluhan)
│   │   ├── layout.tsx         # Root layout aplikasi (MUI Theme Registry)
│   │   └── page.tsx           # Redirect otomatis sesuai role (Admin/Customer)
│   ├── components/
│   │   ├── admin/             # Komponen dashboard admin & tampilan grafik analitik
│   │   ├── auth/              # Komponen form login, register, dan kartu autentikasi
│   │   └── keluhan/           # Komponen antarmuka keluhan pelapor
│   ├── lib/
│   │   ├── adminGuard.ts      # Proteksi route khusus role admin
│   │   ├── ml.ts              # Integrasi model mBERT via Gradio Client
│   │   ├── password.ts        # Helper hashing & verifikasi password (bcryptjs)
│   │   ├── priority.ts        # Logika penetapan level prioritas keluhan
│   │   └── prisma.ts          # Singleton Prisma Client & konfigurasi adapter
│   └── theme/
│       └── theme.ts           # Konfigurasi palet warna & tipografi MUI
├── .env                       # Variabel lingkungan (local)
├── package.json               # Konfigurasi dependensi proyek
└── README.md                  # Dokumentasi proyek
```

---

##  Panduan Memulai (Getting Started)

### 1. Prasyarat
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/) versi `20.x` atau lebih baru
- npm / pnpm / yarn
- Akun database PostgreSQL (bisa menggunakan [Neon](https://neon.tech/) gratis)

### 2. Kloning Repositori
```bash
git clone https://github.com/Mthala2310/resolv-ai.git
cd resolv-ai
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Variabel Lingkungan (`.env`)
Buat file `.env` di direktori utama (root) proyek, lalu sesuaikan isinya:

```env
# Koneksi Database PostgreSQL (contoh: Neon DB)
DATABASE_URL="postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require"

# Kunci Rahasia NextAuth (bisa digenerate via `npx auth secret`)
AUTH_SECRET="your-super-secret-key-at-least-32-chars"

# Konfigurasi AI Service (Hugging Face Space)
HF_SPACE_ID="Mthala/resolv-ai-space"
ML_API_KEY="secret-key-resolv-dev"
HF_TOKEN="" # Opsional, hanya jika HF Space bersifat privat
```

### 5. Setup Database & Inisialisasi Akun Admin
Jalankan migrasi database dan skrip *seed*:

```bash
# Generate Prisma Client
npx prisma generate

# Sinkronisasi skema ke database
npx prisma db push

# Buat akun admin pertama
npm run prisma:seed
```

> **Catatan Kredensial Admin Bawaan**:
> - **Email**: `admin@gmail.com`
> - **Password**: `admin12345`

### 6. Menjalankan Aplikasi
Jalankan server pengembangan:

```bash
npm run dev
```

Buka peramban (browser) dan akses:
- **Halaman Utama / Login**: [http://localhost:3000/login](http://localhost:3000/login)
- **Pelapor (Customer)**: [http://localhost:3000/keluhan](http://localhost:3000/keluhan)
- **Dasbor Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

##  Detail Kategori & Prioritas

### Kategori Resmi
| No | Kategori | Keterangan | Base Priority |
| :---: | :--- | :--- | :---: |
| 1 | `Technical issue` | Gangguan teknis, sistem down, crash aplikasi, atau bug | **HIGH** |
| 2 | `Refund request` | Permintaan pengembalian dana transaksi | **MEDIUM** |
| 3 | `Cancellation request` | Permintaan pembatalan pesanan atau langganan | **MEDIUM** |
| 4 | `Billing inquiry` | Pertanyaan rincian tagihan, struk, atau debit akun | **MEDIUM** |
| 5 | `Product inquiry` | Pertanyaan umum seputar fitur atau spesifikasi produk | **LOW** |

### Peningkatan Tingkat Prioritas
- **+1 Level Naik**: Jika keluhan memuat kata-kata urgensi (contoh: *"segera"*, *"mendesak"*, *"rugi"*, *"ditipu"*, *"gagal"*).
- **Flag Peninjauan (`needsReview`)**: Otomatis aktif jika *confidence score* model mBERT berada di bawah **0.85 (85%)**, sehingga admin dapat memberikan perhatian ekstra pada prediksi tersebut.

---

##  Deployment ke Vercel

Proyek ini telah dikonfigurasi secara optimal untuk dideploy di **Vercel**:
1. Buat proyek baru di [Vercel Dashboard](https://vercel.com).
2. Hubungkan repositori GitHub Anda.
3. Tambahkan seluruh isi variabel lingkungan dari `.env` ke menu **Settings ➔ Environment Variables** di Vercel.
4. Klik **Deploy**. Skrip `postinstall` dan `build` di `package.json` akan otomatis menghasilkan *Prisma Client* dan membangun aplikasi secara instan.

---

##  Lisensi

Proyek ini dikembangkan untuk keperluan riset dan implementasi sistem pelaporan keluhan bertenaga AI. Bebas digunakan dan dimodifikasi sesuai kebutuhan organisasi Anda.
