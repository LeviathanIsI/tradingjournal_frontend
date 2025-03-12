// src/components/Navbar/ThemeSwitcher.jsx
import React from "react";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { IconButton, Box, useTheme } from "@mui/material";
import { useTheme as useAppTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "lucide-react";

const ThemeSwitcher = () => {
  const { toggleTheme, isDark } = useAppTheme();
  const theme = useTheme();

  return (
    <IconButton
      onClick={toggleTheme}
      sx={{
        p: 1.5,
        backgroundColor: isDark
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
        borderRadius: "50%",
        color: isDark ? theme.palette.primary.main : theme.palette.primary.main,
        "&:hover": {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.1)",
        },
        transition: "all 0.3s ease",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <MoonIcon size={18} /> : <SunIcon size={18} />}
    </IconButton>
  );
};

export default ThemeSwitcher;
