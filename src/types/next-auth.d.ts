// src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

// Menambal tipe untuk objek Session & User
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "admin";
    } & DefaultSession["user"]; // gabung dgn field bawaan (name, email, image)
  }

  interface User {
    role: "customer" | "admin";
  }
}

// Menambal tipe untuk token JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "customer" | "admin";
  }
}
