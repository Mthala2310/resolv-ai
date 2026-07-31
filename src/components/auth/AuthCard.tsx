"use client";
import { useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  subtitle: string;
  imageUrl?: string;
  children: React.ReactNode; // isi form
  footer: React.ReactNode; // link bawah
};

export default function AuthCard({
  title,
  subtitle,
  imageUrl,
  children,
  footer,
}: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 960,
          minHeight: { xs: "auto", md: 600 },
          display: "flex",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 24px 70px -24px rgba(93,95,239,0.35)",
        }}
      >
        {/* KIRI: form + glow blob */}
        <Box
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          sx={{
            position: "relative",
            overflow: "hidden",
            flex: 1,
            width: { xs: "100%", md: "50%" },
            px: { xs: 3, sm: 6 },
            py: { xs: 5, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "#fff",
          }}
        >
          {/* Glow blob mengikuti kursor */}
          <Box
            sx={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              filter: "blur(80px)",
              pointerEvents: "none",
              background:
                "linear-gradient(90deg, rgba(93,95,239,0.25), rgba(73,190,255,0.25), rgba(236,72,153,0.18))",
              opacity: hover ? 1 : 0,
              transition: "opacity .3s ease",
            }}
            style={{
              transform: `translate(${pos.x - 250}px, ${pos.y - 250}px)`,
            }}
          />

          <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'General Sans', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "primary.main",
                  mb: 1,
                }}
              >
                Resolv<Box component="span" sx={{ color: "secondary.main" }}>.ai</Box>
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              <Typography color="text.secondary">{subtitle}</Typography>
            </Box>

            {children}
            {footer}
          </Stack>
        </Box>

        {/* KANAN: gambar + overlay (sembunyi di layar kecil) */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: "50%",
            position: "relative",
            background: "linear-gradient(135deg, #5D5FEF, #49BEFF)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.35,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              p: 5,
              color: "#fff",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
              Layanan keluhan, lebih cerdas.
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
              Klasifikasi & prioritas keluhan otomatis dengan AI.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
