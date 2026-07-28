"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
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
    if (res?.error) setError("Email atau password salah.");
    else {
      router.push("/");
      router.refresh();
    }
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
            Masuk ke Resolv.ai
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
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
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            Belum punya akun? <a href="/register">Daftar di sini</a>
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}
