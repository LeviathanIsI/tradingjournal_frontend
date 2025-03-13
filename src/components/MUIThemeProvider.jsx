import React, { useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "../context/ThemeContext";

const MUIThemeProvider = ({ children }) => {
  const { isDark } = useTheme();

  // Create a theme instance based on the current theme mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: {
            main: "#3b82f6", // blue-500
          },
          secondary: {
            main: "#8b5cf6", // purple-500
          },
          background: {
            default: isDark ? "#0f172a" : "#ffffff",
            paper: isDark ? "#1e293b" : "#f9fafb",
          },
          ...(isDark && {
            text: {
              primary: "#f3f4f6",
              secondary: "#9ca3af",
            },
          }),
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                boxShadow: "none",
                ":hover": {
                  boxShadow: "none",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                ...(isDark && {
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.5)",
                }),
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.1)",
              },
            },
          },
        },
      }),
    [isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MUIThemeProvider;
