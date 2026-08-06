// src/app/api/admin/complaints/[id]/reclassify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { classifyComplaint } from "@/lib/ml";
import { computePriority } from "@/lib/priority";

const allowedCategories = [
  "Billing inquiry",
  "Cancellation request",
  "Product inquiry",
  "Refund request",
  "Technical issue",
] as const;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireAdmin();

    if (!guard.ok) {
      return NextResponse.json(
        { error: guard.error },
        { status: guard.status },
      );
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Keluhan tidak ditemukan." },
        { status: 404 },
      );
    }

    const teks = `${complaint.judul}. ${complaint.deskripsi}`;

    const result = await classifyComplaint(teks);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI tidak merespons. Coba klik 'Wake Up AI' dulu, lalu ulangi.",
        },
        { status: 502 },
      );
    }

    if (!allowedCategories.includes(result.category as any)) {
      return NextResponse.json(
        {
          ok: false,
          error: "AI mengembalikan kategori yang tidak valid.",
        },
        { status: 502 },
      );
    }

    if (
      typeof result.confidence !== "number" ||
      result.confidence < 0 ||
      result.confidence > 1
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "AI mengembalikan confidence yang tidak valid.",
        },
        { status: 502 },
      );
    }

    const { priority } = computePriority(
      result.category,
      result.confidence,
      teks,
    );

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        kategoriPrediksi: result.category,
        confidenceKategori: result.confidence,
        prioritasPrediksi: priority,

        // Jangan timpa keputusan final admin.
        ...(complaint.kategoriFinal == null
          ? { kategoriFinal: result.category }
          : {}),

        ...(complaint.prioritasFinal == null
          ? { prioritasFinal: priority }
          : {}),
      },
    });

    return NextResponse.json({
      ok: true,
      complaint: updated,
    });
  } catch (error) {
    console.error("POST /api/admin/complaints/[id]/reclassify error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Terjadi kesalahan saat melakukan re-classify.",
      },
      { status: 500 },
    );
  }
}
