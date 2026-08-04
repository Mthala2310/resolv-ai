// src/lib/adminGuard.ts
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user)
    return { ok: false as const, status: 401, error: "Belum login." };
  if (session.user.role !== "admin")
    return { ok: false as const, status: 403, error: "Akses khusus admin." };
  return { ok: true as const, session };
}
