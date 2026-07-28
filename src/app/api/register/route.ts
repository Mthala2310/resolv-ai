import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // validasi dasar
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
        { status: 400 },
      );
    }

    // cegah email dobel
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 },
      );
    }

    // simpan user baru sebagai CUSTOMER (admin hanya lewat seeder)
    const hashed = await hashPassword(password);
    await prisma.user.create({
      data: { name, email, password: hashed, role: "customer" },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
