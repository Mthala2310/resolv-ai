"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stack, Button, Box, Alert, Typography } from "@mui/material";
import { IconUser, IconMail, IconLock } from "@tabler/icons-react";
import AuthCard from "@/components/auth/AuthCard";
import GlowField from "@/components/auth/GlowField";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || "Registrasi gagal.");
    else router.push("/login");
  }

  return (
    <AuthCard
      title="Buat akun"
      subtitle="Daftar untuk mulai melaporkan & memantau keluhan."
      imageUrl="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
      footer={
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "#5D5FEF", fontWeight: 600 }}>
            Masuk
          </Link>
        </Typography>
      }
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

        <GlowField
          label="Nama"
          placeholder="Nama lengkap"
          value={name}
          onChange={setName}
          startIcon={<IconUser size={18} />}
          required
        />
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
          placeholder="Minimal 6 karakter"
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
          {loading ? "Memproses..." : "Daftar"}
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
