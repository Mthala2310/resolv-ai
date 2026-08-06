// src/app/api/admin/complaints/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import ExcelJS from "exceljs";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  // Pakai filter yang sama dengan tabel admin
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const prioritas = searchParams.get("prioritas");
  const kategori = searchParams.get("kategori");
  const q = searchParams.get("q");
  const format = searchParams.get("format");

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
    include: { user: { select: { name: true, email: true } } },
  });

  const header = [
    "ID",
    "Judul",
    "Deskripsi",
    "Pelapor",
    "Email",
    "Status",
    "Kategori AI",
    "Confidence",
    "Prioritas AI",
    "Kategori Final",
    "Prioritas Final",
    "Dibuat",
    "Diperbarui",
  ];

  if (format === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Keluhan");

    worksheet.addTable({
      name: 'TabelKeluhan',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium2',
        showRowStripes: true,
      },
      columns: header.map(h => ({ name: h, filterButton: true })),
      rows: complaints.map((c) => [
        c.id,
        c.judul,
        c.deskripsi,
        c.user.name ?? "",
        c.user.email,
        c.status,
        c.kategoriPrediksi ?? "",
        c.confidenceKategori ?? "",
        c.prioritasPrediksi ?? "",
        c.kategoriFinal ?? "",
        c.prioritasFinal ?? "",
        c.createdAt.toISOString(),
        c.updatedAt.toISOString(),
      ]),
    });

    worksheet.columns.forEach(column => {
      column.width = 18;
    });
    worksheet.getColumn(2).width = 35; // Judul
    worksheet.getColumn(3).width = 50; // Deskripsi

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="keluhan-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  }

  // Bungkus tiap sel dengan kutip & escape kutip ganda (aman untuk koma/enter di teks)
  const esc = (v: unknown) =>
    `"${(v == null ? "" : String(v)).replace(/"/g, '""')}"`;

  const rows = complaints.map((c) =>
    [
      c.id,
      c.judul,
      c.deskripsi,
      c.user.name ?? "",
      c.user.email,
      c.status,
      c.kategoriPrediksi ?? "",
      c.confidenceKategori ?? "",
      c.prioritasPrediksi ?? "",
      c.kategoriFinal ?? "",
      c.prioritasFinal ?? "",
      c.createdAt.toISOString(),
      c.updatedAt.toISOString(),
    ]
      .map(esc)
      .join(","),
  );

  // \uFEFF (BOM) supaya Excel membaca UTF-8 → teks Indonesia tidak rusak
  const csv = "\uFEFF" + [header.map(esc).join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="keluhan-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
