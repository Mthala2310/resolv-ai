import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" }, // session disimpan sebagai token (cocok untuk serverless/Vercel)
  pages: { signIn: "/login" }, // kalau belum login, diarahkan ke /login
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // 1) cari user berdasarkan email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // 2) bandingkan password ketikan dengan hash di DB
        const ok = await verifyPassword(password, user.password);
        if (!ok) return null;

        // 3) data yang di-return ini akan masuk ke token session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // menyalin id & role ke dalam token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "customer" | "admin" }).role;
      }
      return token;
    },
    // menyalin id & role dari token ke objek session (yang bisa kita baca di halaman)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "customer" | "admin";
      }
      return session;
    },
  },
});
