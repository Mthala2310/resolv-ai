---
title: resolv-ai-service
emoji: 🛠️
colorFrom: purple
colorTo: blue
sdk: gradio
sdk_version: 5.20.0
app_file: app.py
pinned: false
---

# Resolv.ai — ML Classification Service (Gradio + FastAPI Free Tier)

Service Artificial Intelligence untuk klasifikasi otomatis kategori keluhan konsumen berbantuan model **mBERT fine-tuned**, dikonfigurasi berjalan 100% GRATIS pada Hugging Face Spaces (Gradio SDK + Mounted FastAPI).

## Fitur Unggulan
1. **Web UI Interaktif:** Kunjungi URL utama Space Anda untuk langsung mengetes model menggunakan antarmuka web Gradio secara visual di browser!
2. **REST API Eksklusif (FastAPI):** Tetap melayani komunikasi backend-to-backend yang aman bersama web Next.js via port dan routing standar.

## Endpoints Resmi untuk Next.js

### 1. `GET /health` (Wake Up & Health Check)
Digunakan untuk mengecek status kesiapan model dan melayani tombol **"Wake Up AI Service"** pada dashboard admin Next.js saat kontainer tidur (*sleep*) di tier gratis.

### 2. `POST /predict` (Sinkron Prediksi Kategori & Confidence)
* **Headers:** `X-API-Key: < rahasia-api-key-anda >`
* **Body (JSON):**
  ```json
  {
    "text": "Internet rumah saya putus terus sejak kemarin mendesak segera!"
  }
  ```
* **Response (JSON):**
  ```json
  {
    "kategori_prediksi": "Technical issue",
    "confidence": 0.9652,
    "status": "success"
  }
  ```

## Pengaturan Environment Variables (Settings > Variables and Secrets)
- `HF_TOKEN`: Token Read dari profil Hugging Face Anda (wajib jika Repo Model Anda di-setting Privat).
- `HF_MODEL_REPO_ID`: ID Repository model fine-tuned Anda (contoh: `Mthala/mbert-resolv-ai`).
- `API_SECRET_KEY`: Sandi pengaman komunikasi API (contoh: `resolv-secret-2026`).
