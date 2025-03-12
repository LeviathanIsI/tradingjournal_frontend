// src/components/Navbar/DesktopMenu.jsx
import React from "react";
import { Link } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";
import NotificationBell from "./NotificationBell";
import { ShieldAlert } from "lucide-react";

// Material UI components
import {
  Box,
  Button,
  Typography,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";

const DesktopMenu = ({ user, hasAccessToFeature, handleLogout }) => {
  const theme = useTheme();

  // Check if user is admin
  const isAdmin =
    user?.specialAccess?.hasAccess && user?.specialAccess?.reason === "Admin";

  // Button base styling
  const buttonStyle = {
    textTransform: "none",
    fontSize: "0.875rem",
    py: 1,
    px: 1.5,
    borderRadius: 1,
    color: theme.palette.mode === "dark" ? "gray.300" : "gray.700",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
      color: theme.palette.mode === "dark" ? "white" : "black",
    },
  };

  // Secondary action button (Sign Up)
  const actionButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme.palette.primary.main,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  };

  // Admin badge style - Updated to match the new blue color scheme
  const adminButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb", // Blue color matching theme
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "#2563eb" : "#1d4ed8",
    },
    display: "flex",
    alignItems: "center",
  };

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
      {!user ? (
        <>
          <ThemeSwitcher />
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              mx: 2,
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
            }}
          />

          <Button component={Link} to="/pricing" sx={buttonStyle}>
            Pricing
          </Button>

          <Button component={Link} to="/login" sx={buttonStyle}>
            Login
          </Button>

          <Button component={Link} to="/signup" sx={actionButtonStyle}>
            Sign Up
          </Button>
        </>
      ) : (
        <Stack direction="row" spacing={2} alignItems="center">
          <Button component={Link} to="/dashboard" sx={buttonStyle}>
            Dashboard
          </Button>

          {hasAccessToFeature("premium") && (
            <>
              <Button component={Link} to="/trade-planning" sx={buttonStyle}>
                Trade Planning
              </Button>

              <Button component={Link} to="/community" sx={buttonStyle}>
                Community
              </Button>
            </>
          )}

          {/* Admin Link - Updated with new blue styling */}
          {isAdmin && (
            <Button component={Link} to="/admin" sx={adminButtonStyle}>
              <ShieldAlert className="h-4 w-4 mr-1" />
              Admin
            </Button>
          )}

          <ThemeSwitcher />
          <NotificationBell />

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              mx: 1,
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
            }}
          />

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.mode === "dark" ? "gray.300" : "gray.700",
              px: 1.5,
            }}
          >
            Welcome, {user.username}
          </Typography>

          <Button component={Link} to="/profile" sx={buttonStyle}>
            Profile
          </Button>

          <Button component={Link} to="/pricing" sx={buttonStyle}>
            Pricing
          </Button>

          <Button onClick={handleLogout} sx={buttonStyle}>
            Logout
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default React.memo(DesktopMenu);
