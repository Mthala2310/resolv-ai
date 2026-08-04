// src/app/api/complaints/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { classifyComplaint } from "@/lib/ml";
import { computePriority, type Priority } from "@/lib/priority";

// ── POST /api/complaints ── buat keluhan baru
export async function POST(req: Request) {
  // 1) Pastikan user sudah login. auth() membaca sesi dari cookie.
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Harus login dulu." }, { status: 401 });
  }

  // 2) Ambil & validasi input dari body JSON
  const body = await req.json().catch(() => null);
  const judul = String(body?.judul ?? "").trim();
  const deskripsi = String(body?.deskripsi ?? "").trim();

  if (judul.length < 3) {
    return NextResponse.json(
      { error: "Judul minimal 3 karakter." },
      { status: 400 },
    );
  }
  if (deskripsi.length < 10) {
    return NextResponse.json(
      { error: "Deskripsi minimal 10 karakter." },
      { status: 400 },
    );
  }

  // 3) Minta AI klasifikasi. Kita gabung judul + deskripsi biar konteksnya penuh.
  const teks = `${judul}. ${deskripsi}`;
  const pred = await classifyComplaint(teks);

  // 4) Siapkan nilai. Default null (kalau AI gagal → fallback tanpa kategori).
  let kategori: string | null = null;
  let confidence: number | null = null;
  let prioritas: Priority | null = null;

  if (pred.ok) {
    const prio = computePriority(pred.category, pred.confidence, teks);
    kategori = pred.category;
    confidence = pred.confidence;
    prioritas = prio.priority;
  }

  // 5) Simpan ke database lewat Prisma
  const complaint = await prisma.complaint.create({
    data: {
      userId: session.user.id,
      judul,
      deskripsi,
      kategoriPrediksi: kategori,
      confidenceKategori: confidence,
      prioritasPrediksi: prioritas,
      kategoriFinal: kategori, // awalnya = hasil AI; admin bisa koreksi nanti
      prioritasFinal: prioritas,
      status: "BARU",
    },
  });

  // 6) Balikan respons. aiOk memberi tahu FE apakah AI berhasil atau fallback.
  return NextResponse.json(
    {
      ok: true,
      id: complaint.id,
      aiOk: pred.ok,
      error: pred.ok ? null : pred.error,
    },
    { status: 201 },
  );
}

// ── GET /api/complaints ── daftar keluhan milik user yang login
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Harus login dulu." }, { status: 401 });
  }

  const complaints = await prisma.complaint.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    // ⚠️ kategori & prioritas SENGAJA tidak dikirim ke konsumen — itu khusus admin.
    select: {
      id: true,
      judul: true,
      deskripsi: true, // ← tambah (untuk halaman detail)
      status: true,
      createdAt: true,
      updatedAt: true, // ← tambah (untuk timeline)
      _count: {
        select: { feedbacks: true },
      },
    },
  });

  return NextResponse.json({ complaints });
}
