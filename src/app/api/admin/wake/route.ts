// src/app/api/admin/wake/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { wakeMlService } from "@/lib/ml";

export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  try {
    const result = await wakeMlService(); // panggil endpoint /wake di Space (ZeroGPU)
    return NextResponse.json({ ok: true, result });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal membangunkan AI service." },
      { status: 502 },
    );
  }
}
