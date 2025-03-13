// src/components/Navbar/MobileMenu.jsx
import React from "react";
import { Link } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";
import { Bell, ShieldAlert } from "lucide-react";
import { useNotifications } from "../../context/NotificationsContext";

// Material UI imports
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
  useTheme,
  Badge,
} from "@mui/material";

const MobileMenu = ({
  isOpen,
  setIsOpen,
  user,
  hasAccessToFeature,
  handleLogout,
}) => {
  const theme = useTheme();
  const { unreadCount } = useNotifications();

  // Check if user is admin
  const isAdmin =
    user?.specialAccess?.hasAccess && user?.specialAccess?.reason === "Admin";

  const menuItemStyle = {
    borderRadius: 1,
    mb: 0.5,
    py: 1,
    px: 2,
    color:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(0, 0, 0, 0.7)",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
    },
  };

  // Updated admin style to match the blue color scheme
  const adminItemStyle = {
    ...menuItemStyle,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(37, 99, 235, 0.1)",
    color: theme.palette.mode === "dark" ? "#60a5fa" : "#2563eb",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(59, 130, 246, 0.3)"
          : "rgba(37, 99, 235, 0.2)",
    },
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor:
            theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
          borderLeft:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <Box sx={{ width: "100%", pt: 8 }}>
        {/* User Welcome */}
        {user && (
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.7)",
              }}
            >
              Welcome, {user.username}
            </Typography>
          </Box>
        )}

        {/* Menu Items */}
        <Box sx={{ overflowY: "auto", flexGrow: 1, p: 2 }}>
          <List disablePadding>
            {!user ? (
              <>
                <ListItemButton
                  component={Link}
                  to="/pricing"
                  sx={menuItemStyle}
                >
                  <ListItemText primary="Pricing" />
                </ListItemButton>

                <ListItemButton component={Link} to="/login" sx={menuItemStyle}>
                  <ListItemText primary="Login" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/signup"
                  sx={{
                    ...menuItemStyle,
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  <ListItemText primary="Sign Up" />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton
                  component={Link}
                  to="/dashboard"
                  sx={menuItemStyle}
                >
                  <ListItemText primary="Dashboard" />
                </ListItemButton>

                {hasAccessToFeature("premium") && (
                  <>
                    <ListItemButton
                      component={Link}
                      to="/trade-planning"
                      sx={menuItemStyle}
                    >
                      <ListItemText primary="Trade Planning" />
                    </ListItemButton>

                    <ListItemButton
                      component={Link}
                      to="/community"
                      sx={menuItemStyle}
                    >
                      <ListItemText primary="Community" />
                    </ListItemButton>
                  </>
                )}

                {/* Admin Link - Updated with new blue styling */}
                {isAdmin && (
                  <ListItemButton
                    component={Link}
                    to="/admin"
                    sx={adminItemStyle}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                      <ShieldAlert size={20} />
                    </ListItemIcon>
                    <ListItemText primary="Admin Panel" />
                  </ListItemButton>
                )}

                {/* Notifications Link for Mobile */}
                <ListItemButton
                  component={Link}
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  sx={menuItemStyle}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                    <Bell size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                  {unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount > 9 ? "9+" : unreadCount}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#3b82f6"
                              : "#2563eb",
                        },
                      }}
                    />
                  )}
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/profile"
                  sx={menuItemStyle}
                >
                  <ListItemText primary="Profile" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/pricing"
                  sx={menuItemStyle}
                >
                  <ListItemText primary="Pricing" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2,
            borderTop:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <ThemeSwitcher />

          {user && (
            <Button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              fullWidth
              variant="outlined"
              color="error"
              sx={{
                textTransform: "none",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(239, 68, 68, 0.5)"
                    : "rgba(239, 68, 68, 0.5)",
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default React.memo(MobileMenu);
