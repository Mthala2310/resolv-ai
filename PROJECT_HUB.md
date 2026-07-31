# Project Hub — Sistem Pelaporan & Analisis Keluhan Konsumen (AI)

> 🧭 **Halaman ini = "otak/memory" proyek.** Setiap kali kita eksekusi per-bagian, semua keputusan, konvensi, dan progres dicatat di sini supaya konsisten dan tidak terjadi error di tengah jalan. Selalu cek halaman ini sebelum mulai bagian baru.

---

## 1. Overview
* **Produk:** Resolv.ai — Sistem Pelaporan & Analisis Keluhan Konsumen
* **Tujuan:** Konsumen lapor keluhan → AI (`mBERT`) otomatis klasifikasi **kategori** + tentukan **prioritas** → admin tangani lebih cepat & tepat sasaran.
* **Aktor:** Konsumen (lapor & pantau status) dan Admin (analisis, kelola, koreksi).
* **Status PRD:** v0.1 (Draft), 24/07/2026.
* **Nama aplikasi:** Resolv.ai
* **Mode kerja:** *Belajar sambil praktik* — AI menjelaskan & memberi langkah/kode, **Aqil yang mengeksekusi** (install, run, deploy). Dikerjakan **per-bagian**.
* **Aturan penjelasan:** setiap potongan kode selalu disertai penjelasan **alur & fungsi**-nya (bukan hanya kode mentah).

---

## 2. Tech Stack (Keputusan Final)

| Layer | Teknologi |
| :--- | :--- |
| **Frontend + Backend** | Next.js (App Router) + React + TypeScript |
| **UI / Design system** | MUI (Material UI) mengikuti gaya **Spike Next.js Pro** |
| **Charts** | ApexCharts (`react-apexcharts`) |
| **Database** | PostgreSQL (Neon) + Prisma 7 |
| **ML Service** | FastAPI (Python) + mBERT fine-tuned |
| **Model hosting** | Hugging Face Spaces (Docker) + Model Repo privat terpisah di HF Hub |
| **Auth** | Email & password (custom credentials, tanpa OAuth), role customer/admin |
| **Hosting app** | Vercel |
| **Payment / Notifikasi / Lampiran** | ❌ Tidak ada di MVP |

### Constraint penting (jangan sampai terlewat):
1. **Model 678MB** disimpan sebagai **Model Repository privat terpisah** di HF Hub, di-load FastAPI saat runtime (repo Space dibatasi ~1GB).
2. **Prediksi sinkron** (volume kecil, tanpa queue/worker).
3. **Komunikasi Next.js ↔ FastAPI** diamankan dengan **API key/secret** (tidak boleh publik).
4. **HF Space free tier bisa sleep** → butuh tombol **"Wake Up AI Service"** + **fallback** (kalau AI gagal/timeout, keluhan tetap tersimpan status "Baru" tanpa kategori/prioritas; admin bisa **Re-classify**).
5. **Akun admin dibuat manual via seeder** — tidak ada form daftar admin publik.

---

## 3. Design System (Referensi: Spike Next.js Pro)
* **Library:** MUI + Emotion, layout Material Design.
* **Layout:** Sidebar kiri collapsible (opsi light/dark) + header atas + area konten card-based.
* **Style:** Card rounded, soft shadow, spacing lega, tampilan bersih & modern.
* **Charts:** ApexCharts untuk dashboard analitik admin.
* **Font:** Plus Jakarta Sans.
* **Warna:** Primary ungu/biru, dukung beberapa color skin + light/dark mode.
* **Ikon:** Tabler icons.

> [!TIP]
> ✅ **Keputusan:** Spike dijadikan **referensi gaya saja** (bukan copy) — kita bangun desain sendiri bertema Resolv.ai yang terinspirasi Spike. UI konsumen & admin sama-sama pakai MUI (bisa dibantu dengan aset rekomendasi MCP 21st.dev untuk eksplorasi komponen modern).

---

## 4. Data Model

