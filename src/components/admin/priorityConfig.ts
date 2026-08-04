// src/components/admin/priorityConfig.ts
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const PRIORITY_ORDER: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const PRIORITY_META: Record<
  Priority,
  { label: string; main: string; bg: string }
> = {
  LOW: { label: "Low", main: "#16a34a", bg: "#f0fdf4" }, // hijau
  MEDIUM: { label: "Medium", main: "#d97706", bg: "#fffbeb" }, // amber
  HIGH: { label: "High", main: "#ea580c", bg: "#fff7ed" }, // oranye
  CRITICAL: { label: "Critical", main: "#dc2626", bg: "#fef2f2" }, // merah
};

// 5 kategori (harus sama persis dengan output mBERT & rule-engine)
export const CATEGORIES = [
  "Billing inquiry",
  "Cancellation request",
  "Product inquiry",
  "Refund request",
  "Technical issue",
];
