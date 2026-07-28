"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Typography variant="h3" color="primary">
            Daftar Akun
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="Minimal 6 karakter"
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            Sudah punya akun? <a href="/login">Masuk</a>
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}