| Table | Kolom Kunci | Relasi |
| :--- | :--- | :--- |
| **users** | `id`, `name`, `email`, `password`, `role` (customer/admin), `created_at` | hasMany → `complaints` |
| **complaints** | `id`, `user_id` (FK), `judul`, `deskripsi`, `kategori_prediksi`, `confidence_kategori`, `prioritas_prediksi`, `kategori_final`, `prioritas_final`, `status`, `created_at`, `updated_at` | belongsTo → `users`, hasMany → `complaint_corrections` |
| **complaint_corrections** | `id`, `complaint_id` (FK), `corrected_by` (FK→users), `kategori_sebelum`, `kategori_sesudah`, `prioritas_sebelum`, `prioritas_sesudah`, `created_at` | belongsTo → `complaints`, belongsTo → `corrector` (User) |

* Bukan multi-tenant (satu organisasi, tanpa `tenant_id`).
* `kategori_final` / `prioritas_final` default = hasil AI, berubah hanya jika admin koreksi.
* `complaint_corrections` = audit trail + sumber data retraining.

---

## 5. Konvensi & Enum (WAJIB konsisten di FE, BE, DB, ML)

### Kategori (5 kelas — nilai + label tampilan tetap English, sesuai dataset):
* `Billing inquiry`
* `Cancellation request`
* `Product inquiry`
* `Refund request`
* `Technical issue`

* **Bahasa:** Teks keluhan & analisis sentimen ditulis Bahasa Indonesia; nama kategori (output mBERT) tetap English.
* **Prioritas (rule-based, BUKAN model ML terpisah):** `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`. Prioritas dasar ditentukan dari kategori hasil prediksi, lalu **didongkrak** jika teks keluhan mengandung kata kunci urgensi Bahasa Indonesia.
* **Status keluhan:** `BARU` → `DITINJAU` → `DIPROSES` → `SELESAI`
* **Role:** `customer` / `admin`
* **Aturan visibilitas:** Kategori & prioritas hasil AI **hanya untuk admin**, disembunyikan dari konsumen (konsumen hanya lihat status).

> ✅ **Aturan prioritas v1 (bisa di-tune nanti):** Base priority per kategori, lalu naik 1 level (maks CRITICAL) bila ada kata kunci urgensi.

### Base priority per kategori (proposal awal):
| Kategori | Base priority |
| :--- | :--- |
| `Technical issue` | HIGH |
| `Refund request` | MEDIUM |
| `Cancellation request` | MEDIUM |
| `Billing inquiry` | MEDIUM |
| `Product inquiry` | LOW |

**Urgency keywords (Bahasa Indonesia) — naikkan 1 level:**
`segera`, `mendesak`, `marah`, `gagal`, `tidak bisa`, `error`, `rugi`, `kecewa`, `parah`, `penting`.

---

## 6. Phases & Task Breakdown

### Phase 1 — Foundation
- [x] Setup project Next.js + TypeScript (App Router)
- [x] Integrasi MUI + tema Spike (font, warna, layout dasar)
- [x] Setup Prisma + PostgreSQL (Neon) + Driver Adapter (Prisma v7)
- [x] Migration tabel `users` / `complaints` / `complaint_corrections`
- [x] Konfigurasi auth (`next-auth`, role customer/admin) + seeder admin + halaman Login & Register
- [x] Deploy FastAPI service dasar di HF Spaces (model + tokenizer)

### Phase 2 — Core MVP (semua fitur ★)
- [ ] Form pelaporan keluhan konsumen (validasi + rate-limit)
- [ ] Integrasi Next.js → FastAPI untuk klasifikasi otomatis + fallback
- [ ] Tombol "Wake Up AI Service" di dashboard admin
- [ ] Dashboard konsumen (daftar & detail keluhan + timeline)
- [ ] Dashboard admin (daftar + filter + detail + update status + koreksi manual)

### Phase 3 — Integrations & Analitik
- [ ] Dashboard analitik admin (chart kategori/prioritas/tren, Critical belum selesai)
- [ ] Export CSV
- [ ] Simpan histori koreksi untuk retraining
- [ ] Fitur ☆ lain yang diprioritaskan

### Phase 4 — Polish & Deploy
- [ ] UI/UX polish + validasi form lengkap (memanfaatkan MCP 21st.dev)
- [ ] Error handling menyeluruh (fallback FastAPI down/timeout)
- [ ] Testing manual end-to-end
- [ ] Konfigurasi production & deployment

