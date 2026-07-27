"use client";
import { createTheme } from "@mui/material/styles";

// Palet warna Resolv.ai (terinspirasi Spike, tapi identitas sendiri)
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5D5FEF", // ungu-biru khas Resolv.ai
      light: "#ECECFD",
      dark: "#4B4DDB",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#49BEFF",
      light: "#E8F7FF",
      dark: "#23afdb",
      contrastText: "#ffffff",
    },
    success: {
      main: "#13DEB9",
      light: "#E6FFFA",
      dark: "#02b3a9",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#FFAE1F",
      light: "#FEF5E5",
      dark: "#ae8e59",
      contrastText: "#ffffff",
    },
    error: {
      main: "#FA896B",
      light: "#FDEDE8",
      dark: "#f3704d",
      contrastText: "#ffffff",
    },
    background: { default: "#F4F6FB", paper: "#ffffff" },
    text: { primary: "#2A3547", secondary: "#5A6A85" },
  },
  typography: {
    fontFamily: "var(--font-plus-jakarta), sans-serif",
    h1: { fontSize: "2.25rem", fontWeight: 600 },
    h2: { fontSize: "1.875rem", fontWeight: 600 },
    h3: { fontSize: "1.5rem", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 }, // tombol tanpa HURUF BESAR
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #eaeff4",
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8, boxShadow: "none" } },
    },
  },
});

export default theme;
