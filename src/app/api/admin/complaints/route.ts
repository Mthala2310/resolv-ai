// src/app/api/admin/complaints/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // BARU|DITINJAU|DIPROSES|SELESAI
  const prioritas = searchParams.get("prioritas"); // LOW|MEDIUM|HIGH|CRITICAL
  const kategori = searchParams.get("kategori"); // salah satu dari 5 kategori
  const q = searchParams.get("q"); // cari di judul/deskripsi

  const complaints = await prisma.complaint.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(prioritas ? { prioritasFinal: prioritas as any } : {}),
      ...(kategori ? { kategoriFinal: kategori } : {}),
      ...(q
        ? {
            OR: [
              { judul: { contains: q, mode: "insensitive" } },
              { deskripsi: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      judul: true,
      deskripsi: true,
      status: true,
      kategoriPrediksi: true,
      confidenceKategori: true,
      prioritasPrediksi: true,
      kategoriFinal: true,
      prioritasFinal: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true } }, // admin BOLEH lihat pelapor
    },
  });

  return NextResponse.json({ complaints });
}
