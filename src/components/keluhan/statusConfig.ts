// src/components/keluhan/statusConfig.ts
export type ComplaintStatus = "BARU" | "DITINJAU" | "DIPROSES" | "SELESAI";

// Urutan progres (dipakai stepper)
export const STATUS_ORDER: ComplaintStatus[] = [
  "BARU",
  "DITINJAU",
  "DIPROSES",
  "SELESAI",
];

// Label & warna per status (main = teks, bg = latar badge)
export const STATUS_META: Record<
  ComplaintStatus,
  { label: string; main: string; bg: string }
> = {
  BARU: { label: "Baru", main: "#2563eb", bg: "#eff6ff" }, // biru
  DITINJAU: { label: "Ditinjau", main: "#d97706", bg: "#fffbeb" }, // amber
  DIPROSES: { label: "Diproses", main: "#9333ea", bg: "#faf5ff" }, // ungu
  SELESAI: { label: "Selesai", main: "#059669", bg: "#ecfdf5" }, // hijau
};
