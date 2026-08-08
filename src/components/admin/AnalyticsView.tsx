"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import type { ApexOptions } from "apexcharts";

// ApexCharts butuh `window`, jadi WAJIB di-load tanpa SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Analytics = {
  total: number;
  byStatus: Record<string, number>;
  byPrioritas: Record<string, number>;
  byKategori: Record<string, number>;
  criticalOpen: number;
  trend: { days: string[]; counts: number[] };
};

export default function AnalyticsView() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data)
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );

  const cards = [
    { label: "Total Keluhan", value: data.total, color: "#5D5FEF" },
    {
      label: "Mendesak Belum Selesai",
      value: data.criticalOpen,
      color: "#dc2626",
    },
    { label: "Selesai", value: data.byStatus.SELESAI ?? 0, color: "#059669" },
    { label: "Baru", value: data.byStatus.BARU ?? 0, color: "#2563eb" },
  ];

  const kategoriLabels = Object.keys(data.byKategori);
  const kategoriSeries = Object.values(data.byKategori);
  const prioritasLabels = Object.keys(data.byPrioritas);
  const prioritasSeries = Object.values(data.byPrioritas);

  // --- Opsi chart (diketik ApexOptions supaya aman) ---
  const donutOptions: ApexOptions = {
    labels: kategoriLabels,
    legend: { position: "bottom" },
    colors: ["#5D5FEF", "#49BEFF", "#f59e0b", "#ef4444", "#10b981"],
    dataLabels: { enabled: true },
  };
  const barOptions: ApexOptions = {
    chart: { toolbar: { show: false } },
    xaxis: { categories: prioritasLabels },
    colors: ["#16a34a", "#d97706", "#ea580c", "#dc2626"],
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: "45%", distributed: true },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  };
  const areaOptions: ApexOptions = {
    chart: { toolbar: { show: false } },
    xaxis: { categories: data.trend.days.map((d) => d.slice(5)) }, // tampil MM-DD
    colors: ["#5D5FEF"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 },
    },
    dataLabels: { enabled: false },
  };

  return (
    <Stack spacing={3}>
      {/* Kartu ringkasan */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4,1fr)",
          },
          gap: 2,
        }}
      >
        {cards.map((c) => (
          <Card
            key={c.label}
            elevation={0}
            sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
          >
            <CardContent>
              <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                {c.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: c.color,
                  mt: 0.5,
                }}
              >
                {c.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Donut kategori + Bar prioritas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <CardContent>
            <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 2 }}>
              Distribusi Kategori
            </Typography>
            <Chart
              type="donut"
              height={300}
              series={kategoriSeries}
              options={donutOptions}
            />
          </CardContent>
        </Card>
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <CardContent>
            <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 2 }}>
              Distribusi Prioritas
            </Typography>
            <Chart
              type="bar"
              height={300}
              series={[{ name: "Keluhan", data: prioritasSeries }]}
              options={barOptions}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Tren 14 hari */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent>
          <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 2 }}>
            Tren Keluhan (30 hari terakhir)
          </Typography>
          <Chart
            type="area"
            height={300}
            series={[{ name: "Keluhan masuk", data: data.trend.counts }]}
            options={areaOptions}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