---

## 7. Progress & Decision Log

| Tanggal | Bagian | Yang dikerjakan / Keputusan | Status |
| :--- | :--- | :--- | :--- |
| 24/07/2026 | Setup | PRD dipelajari, design reference (Spike) dikonfirmasi, Project Hub dibuat | ✅ Selesai |
| 24/07/2026 | Keputusan | Nama=Resolv.ai; Spike=referensi gaya; kategori English; prioritas rule-based; mode belajar-praktik | ✅ Selesai |
| 25/07/2026 | Phase 1.1 | Project Next.js dibuat: `resolv-ai` (TypeScript, App Router, `src/`, tanpa Tailwind, alias `@/*`). Dev server jalan di localhost:3000 | ✅ Selesai |
| 25/07/2026 | Phase 1.2 | MUI + Emotion + Tabler icons terpasang; tema Resolv.ai (`src/theme/theme.ts`) + font Plus Jakarta Sans di layout; halaman uji OK | ✅ Selesai |
| 25/07/2026 | Keputusan | Database pakai **Neon** (PostgreSQL cloud gratis) | ✅ Selesai |
| 25/07/2026 | Phase 1.3 | Neon project `resolv-ai` dibuat; Prisma terpasang & init; `DATABASE_URL` + `DIRECT_URL` diset di `.env`; koneksi diverifikasi via `prisma db pull` | ✅ Selesai |
| 27/07/2026 | Phase 1.4 | `schema.prisma`: enum Role/Priority/Status + model User/Complaint/ComplaintCorrection (snake_case @map, kategori=String, field AI nullable utk fallback). `migrate dev --name init` sukses; 3 tabel dibuat di Neon; Prisma Client singleton di `src/lib/prisma.ts` | ✅ Selesai |
| 27/07/2026 | Phase 1.5a | Auth deps (`next-auth@beta`, `bcryptjs`, `tsx`) terpasang; `AUTH_SECRET` diset; helper hash (`src/lib/password.ts`); seeder admin (`prisma/seed.ts`) sukses → admin@resolv.ai (role admin), password ter-hash. | ✅ Selesai |
| 27/07/2026 | Phase 1.5b | **[Antigravity Fix]** Perbaikan aturan baru **Prisma ORM v7** (wajib Driver Adapter SQL): instalasi `@prisma/adapter-pg` + `pg` serta update instansiasi client di `src/lib/prisma.ts` dan `seed.ts`. Seed terverifikasi sukses. | ✅ Selesai |
| 28/07/2026 | Phase 1.5c | Integrasi NextAuth di `src/auth.ts` + Halaman Login (`src/app/login/page.tsx`), Register (`src/app/register/page.tsx`), dan API Register (`src/app/api/register/route.ts`). | ✅ Selesai |
| 28/07/2026 | Phase 1 / Setup | Konfigurasi global **MCP 21st.dev** untuk desain UI/UX, serta penyalinan file memori proyek ke `PROJECT_HUB.md` agar mudah diubah secara real-time oleh agen AI. | ✅ Selesai |
| 28/07/2026 | Phase 1.6 / AI Service | Deploy AI mBERT classifier ke Hugging Face Spaces (Gradio SDK + Mounted FastAPI Free Tier) berantarmuka Web UI interaktif & REST API (`/predict`, `/health`) dengan otentikasi `X-API-Key`. | ✅ Selesai |

---

## 8. Pertanyaan Terbuka (Sudah Disetujui)
1. ✅ **UI:** Spike sebagai referensi gaya (bukan copy), UI sendiri bertema Resolv.ai.
2. ✅ **Prioritas:** rule-based (base per kategori + bump urgency keywords ID), level LOW/MEDIUM/HIGH/CRITICAL.
3. ✅ **Kategori:** tetap English (sesuai dataset); teks keluhan & sentimen Bahasa Indonesia.
4. ✅ **Nama aplikasi:** Resolv.ai.
5. ✅ **Mode:** AI mengajari & menjelaskan alur, Aqil yang mengeksekusi.
6. ✅ **Database:** PostgreSQL via Neon (cloud gratis, cocok untuk Vercel) — dipilih sekaligus untuk belajar.
