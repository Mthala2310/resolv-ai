// src/lib/ml.ts
import { Client } from "@gradio/client";
import { withTimeout, TimeoutError } from "@/lib/withTimeout";

const ML_TIMEOUT_MS = 20_000; // 20 detik

const SPACE_ID = process.env.HF_SPACE_ID ?? "Mthala/resolv-ai-space";
const ML_API_KEY = process.env.ML_API_KEY ?? "secret-key-resolv-dev";
const HF_TOKEN = process.env.HF_TOKEN; // hanya perlu jika Space privat

// 5 kategori resmi — WAJIB sama persis dengan output model
export const CATEGORIES = [
  "Billing inquiry",
  "Cancellation request",
  "Product inquiry",
  "Refund request",
  "Technical issue",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type PredictResult =
  | { ok: true; category: Category; confidence: number } // confidence 0..1
  | { ok: false; error: string };

// Simpan koneksi sekali saja (singleton) biar tidak connect berulang
let clientPromise: Promise<Client> | null = null;

async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = Client.connect(
      SPACE_ID,
      HF_TOKEN ? { token: HF_TOKEN as `hf_${string}` } : undefined,
    );
  }
  return clientPromise;
}

/** Kirim teks keluhan ke model → dapat kategori + confidence */
export async function classifyComplaint(text: string): Promise<PredictResult> {
  try {
    const client = await withTimeout(getClient(), ML_TIMEOUT_MS);

    const res = await withTimeout(
      client.predict("/predict", [text, ML_API_KEY]),
      ML_TIMEOUT_MS
    );

    const data = res.data as [string, number];
    const [label, score] = data;

    if (!CATEGORIES.includes(label as Category)) {
      return { ok: false, error: `Label tak dikenal dari model: ${label}` };
    }
    return { ok: true, category: label as Category, confidence: Number(score) };
  } catch (err) {
    clientPromise = null; // reset agar reconnect di panggilan berikutnya
    return {
      ok: false,
      error: err instanceof TimeoutError ? "timeout" : (err instanceof Error ? err.message : "Gagal memanggil ML service"),
    };
  }
}

/** Bangunkan Space yang sedang tidur (untuk tombol "Wake Up AI Service") */
export async function wakeMlService(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const client = await getClient();
    // ⚠️ Kalau fungsi wake di app.py butuh api_key, ganti [] jadi [ML_API_KEY]
    const res = await client.predict("/wake", []);
    const message = Array.isArray(res.data)
      ? String(res.data[0])
      : "Service aktif";
    return { ok: true, message };
  } catch (err) {
    clientPromise = null;
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal wake service",
    };
  }
}
