"use client";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Avatar,
  Stack,
  Card,
  CardContent,
  Chip,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  IconBolt,
  IconFileText,
  IconClock,
  IconActivity,
  IconCircleCheck,
  IconChevronRight,
  IconArrowLeft,
  IconBell,
  IconLogout,
  IconPlus,
  IconHelp,
} from "@tabler/icons-react";
import {
  STATUS_META,
  STATUS_ORDER,
  type ComplaintStatus,
} from "./statusConfig";

const DRAWER_WIDTH = 260;

type Complaint = {
  id: string;
  judul: string;
  deskripsi: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
};
type View = "dashboard" | "detail" | "create";

export default function KeluhanClient({
  userName,
}: {
  userName?: string | null;
}) {
  const [view, setView] = useState<View>("dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{
    type: "success" | "info" | "error";
    msg: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  async function loadList() {
    setLoading(true);
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      setItems(data.complaints ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadList();
  }, []);

  if (!mounted) return null;

  const selected = items.find((c) => c.id === selectedId) ?? null;
  const initials = (userName ?? "Konsumen")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      {/* ===== SIDEBAR ===== */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #e2e8f0",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                p: 3,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  bgcolor: "primary.main",
                  color: "#fff",
                  borderRadius: 2,
                  display: "flex",
                }}
              >
                <IconBolt size={20} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                Resolv.ai
              </Typography>
            </Stack>
            <Box sx={{ p: 2 }}>
              <Typography
                sx={{
                  px: 1.5,
                  mb: 1.5,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#94a3b8",
                }}
              >
                MENU
              </Typography>
              <List sx={{ p: 0 }}>
                <NavItem
                  active={view === "dashboard" || view === "detail"}
                  icon={<IconFileText size={18} />}
                  label="Keluhan Saya"
                  onClick={() => setView("dashboard")}
                />
                <NavItem
                  active={view === "create"}
                  icon={<IconPlus size={18} />}
                  label="Lapor Keluhan"
                  onClick={() => setView("create")}
                />
              </List>
            </Box>
          </Box>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                  {userName ?? "Konsumen"}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Konsumen
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Keluar">
              <IconButton
                onClick={() => signOut({ callbackUrl: "/login" })}
                sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
              >
                <IconLogout size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Drawer>

      {/* ===== MAIN ===== */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0" }}
        >
          <Toolbar sx={{ justifyContent: "space-between", minHeight: 64 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              {view !== "dashboard" ? (
                <Button
                  onClick={() => setView("dashboard")}
                  startIcon={<IconArrowLeft size={16} />}
                  sx={{
                    color: "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Kembali
                </Button>
              ) : (
                <Box>
                  <Typography
                    sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
                  >
                    Keluhan Saya
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                    Pantau status laporan keluhan Anda
                  </Typography>
                </Box>
              )}
              {view === "create" && (
                <Typography
                  sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
                >
                  Lapor Keluhan Baru
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              {view === "dashboard" && (
                <Button
                  onClick={() => setView("create")}
                  variant="contained"
                  startIcon={<IconPlus size={16} />}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Lapor Keluhan
                </Button>
              )}
              <IconButton sx={{ color: "#94a3b8" }}>
                <IconBell size={20} />
              </IconButton>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  pl: 2,
                  borderLeft: "1px solid #e2e8f0",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 32,
                    height: 32,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}
                  >
                    {userName ?? "Konsumen"}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "#94a3b8" }}>
                    Konsumen
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 4, flex: 1 }}>
          {loading ? (
            <Stack sx={{ alignItems: "center", py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : view === "dashboard" ? (
            <DashboardView
              items={items}
              onOpen={(id) => {
                setSelectedId(id);
                setView("detail");
              }}
              onCreate={() => setView("create")}
            />
          ) : view === "detail" && selected ? (
            <DetailView c={selected} />
          ) : view === "create" ? (
            <CreateView
              onSubmitted={(info) => {
                setSnack(info);
                loadList();
                setView("dashboard");
              }}
              onError={(msg) => setSnack({ type: "error", msg })}
            />
          ) : (
            <Typography color="text.secondary">
              Data tidak ditemukan.
            </Typography>
          )}
        </Box>
      </Box>

      <Tooltip title="Bantuan">
        <Fab
          size="medium"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            bgcolor: "#fff",
            color: "#475569",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          <IconHelp size={22} />
        </Fab>
      </Tooltip>

      <Snackbar
        open={!!snack}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snack ? (
          <Alert
            severity={snack.type}
            variant="filled"
            onClose={() => setSnack(null)}
          >
            {snack.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

/* ---------- Sub-komponen ---------- */

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        py: 1.25,
        color: active ? "primary.main" : "#475569",
        bgcolor: active ? "#eff6ff" : "transparent",
        "&:hover": { bgcolor: active ? "#eff6ff" : "#f8fafc" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            {label}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

function StatusBadge({
  status,
  small,
}: {
  status: ComplaintStatus;
  small?: boolean;
}) {
  const m = STATUS_META[status];
  return (
    <Chip
      label={m.label}
      size="small"
      sx={{
        height: small ? 20 : 24,
        fontSize: small ? 10 : 11,
        fontWeight: 700,
        color: m.main,
        bgcolor: m.bg,
        border: `1px solid ${m.main}33`,
      }}
    />
  );
}

function DashboardView({
  items,
  onOpen,
  onCreate,
}: {
  items: Complaint[];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const stats = useMemo(
    () => ({
      total: items.length,
      menunggu: items.filter(
        (c) => c.status === "BARU" || c.status === "DITINJAU",
      ).length,
      diproses: items.filter((c) => c.status === "DIPROSES").length,
      selesai: items.filter((c) => c.status === "SELESAI").length,
    }),
    [items],
  );

  const cards = [
    {
      label: "Total Laporan",
      value: stats.total,
      subtext: "Semua tiket terdaftar",
      icon: <IconFileText size={18} />,
      color: "#2563eb",
      bg: "#eff6ff",
      borderColor: "#dbeafe",
    },
    {
      label: "Menunggu",
      value: stats.menunggu,
      subtext: "Dalam antrean penanganan",
      icon: <IconClock size={18} />,
      color: "#d97706",
      bg: "#fffbeb",
      borderColor: "#fef3c7",
    },
    {
      label: "Diproses",
      value: stats.diproses,
      subtext: "Sedang ditindaklanjuti",
      icon: <IconActivity size={18} />,
      color: "#9333ea",
      bg: "#faf5ff",
      borderColor: "#f3e8ff",
    },
    {
      label: "Selesai",
      value: stats.selesai,
      subtext: "Telah terselesaikan",
      icon: <IconCircleCheck size={18} />,
      color: "#059669",
      bg: "#ecfdf5",
      borderColor: "#d1fae5",
    },
  ];

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {cards.map((s) => (
          <Card
            key={s.label}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 16px 32px -6px ${s.color}50`,
                borderColor: s.borderColor,
              },
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#475569",
                    fontFamily: "'General Sans', sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.label}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    color: s.color,
                    bgcolor: s.bg,
                    border: `1px solid ${s.borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.icon}
                </Box>
              </Stack>
              <Typography
                sx={{
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: "'General Sans', sans-serif",
                  color: "#0f172a",
                  lineHeight: 1,
                  mb: 0.75,
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#94a3b8",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.subtext}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box>
        <Typography
          sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a", mb: 2 }}
        >
          Riwayat Laporan
        </Typography>
        {items.length === 0 ? (
          <Card
            elevation={0}
            sx={{ borderRadius: 3, border: "1px dashed #cbd5e1" }}
          >
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Belum ada keluhan.
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconPlus size={16} />}
                onClick={onCreate}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Lapor Keluhan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {items.map((c) => (
              <Card
                key={c.id}
                elevation={0}
                onClick={() => onOpen(c.id)}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  position: "relative",
                  transition: "border-color .2s",
                  "&:hover": { borderColor: "primary.main" },
                  "&:hover .arrow": { color: "primary.main" },
                  "&:hover .title": { color: "primary.main" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#94a3b8",
                        }}
                      >
                        {shortId(c.id)}
                      </Typography>
                      <StatusBadge status={c.status} />
                    </Stack>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                      {fmtDate(c.createdAt)}
                    </Typography>
                  </Stack>
                  <Typography
                    className="title"
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                      transition: "color .2s",
                    }}
                  >
                    {c.judul}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "#64748b",
                      mt: 0.5,
                      pr: 4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.deskripsi}
                  </Typography>
                  <Box
                    className="arrow"
                    sx={{
                      position: "absolute",
                      right: 24,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#cbd5e1",
                      transition: "color .2s",
                      display: "flex",
                    }}
                  >
                    <IconChevronRight size={18} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function DetailView({ c }: { c: Complaint }) {
  const currentIdx = STATUS_ORDER.indexOf(c.status);
  const activeStep = c.status === "SELESAI" ? STATUS_ORDER.length : currentIdx;
  const history = buildHistory(c);

  return (
    <Box sx={{ maxWidth: 880 }}>
      <Stack spacing={2.5}>
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", mb: 1 }}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}
            >
              {shortId(c.id)}
            </Typography>
            <StatusBadge status={c.status} />
          </Stack>
          <Typography sx={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>
            {c.judul}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.5 }}>
            Dilaporkan pada {fmtDateTime(c.createdAt)}
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a", mb: 3 }}
            >
              Progres Penanganan
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STATUS_ORDER.map((s) => (
                <Step key={s}>
                  <StepLabel>{STATUS_META[s].label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a", mb: 1.5 }}
            >
              Detail Keluhan
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {c.deskripsi}
            </Typography>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a", mb: 3 }}
            >
              Riwayat Status
            </Typography>
            <Box
              sx={{
                position: "relative",
                pl: 3,
                borderLeft: "2px solid #f1f5f9",
                ml: 1,
              }}
            >
              <Stack spacing={3}>
                {history.map((h, i) => (
                  <Box key={i} sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: -31,
                        top: 4,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        bgcolor: STATUS_META[h.status].main,
                      }}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <StatusBadge status={h.status} small />
                      <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                        {h.date}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#334155",
                        mt: 0.5,
                      }}
                    >
                      {h.note}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

function CreateView({
  onSubmitted,
  onError,
}: {
  onSubmitted: (info: { type: "success" | "info"; msg: string }) => void;
  onError: (msg: string) => void;
}) {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = judul.trim().length > 0 && deskripsi.trim().length >= 20;

  async function submit() {
    if (!valid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, deskripsi }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Gagal mengirim keluhan.");
        return;
      }
      onSubmitted({
        type: data.aiOk ? "success" : "info",
        msg: data.aiOk
          ? "Keluhan terkirim & dianalisis AI. Terima kasih!"
          : "Keluhan terkirim. AI sedang tidak aktif, tim akan meninjau manual.",
      });
    } catch {
      onError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              bgcolor: "#eff6ff",
              border: "1px solid #dbeafe",
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                p: 0.75,
                bgcolor: "primary.main",
                color: "#fff",
                borderRadius: 1.5,
                height: "fit-content",
                display: "flex",
              }}
            >
              <IconBolt size={14} />
            </Box>
            <Typography
              sx={{ fontSize: 12, color: "#1d4ed8", lineHeight: 1.6 }}
            >
              Keluhan Anda akan dianalisis otomatis oleh AI (mBERT) untuk
              klasifikasi kategori & prioritas, membantu tim kami merespons
              lebih cepat.
            </Typography>
          </Stack>

          <Stack spacing={3}>
            <Box>
              <FieldLabel>Judul Keluhan</FieldLabel>
              <TextField
                fullWidth
                value={judul}
                onChange={(e) => setJudul(e.target.value.slice(0, 100))}
                placeholder="Contoh: Tagihan ganda bulan ini"
                helperText={`${judul.length}/100 karakter`}
              />
            </Box>
            <Box>
              <FieldLabel>Deskripsi Keluhan</FieldLabel>
              <TextField
                fullWidth
                multiline
                minRows={6}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value.slice(0, 2000))}
                placeholder="Jelaskan keluhan Anda secara detail..."
                helperText={`${deskripsi.length}/2000 karakter (minimal 20)`}
              />
            </Box>
            <Button
              onClick={submit}
              variant="contained"
              size="large"
              fullWidth
              disabled={!valid || submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <IconPlus size={16} />
                )
              }
              sx={{ textTransform: "none", borderRadius: 2, py: 1.25 }}
            >
              {submitting ? "Mengirim..." : "Kirim Laporan Keluhan"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="label"
      sx={{
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        color: "#334155",
        mb: 0.75,
      }}
    >
      {children}{" "}
      <Box component="span" sx={{ color: "#ef4444" }}>
        *
      </Box>
    </Typography>
  );
}

/* ---------- Helper ---------- */
function shortId(id: string) {
  return "TKT-" + id.slice(-6).toUpperCase();
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function buildHistory(
  c: Complaint,
): { status: ComplaintStatus; date: string; note: string }[] {
  const h = [
    {
      status: "BARU" as ComplaintStatus,
      date: fmtDateTime(c.createdAt),
      note: "Keluhan diterima dan diklasifikasi AI",
    },
  ];
  if (c.status !== "BARU") {
    h.unshift({
      status: c.status,
      date: fmtDateTime(c.updatedAt),
      note: `Status diperbarui menjadi ${STATUS_META[c.status].label}`,
    });
  }
  return h;
}
