"use client";
import { useCallback, useEffect, useState } from "react";
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
  MenuItem,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  IconBolt,
  IconInbox,
  IconArrowLeft,
  IconBell,
  IconLogout,
  IconSearch,
  IconRefresh,
  IconDeviceFloppy,
  IconSparkles,
  IconMessageCircle,
  IconSend,
  IconChartBar,
} from "@tabler/icons-react";
import AnalyticsView from "./AnalyticsView";
import {
  STATUS_META,
  STATUS_ORDER,
  type ComplaintStatus,
} from "@/components/keluhan/statusConfig";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  CATEGORIES,
  type Priority,
} from "./priorityConfig";

const DRAWER_WIDTH = 260;

type AdminComplaint = {
  id: string;
  judul: string;
  deskripsi: string;
  status: ComplaintStatus;
  kategoriPrediksi: string | null;
  confidenceKategori: number | null;
  prioritasPrediksi: Priority | null;
  kategoriFinal: string | null;
  prioritasFinal: Priority | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string | null; email: string };
};
type Correction = {
  id: string;
  kategoriSebelum: string | null;
  kategoriSesudah: string | null;
  prioritasSebelum: Priority | null;
  prioritasSesudah: Priority | null;
  createdAt: string;
  correctedByUser?: { name: string | null } | null;
};
type Feedback = {
  id: string;
  pesan: string;
  createdAt: string;
  admin: { name: string | null };
};
type DetailComplaint = AdminComplaint & {
  corrections: Correction[];
  feedbacks: Feedback[];
};
type Snack = { type: "success" | "info" | "error"; msg: string } | null;

