// src/app/keluhan/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import KeluhanClient from "@/components/keluhan/KeluhanClient";

export default async function KeluhanPage() {
  const session = await auth(); // baca sesi di server
  if (!session?.user) redirect("/login"); // belum login → tendang ke /login
  return <KeluhanClient userName={session.user.name} />;
}
