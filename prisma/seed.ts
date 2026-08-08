import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaPg({
  connectionString: `${process.env.DATABASE_URL}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@gmail.com";
  const hashed = await hashPassword("admin12345"); // ⚠️ ganti nanti dengan yang kuat

  const admin = await prisma.user.upsert({
    where: { email }, // cari user dengan email ini
    update: {}, // kalau sudah ada: jangan ubah apa-apa
    create: {
      // kalau belum ada: buat baru
      name: "Admin Resolv",
      email,
      password: hashed,
      role: "admin",
    },
  });

  console.log("✅ Akun admin siap:", admin.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
