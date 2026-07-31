"use client";
import { Box, Stack, Typography } from "@mui/material";
import { IconRobot, IconShieldCheck, IconChartBar } from "@tabler/icons-react";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {/* Panel kiri: branding — sembunyi di layar kecil */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
          px: 8,
          color: "#fff",
          background: "linear-gradient(135deg, #5D5FEF 0%, #49BEFF 100%)",
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'General Sans', sans-serif",
              fontSize: { xs: "2.5rem", md: "3.25rem" },
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              lineHeight: 1.1,
              textShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            Resolv<Box component="span" sx={{ color: "#FFE873" }}>.ai</Box>
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="h4"
            sx={{ color: "#fff", fontWeight: 700, mb: 1 }}
          >
            Kelola keluhan konsumen lebih cepat & cerdas
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
            Sistem pelaporan & analisis keluhan bertenaga AI — kategori dan
            prioritas diklasifikasi otomatis.
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Feature
            icon={<IconRobot size={22} />}
            text="Klasifikasi otomatis dengan model mBERT"
          />
          <Feature
            icon={<IconShieldCheck size={22} />}
            text="Prioritas cerdas berbasis aturan"
          />
          <Feature
            icon={<IconChartBar size={22} />}
            text="Dashboard analitik untuk admin"
          />
        </Stack>
      </Box>

      {/* Panel kanan: area form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          bgcolor: "background.default",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      <Box sx={{ display: "flex", color: "#fff" }}>{icon}</Box>
      <Typography sx={{ color: "rgba(255,255,255,0.95)" }}>{text}</Typography>
    </Stack>
  );
}
