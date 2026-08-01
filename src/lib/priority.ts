// src/lib/priority.ts
import type { Category } from "./ml";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const LEVELS: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Base priority per kategori (sesuai Project Hub)
const BASE_PRIORITY: Record<Category, Priority> = {
  "Technical issue": "HIGH",
  "Refund request": "MEDIUM",
  "Cancellation request": "MEDIUM",
  "Billing inquiry": "MEDIUM",
  "Product inquiry": "LOW",
};

// Kata kunci urgensi → menaikkan 1 level
const URGENCY_KEYWORDS = [
  // Kode awal Anda
  "segera",
  "mendesak",
  "marah",
  "gagal",
  "tidak bisa",
  "error",
  "rugi",
  "kecewa",
  "parah",
  "penting",

  // Tambahan Finansial & Keamanan
  "refund",
  "debet",
  "kredit",
  "ditipu",
  "penipuan",
  "salah transfer",
  "retas",
  "hack",

  // Tambahan Teknis & Sistem
  "stuck",
  "macet",
  "blank",
  "crash",
  "down",
  "lemot",
  "bug",
  "batal",
  "cancel",

  // Tambahan Waktu & Emosi Tinggi
  "sekarang",
  "deadline",
  "laporkan",
  "kapok",
  "merugikan",
  "ancam",
];

// Ambang confidence: di bawah ini → perlu ditinjau admin
export const CONFIDENCE_THRESHOLD = 0.85;

function bump(p: Priority, steps = 1): Priority {
  const idx = Math.min(LEVELS.indexOf(p) + steps, LEVELS.length - 1);
  return LEVELS[idx];
}

export function hasUrgency(text: string): boolean {
  const t = text.toLowerCase();
  return URGENCY_KEYWORDS.some((kw) => t.includes(kw));
}

export type PriorityResult = {
  priority: Priority;
  needsReview: boolean;
  reason: string;
};

export function computePriority(
  category: Category,
  confidence: number,
  text: string,
): PriorityResult {
  const base = BASE_PRIORITY[category];
  const urgent = hasUrgency(text);
  const priority = urgent ? bump(base, 1) : base;
  const needsReview = confidence < CONFIDENCE_THRESHOLD;

  const reason = [
    `base ${base} (${category})`,
    urgent ? "+1 level (ada kata urgensi)" : "tanpa kata urgensi",
    needsReview
      ? `confidence ${(confidence * 100).toFixed(0)}% < ${CONFIDENCE_THRESHOLD * 100}% → perlu tinjau admin`
      : `confidence ${(confidence * 100).toFixed(0)}% OK`,
  ].join("; ");

  return { priority, needsReview, reason };
}
