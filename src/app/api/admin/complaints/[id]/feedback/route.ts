// src/app/api/admin/complaints/[id]/feedback/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// POST — admin kirim feedback ke user
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const adminId = guard.session.user.id;

  const { pesan } = (await req.json()) as { pesan?: string };
  if (!pesan?.trim())
    return NextResponse.json(
      { error: "Pesan tidak boleh kosong." },
      { status: 400 },
    );

  // Pastikan keluhan ada
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint)
    return NextResponse.json(
      { error: "Keluhan tidak ditemukan." },
      { status: 404 },
    );

  const feedback = await prisma.complaintFeedback.create({
    data: { complaintId: id, adminId, pesan: pesan.trim() },
    include: { admin: { select: { name: true } } },
  });

  return NextResponse.json({ feedback }, { status: 201 });
}
