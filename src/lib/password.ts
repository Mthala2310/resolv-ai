import bcrypt from "bcryptjs";

// Ubah password teks biasa jadi hash untuk disimpan di DB
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10); // 10 = "salt rounds"
}

// Cek apakah password yang diketik cocok dengan hash di DB
export async function verifyPassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
