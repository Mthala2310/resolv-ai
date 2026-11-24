import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Simpan instance Prisma di variabel global saat mode development
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const createPrismaClient = () => {
  // Ganti sslmode=require menjadi sslmode=verify-full agar tidak memicu security warning dari driver pg
  const rawUrl = `${process.env.DATABASE_URL || ""}`;
  const connectionString = rawUrl.replace("sslmode=require", "sslmode=verify-full");

  const adapter = new PrismaPg({
    connectionString,
  });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
