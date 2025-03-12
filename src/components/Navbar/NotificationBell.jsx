// src/components/Navbar/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationsContext";
import { Bell, Check, Trash2, X } from "lucide-react";

// Material UI components
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  CircularProgress,
  useTheme,
} from "@mui/material";

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notifications-popover" : undefined;

  // Format the notification time
  const formatTime = (date) => {
    try {
      const messageDate = new Date(date);
      const now = new Date();
      const diffMinutes = Math.floor((now - messageDate) / (1000 * 60));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return messageDate.toLocaleDateString();
    } catch (error) {
      return "some time ago";
    }
  };

  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        size="medium"
        aria-label="show notifications"
        color="inherit"
        sx={{
          color: theme.palette.mode === "dark" ? "gray.300" : "gray.700",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="primary"
          invisible={unreadCount === 0}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor:
                theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb",
              color: "white",
              fontWeight: "bold",
              minWidth: "20px",
              height: "20px",
            },
          }}
        >
          <Bell size={20} />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: { xs: 300, sm: 360 },
            maxHeight: 500,
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "dark" ? "#1e293b" : "white",
            border:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor:
              theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          <IconButton size="small" onClick={handleClose} color="inherit">
            <X size={18} />
          </IconButton>
        </Box>

        {/* Action Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            borderBottom:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(15, 23, 42, 0.5)"
                : "rgba(248, 250, 252, 0.7)",
          }}
        >
          <Button
            size="small"
            startIcon={<IconButton size="small">Filter</IconButton>}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
              color:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
            }}
          >
            Filter
          </Button>

          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<Check size={14} />}
              onClick={() => {
                markAllAsRead();
              }}
              sx={{
                fontSize: "0.75rem",
                textTransform: "none",
                color: theme.palette.primary.main,
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {/* Notification List */}
        <List
          sx={{
            p: 0,
            maxHeight: 320,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
            },
            "&::-webkit-scrollbar-thumb": {
              background: theme.palette.mode === "dark" ? "#334155" : "#cbd5e1",
              borderRadius: "4px",
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 6,
              }}
            >
              <CircularProgress size={24} />
              <Typography
                variant="body2"
                sx={{ ml: 2, color: "text.secondary" }}
              >
                Loading...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                No notifications
              </Typography>
              <Typography variant="body2" color="text.disabled">
                When you receive notifications, they will appear here.
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification._id}
                divider
                disablePadding
                sx={{
                  backgroundColor: !notification.read
                    ? theme.palette.mode === "dark"
                      ? "rgba(59, 130, 246, 0.08)"
                      : "rgba(59, 130, 246, 0.05)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                  },
                  cursor: "pointer",
                }}
                onClick={() => markAsRead(notification._id)}
              >
                <Box sx={{ width: "100%", p: 2 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color:
                            theme.palette.mode === "dark" ? "white" : "black",
                          fontWeight: !notification.read ? 600 : 500,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mt: 0.5,
                          fontSize: "0.8125rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.disabled",
                          mt: 1,
                          display: "block",
                        }}
                      >
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        sx={{
                          color: "text.disabled",
                          "&:hover": {
                            color: theme.palette.error.main,
                          },
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))
          )}
        </List>

        {/* Footer */}
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            justifyContent: "space-between",
            borderTop:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor:
              theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc",
          }}
        >
          <Button
            size="small"
            onClick={handleClose}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Close
          </Button>
          <Button
            component={Link}
            to="/notifications"
            size="small"
            onClick={handleClose}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
              color: theme.palette.primary.main,
            }}
          >
            View all
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
