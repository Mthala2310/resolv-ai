// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/keluhan"); // konsumen dialihkan ke halaman mereka
  return <AdminClient adminName={session.user.name} />;
}