export default function AdminClient({
  adminName,
}: {
  adminName?: string | null;
}) {
  const [view, setView] = useState<"list" | "detail" | "analytics">("list");
  const [filters, setFilters] = useState({
    status: "",
    prioritas: "",
    kategori: "",
    q: "",
  });
  const [items, setItems] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailComplaint | null>(null);
  const [waking, setWaking] = useState(false);
  const [snack, setSnack] = useState<Snack>(null);

  const initials = (adminName ?? "Admin")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // --- Ambil daftar (dengan filter) ---
  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.status) p.set("status", filters.status);
      if (filters.prioritas) p.set("prioritas", filters.prioritas);
      if (filters.kategori) p.set("kategori", filters.kategori);
      if (filters.q) p.set("q", filters.q);
      const res = await fetch(`/api/admin/complaints?${p.toString()}`);
      const data = await res.json();
      setItems(data.complaints ?? []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce 300ms (biar search tidak spam request)
  useEffect(() => {
    const t = setTimeout(loadList, 300);
    return () => clearTimeout(t);
  }, [loadList]);

  // --- Buka detail ---
  async function openDetail(id: string) {
    setView("detail");
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`);
      const text = await res.text();
      if (!text) {
        setSnack({ type: "error", msg: "Server tidak merespons. Coba lagi." });
        setView("list");
        return;
      }
      const data = JSON.parse(text);
      if (!res.ok) {
        setSnack({ type: "error", msg: data.error ?? "Gagal membuka detail." });
        setView("list");
        return;
      }
      setDetail(data.complaint);
    } catch {
      setSnack({
        type: "error",
        msg: "Kesalahan jaringan saat membuka detail.",
      });
      setView("list");
    }
  }

  // --- Bangunkan AI ---
  async function wake() {
    setWaking(true);
    try {
      const res = await fetch("/api/admin/wake", { method: "POST" });
      const d = await res.json();
      setSnack(
        d.ok
          ? { type: "success", msg: "AI service dibangunkan." }
          : { type: "error", msg: d.error ?? "Gagal." },
      );
    } catch {
      setSnack({ type: "error", msg: "Kesalahan jaringan." });
    } finally {
      setWaking(false);
    }
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      {/* SIDEBAR */}
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
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: 1.5,
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
              <Box>
                <Typography
                  sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1 }}
                >
                  Resolv.ai
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                  Admin Panel
                </Typography>
              </Box>
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
                <ListItemButton onClick={() => setView("list")} selected={view === "list" || view === "detail"}
                  sx={{ borderRadius: 2, mb: 0.5, color: (view === "list" || view === "detail") ? "primary.main" : "#475569", "&.Mui-selected": { bgcolor: "#eff6ff" }, "&.Mui-selected:hover": { bgcolor: "#eff6ff" } }}>
                  <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}><IconInbox size={18} /></ListItemIcon>
                  <ListItemText slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }} primary="Semua Keluhan" />
                </ListItemButton>
                <ListItemButton onClick={() => setView("analytics")} selected={view === "analytics"}
                  sx={{ borderRadius: 2, color: view === "analytics" ? "primary.main" : "#475569", "&.Mui-selected": { bgcolor: "#eff6ff" }, "&.Mui-selected:hover": { bgcolor: "#eff6ff" } }}>
                  <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}><IconChartBar size={18} /></ListItemIcon>
                  <ListItemText slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }} primary="Analitik" />
                </ListItemButton>
              </List>
            </Box>
          </Box>
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <Stack
              sx={{ flexDirection: "row", gap: 1.5, alignItems: "center" }}
            >
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
                  {adminName ?? "Admin"}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Admin
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

      {/* MAIN */}
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
            <Stack sx={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
              {view === "detail" ? (
                <Button onClick={() => setView("list")} startIcon={<IconArrowLeft size={16} />} sx={{ color: "#475569", textTransform: "none", fontWeight: 600 }}>Kembali</Button>
              ) : view === "analytics" ? (
                <Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Analitik</Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>Ringkasan tren keluhan & performa penanganan</Typography>
                </Box>
              ) : (
                <Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Semua Keluhan</Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>Kelola, tinjau, & koreksi keluhan konsumen</Typography>
                </Box>
              )}
            </Stack>
            <Stack sx={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
              <Button
                onClick={wake}
                disabled={waking}
                variant="outlined"
                startIcon={
                  waking ? (
                    <CircularProgress size={16} />
                  ) : (
                    <IconRefresh size={16} />
                  )
                }
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                {waking ? "Membangunkan..." : "Wake Up AI"}
              </Button>
              <IconButton sx={{ color: "#94a3b8" }}>
                <IconBell size={20} />
              </IconButton>
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
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 4, flex: 1 }}>
          {view === "analytics" ? (
            <AnalyticsView />
          ) : view === "list" ? (
            <Stack spacing={3}>
              {/* FILTER BAR */}
              <Card
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
              >
                <CardContent sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Cari judul / deskripsi..."
                    value={filters.q}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, q: e.target.value }))
                    }
                    sx={{ flex: 1, minWidth: 220 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconSearch size={18} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">Semua Status</MenuItem>
                    {STATUS_ORDER.map((s) => (
                      <MenuItem key={s} value={s}>
                        {STATUS_META[s].label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Prioritas"
                    value={filters.prioritas}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, prioritas: e.target.value }))
                    }
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">Semua Prioritas</MenuItem>
                    {PRIORITY_ORDER.map((p) => (
                      <MenuItem key={p} value={p}>
                        {PRIORITY_META[p].label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Kategori"
                    value={filters.kategori}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, kategori: e.target.value }))
                    }
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="">Semua Kategori</MenuItem>
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </CardContent>
              </Card>

              {/* TABEL */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                }}
              >
                {loading ? (
                  <Stack sx={{ alignItems: "center", py: 8 }}>
                    <CircularProgress />
                  </Stack>
                ) : items.length === 0 ? (
                  <Typography
                    sx={{ color: "text.secondary", textAlign: "center", py: 8 }}
                  >
                    Tidak ada keluhan yang cocok.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              fontWeight: 700,
                              color: "#64748b",
                              fontSize: 12,
                              bgcolor: "#f8fafc",
                            },
                          }}
                        >
                          <TableCell>Keluhan</TableCell>
                          <TableCell>Pelapor</TableCell>
                          <TableCell>Kategori</TableCell>
                          <TableCell>Prioritas</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Tanggal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((c) => {
                          const kategori =
                            c.kategoriFinal ?? c.kategoriPrediksi;
                          const prioritas =
                            c.prioritasFinal ?? c.prioritasPrediksi;
                          return (
                            <TableRow
                              key={c.id}
                              hover
                              onClick={() => openDetail(c.id)}
                              sx={{ cursor: "pointer" }}
                            >
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "#0f172a",
                                  }}
                                >
                                  {c.judul}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: 11, color: "#94a3b8" }}
                                >
                                  {shortId(c.id)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 13 }}>
                                  {c.user.name ?? c.user.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {kategori ? (
                                  <Typography sx={{ fontSize: 13 }}>
                                    {kategori}
                                  </Typography>
                                ) : (
                                  <Typography
                                    sx={{ fontSize: 12, color: "#cbd5e1" }}
                                  >
                                    —
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {prioritas ? (
                                  <PriorityChip p={prioritas} />
                                ) : (
                                  <Typography
                                    sx={{ fontSize: 12, color: "#cbd5e1" }}
                                  >
                                    —
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <StatusChip s={c.status} />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{ fontSize: 12, color: "#64748b" }}
                                >
                                  {fmtDate(c.createdAt)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </Stack>
          ) : detail === null ? (
            <Stack sx={{ alignItems: "center", py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <DetailPanel
              data={detail}
              onSaved={(msg) => {
                setSnack({ type: "success", msg });
                loadList();
                openDetail(detail.id);
              }}
              onError={(msg) => setSnack({ type: "error", msg })}
            />
          )}
        </Box>
      </Box>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
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

/* ---------- Detail panel (dengan edit) ---------- */
function DetailPanel({
  data,
  onSaved,
  onError,
}: {
  data: DetailComplaint;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [status, setStatus] = useState<ComplaintStatus>(data.status);
  const [kategoriFinal, setKategoriFinal] = useState<string>(
    data.kategoriFinal ?? "",
  );
  const [prioritasFinal, setPrioritasFinal] = useState<Priority | "">(
    data.prioritasFinal ?? "",
  );
  const [saving, setSaving] = useState(false);

  const changed =
    status !== data.status ||
    (kategoriFinal || null) !== data.kategoriFinal ||
    (prioritasFinal || null) !== data.prioritasFinal;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/complaints/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          kategoriFinal: kategoriFinal || null,
          prioritasFinal: prioritasFinal || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        onError(d.error ?? "Gagal menyimpan.");
        return;
      }
      onSaved("Perubahan tersimpan.");
    } catch {
      onError("Kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 920 }}>
      <Stack spacing={2.5}>
        {/* Header */}
        <Box>
          <Stack
            sx={{ flexDirection: "row", gap: 1, alignItems: "center", mb: 1 }}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}
            >
              {shortId(data.id)}
            </Typography>
            <StatusChip s={data.status} />
          </Stack>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
            {data.judul}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.5 }}>
            Oleh {data.user.name ?? data.user.email} •{" "}
            {fmtDateTime(data.createdAt)}
          </Typography>
        </Box>

        {/* Analisis AI (read-only) */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #dbeafe",
            bgcolor: "#f8faff",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              sx={{ flexDirection: "row", gap: 1, alignItems: "center", mb: 2 }}
            >
              <IconSparkles size={16} color="#5D5FEF" />
              <Typography
                sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}
              >
                Analisis AI (mBERT)
              </Typography>
            </Stack>
            <Stack sx={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
              <Box>
                <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                  Kategori prediksi
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {data.kategoriPrediksi ?? "— (fallback)"}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                  Confidence
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {data.confidenceKategori != null
                    ? `${Math.round(data.confidenceKategori * 100)}%`
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                  Prioritas prediksi
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {data.prioritasPrediksi ? (
                    <PriorityChip p={data.prioritasPrediksi} />
                  ) : (
                    <Typography sx={{ fontSize: 13 }}>—</Typography>
                  )}
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Kelola (edit) */}
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a", mb: 2 }}
            >
              Kelola Keluhan
            </Typography>
            <Stack
              sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}
            >
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
              >
                {STATUS_ORDER.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                label="Kategori (final)"
                value={kategoriFinal}
                onChange={(e) => setKategoriFinal(e.target.value)}
              >
                <MenuItem value="">— Belum diset —</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                label="Prioritas (final)"
                value={prioritasFinal}
                onChange={(e) => setPrioritasFinal(e.target.value as Priority)}
              >
                <MenuItem value="">— Belum diset —</MenuItem>
                {PRIORITY_ORDER.map((p) => (
                  <MenuItem key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 2 }}>
              Mengubah kategori/prioritas akan tercatat sebagai <b>koreksi</b>{" "}
              (audit trail untuk retraining).
            </Typography>
            <Button
              onClick={save}
              disabled={!changed || saving}
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <IconDeviceFloppy size={16} />
                )
              }
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardContent>
        </Card>

        {/* Deskripsi */}
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a", mb: 1.5 }}
            >
              Deskripsi Keluhan
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {data.deskripsi}
            </Typography>
          </CardContent>
        </Card>

        {/* Riwayat koreksi */}
        {data.corrections.length > 0 && (
          <Card
            elevation={0}
            sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a", mb: 2 }}
              >
                Riwayat Koreksi
              </Typography>
              <Stack spacing={1.5}>
                {data.corrections.map((k) => (
                  <Box
                    key={k.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}
                    >
                      {fmtDateTime(k.createdAt)} • oleh{" "}
                      {k.correctedByUser?.name ?? "admin"}
                    </Typography>
                    {k.kategoriSebelum !== k.kategoriSesudah && (
                      <Typography sx={{ fontSize: 13 }}>
                        Kategori: <b>{k.kategoriSebelum ?? "—"}</b> →{" "}
                        <b>{k.kategoriSesudah ?? "—"}</b>
                      </Typography>
                    )}
                    {k.prioritasSebelum !== k.prioritasSesudah && (
                      <Typography sx={{ fontSize: 13 }}>
                        Prioritas: <b>{k.prioritasSebelum ?? "—"}</b> →{" "}
                        <b>{k.prioritasSesudah ?? "—"}</b>
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Feedback ke User */}
        <FeedbackBox complaintId={data.id} initialFeedbacks={data.feedbacks} />
      </Stack>
    </Box>
  );
}

/* ---------- Feedback Box (kirim pesan ke user) ---------- */
function FeedbackBox({
  complaintId,
  initialFeedbacks,
}: {
  complaintId: string;
  initialFeedbacks: Feedback[];
}) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [pesan, setPesan] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    if (!pesan.trim()) return;
    setSending(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error ?? "Gagal.");
        return;
      }
      setFeedbacks((prev) => [...prev, d.feedback]);
      setPesan("");
    } catch {
      setErr("Kesalahan jaringan.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          sx={{ flexDirection: "row", gap: 1, alignItems: "center", mb: 2.5 }}
        >
          <IconMessageCircle size={16} color="#5D5FEF" />
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
            Feedback ke User
          </Typography>
          {feedbacks.length > 0 && (
            <Chip
              label={feedbacks.length}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: "#ede9fe",
                color: "#7c3aed",
              }}
            />
          )}
        </Stack>

        {/* Daftar pesan */}
        {feedbacks.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              bgcolor: "#f8fafc",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
              Belum ada feedback yang dikirim.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            {feedbacks.map((fb) => (
              <Box
                key={fb.id}
                sx={{
                  bgcolor: "#f0f4ff",
                  borderRadius: "12px 12px 12px 4px",
                  p: 2,
                  border: "1px solid #dbeafe",
                  maxWidth: "85%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#1e293b",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {fb.pesan}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.5 }}>
                  {fb.admin.name ?? "Admin"} • {fmtDateTime(fb.createdAt)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {/* Input kirim pesan */}
        <Stack spacing={1.5}>
          {err && (
            <Alert severity="error" sx={{ fontSize: 12 }}>
              {err}
            </Alert>
          )}
          <TextField
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            size="small"
            placeholder="Tulis pesan untuk user..."
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            sx={{ bgcolor: "#fff" }}
          />
          <Button
            onClick={send}
            disabled={!pesan.trim() || sending}
            variant="contained"
            startIcon={
              sending ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <IconSend size={15} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              alignSelf: "flex-end",
              bgcolor: "#5D5FEF",
              "&:hover": { bgcolor: "#4749c4" },
            }}
          >
            {sending ? "Mengirim..." : "Kirim Feedback"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ---------- Chip & helper ---------- */
function StatusChip({ s }: { s: ComplaintStatus }) {
  const m = STATUS_META[s];
  return (
    <Chip
      label={m.label}
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 700,
        color: m.main,
        bgcolor: m.bg,
        border: `1px solid ${m.main}33`,
      }}
    />
  );
}
function PriorityChip({ p }: { p: Priority }) {
  const m = PRIORITY_META[p];
  return (
    <Chip
      label={m.label}
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 700,
        color: m.main,
        bgcolor: m.bg,
        border: `1px solid ${m.main}33`,
      }}
    />
  );
}
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
