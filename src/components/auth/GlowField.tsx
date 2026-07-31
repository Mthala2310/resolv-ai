"use client";
import { useState } from "react";
import {
  Box,
  InputBase,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

type Props = {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  startIcon?: React.ReactNode;
  required?: boolean;
  passwordToggle?: boolean;
};

export default function GlowField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  startIcon,
  required,
  passwordToggle,
}: Props) {
  const [x, setX] = useState(0);
  const [hover, setHover] = useState(false);
  const [show, setShow] = useState(false);

  const effectiveType = passwordToggle ? (show ? "text" : "password") : type;

  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography
          component="label"
          sx={{
            display: "block",
            mb: 0.75,
            fontSize: 14,
            fontWeight: 500,
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      )}

      <Box
        onMouseMove={(e) =>
          setX(e.clientX - e.currentTarget.getBoundingClientRect().left)
        }
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          position: "relative",
          borderRadius: 2,
          border: "2px solid",
          borderColor: "divider",
          bgcolor: "#F7F8FC",
          transition: "background-color .2s ease, border-color .2s ease",
          "&:focus-within": { bgcolor: "#fff", borderColor: "primary.main" },
        }}
      >
        <InputBase
          fullWidth
          required={required}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          startAdornment={
            startIcon ? (
              <InputAdornment
                position="start"
                sx={{ ml: 1.5, color: "text.secondary" }}
              >
                {startIcon}
              </InputAdornment>
            ) : undefined
          }
          endAdornment={
            passwordToggle ? (
              <InputAdornment position="end" sx={{ mr: 0.5 }}>
                <IconButton
                  onClick={() => setShow((s) => !s)}
                  edge="end"
                  size="small"
                >
                  {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </IconButton>
              </InputAdornment>
            ) : undefined
          }
          sx={{ height: 52, px: 1.5, fontSize: 15 }}
        />

        {/* Border glow atas & bawah, ngikut posisi kursor */}
        {hover && (
          <>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                borderRadius: "6px 6px 0 0",
                pointerEvents: "none",
                zIndex: 2,
              }}
              style={{
                background: `radial-gradient(30px circle at ${x}px 0px, #5D5FEF 0%, transparent 70%)`,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                borderRadius: "0 0 6px 6px",
                pointerEvents: "none",
                zIndex: 2,
              }}
              style={{
                background: `radial-gradient(30px circle at ${x}px 2px, #5D5FEF 0%, transparent 70%)`,
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
