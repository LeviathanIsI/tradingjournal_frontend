// src/components/Navbar/NavLogo.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, useTheme } from "@mui/material";

const NavLogo = ({ logo }) => {
  const theme = useTheme();

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt="Rivyl"
            style={{
              height: theme.breakpoints.up("sm") ? "48px" : "32px",
              width: "auto",
            }}
          />
        ) : (
          // Fallback text logo if image is not available
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme.palette.mode === "dark" ? "white" : "black",
              letterSpacing: "0.5px",
            }}
          >
            Rivyl
          </Typography>
        )}
      </Link>
    </Box>
  );
};

export default React.memo(NavLogo);
