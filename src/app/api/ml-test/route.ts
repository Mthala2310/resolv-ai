// src/app/api/ml-test/route.ts — versi DEBUG (bisa dibandingkan dgn Space UI)
import { NextResponse } from "next/server";
import { Client } from "@gradio/client";
import { classifyComplaint } from "@/lib/ml";
import { computePriority } from "@/lib/priority";

const SPACE_ID = process.env.HF_SPACE_ID ?? "Mthala/resolv-ai-space";
const ML_API_KEY = process.env.ML_API_KEY ?? "secret-key-resolv-dev";
const HF_TOKEN = process.env.HF_TOKEN;

export async function GET(req: Request) {
  // Default = teks yang SAMA PERSIS dengan yang kamu tes di Space UI
  const q =
    new URL(req.url).searchParams.get("q") ??
    "saya mau minta tagihan saya bulan april sekarang ya karena sudah deadline kartu kredit saya";

  // (1) Panggilan MENTAH ke Gradio — apa adanya, tanpa olahan kita
  const client = await Client.connect(
    SPACE_ID,
    HF_TOKEN ? { token: HF_TOKEN as `hf_${string}` } : undefined,
  );
  const raw = await client.predict("/predict", [q, ML_API_KEY]);

  // (2) Hasil lewat helper ml.ts + priority.ts kita
  const parsed = await classifyComplaint(q);
  const prio = parsed.ok
    ? computePriority(parsed.category, parsed.confidence, q)
    : null;

  return NextResponse.json({
    input: q,
    rawFromGradio: raw.data, // 👈 KUNCI: ini yang sebenarnya dikirim Space
    parsedByMlTs: parsed, // hasil setelah diolah ml.ts
    priority: prio,
  });
}
