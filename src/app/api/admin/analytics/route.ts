// src/app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  // Ambil hanya kolom yang diperlukan untuk agregasi
  const rows = await prisma.complaint.findMany({
    select: {
      status: true,
      createdAt: true,
      kategoriFinal: true,
      kategoriPrediksi: true,
      prioritasFinal: true,
      prioritasPrediksi: true,
    },
  });

  const STATUSES = ["BARU", "DITINJAU", "DIPROSES", "SELESAI"] as const;
  const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
  const CATEGORIES = [
    "Billing inquiry",
    "Cancellation request",
    "Product inquiry",
    "Refund request",
    "Technical issue",
  ] as const;

  // Siapkan "ember" hitung, semua mulai dari 0
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<
    string,
    number
  >;
  const byPrioritas = Object.fromEntries(
    PRIORITIES.map((p) => [p, 0]),
  ) as Record<string, number>;
  const byKategori = Object.fromEntries(
    CATEGORIES.map((c) => [c, 0]),
  ) as Record<string, number>;

  // Tren 14 hari terakhir (label tanggal YYYY-MM-DD)
  const days: string[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const trendMap = Object.fromEntries(days.map((d) => [d, 0])) as Record<
    string,
    number
  >;

  let criticalOpen = 0;

  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

    // pakai nilai final bila sudah dikoreksi admin, kalau belum pakai prediksi AI
    const kategori = r.kategoriFinal ?? r.kategoriPrediksi;
    if (kategori && kategori in byKategori) byKategori[kategori]++;

    const prioritas = r.prioritasFinal ?? r.prioritasPrediksi;
    if (prioritas && prioritas in byPrioritas) byPrioritas[prioritas]++;

    // keluhan mendesak yang belum tuntas
    if (
      (prioritas === "HIGH" || prioritas === "CRITICAL") &&
      r.status !== "SELESAI"
    )
      criticalOpen++;

    const key = new Date(r.createdAt).toISOString().slice(0, 10);
    if (key in trendMap) trendMap[key]++;
  }

  return NextResponse.json({
    total: rows.length,
    byStatus,
    byPrioritas,
    byKategori,
    criticalOpen,
    trend: { days, counts: days.map((d) => trendMap[d]) },
  });
}
