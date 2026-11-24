"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stack, Button, Box, Alert, Typography } from "@mui/material";
import { IconMail, IconLock } from "@tabler/icons-react";
import AuthCard from "@/components/auth/AuthCard";
import GlowField from "@/components/auth/GlowField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Email atau password salah.");
    } else {
      // Navigasi penuh ke root (akan diarahkan otomatis ke /admin atau /keluhan sesuai role)
      window.location.href = "/";
    }
  }

  return (
    <AuthCard
      title="Masuk"
      subtitle="Masuk ke akun Resolv.ai kamu untuk melanjutkan."
      imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
      footer={
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Belum punya akun?{" "}
          <Link href="/register" style={{ color: "#5D5FEF", fontWeight: 600 }}>
            Daftar di sini
          </Link>
        </Typography>
      }
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

        <GlowField
          label="Email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={setEmail}
          startIcon={<IconMail size={18} />}
          required
        />
        <GlowField
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          startIcon={<IconLock size={18} />}
          passwordToggle
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          sx={{
            position: "relative",
            overflow: "hidden",
            height: 48,
            fontWeight: 700,
            "& .shine": { transform: "skew(-13deg) translateX(-120%)" },
            "&:hover .shine": {
              transform: "skew(-13deg) translateX(240%)",
              transition: "transform 1s ease",
            },
          }}
        >
          {loading ? "Memproses..." : "Masuk"}
          <Box
            className="shine"
            sx={{
              position: "absolute",
              top: 0,
              height: "100%",
              width: 32,
              bgcolor: "rgba(255,255,255,0.35)",
              transition: "transform .1s",
            }}
          />
        </Button>
      </Stack>
    </AuthCard>
  );
}
