// src/app/api/admin/complaints/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// --- GET: detail satu keluhan + riwayat koreksi ---
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      corrections: {
        orderBy: { createdAt: "desc" },
        include: { corrector: { select: { name: true } } },
      },
      feedbacks: {
        orderBy: { createdAt: "asc" },
        include: { admin: { select: { name: true } } },
      },
    },
  });
  if (!complaint)
    return NextResponse.json(
      { error: "Keluhan tidak ditemukan." },
      { status: 404 },
    );
  return NextResponse.json({ complaint });
}

// --- PATCH: ubah status DAN/ATAU koreksi manual kategori & prioritas ---
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { id } = await params;
  const adminId = guard.session.user.id;

  const { status, kategoriFinal, prioritasFinal } = (await req.json()) as {
    status?: string;
    kategoriFinal?: string;
    prioritasFinal?: string;
  };

  const current = await prisma.complaint.findUnique({ where: { id } });
  if (!current)
    return NextResponse.json(
      { error: "Keluhan tidak ditemukan." },
      { status: 404 },
    );

  // Cek apakah admin benar-benar mengubah kategori / prioritas
  const kategoriBerubah =
    kategoriFinal !== undefined && kategoriFinal !== current.kategoriFinal;
  const prioritasBerubah =
    prioritasFinal !== undefined && prioritasFinal !== current.prioritasFinal;

  // Transaksi: update keluhan + catat audit trail bila ada koreksi (harus atomik)
  const updated = await prisma.$transaction(async (tx) => {
    const c = await tx.complaint.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status: status as any } : {}),
        ...(kategoriFinal !== undefined ? { kategoriFinal } : {}),
        ...(prioritasFinal !== undefined
          ? { prioritasFinal: prioritasFinal as any }
          : {}),
      },
    });

    if (kategoriBerubah || prioritasBerubah) {
      await tx.complaintCorrection.create({
        data: {
          complaintId: id,
          correctedBy: adminId,
          kategoriSebelum: current.kategoriFinal,
          kategoriSesudah: kategoriBerubah
            ? kategoriFinal!
            : current.kategoriFinal,
          prioritasSebelum: current.prioritasFinal,
          prioritasSesudah: prioritasBerubah
            ? (prioritasFinal as any)
            : current.prioritasFinal,
        },
      });
    }
    return c;
  });

  return NextResponse.json({ complaint: updated });
}
