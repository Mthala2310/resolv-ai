// src/app/api/complaints/[id]/feedback/route.ts
// User baca semua feedback admin untuk keluhan miliknya
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Harus login dulu." }, { status: 401 });

  const { id } = await params;

  // Pastikan keluhan milik user yang login
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!complaint)
    return NextResponse.json(
      { error: "Keluhan tidak ditemukan." },
      { status: 404 },
    );
  if (complaint.userId !== session.user.id)
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

  const feedbacks = await prisma.complaintFeedback.findMany({
    where: { complaintId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      pesan: true,
      createdAt: true,
      admin: { select: { name: true } },
    },
  });

  return NextResponse.json({ feedbacks });
}
