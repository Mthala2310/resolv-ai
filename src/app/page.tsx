"use client";
import { Box, Button, Card, Typography, Stack } from "@mui/material";

export default function Home() {
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
      <Card sx={{ p: 4, maxWidth: 420, width: "100%" }}>
        <Stack spacing={2}>
          <Typography variant="h3" color="primary">
            Resolv.ai
          </Typography>
          <Typography color="text.secondary">
            Tema MUI berhasil terpasang. Ini kartu uji dengan font Plus Jakarta
            Sans.
          </Typography>
          <Button variant="contained">Tombol Primary</Button>
          <Button variant="outlined" color="secondary">
            Tombol Secondary
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
