import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch notifications from the server
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(response.data.data || []);

      // Calculate unread count
      const unread = response.data.data.filter((notif) => !notif.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [API_URL, user]);

  // Mark a notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          `${API_URL}/api/notifications/${notificationId}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },
    [API_URL, user]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [API_URL, user]);

  // Delete a notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update local state
        const notifToRemove = notifications.find(
          (n) => n._id === notificationId
        );
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );

        // If the deleted notification was unread, update the count
        if (notifToRemove && !notifToRemove.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [API_URL, user, notifications]
  );

  // Set up polling for notifications
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // For testing - mock notifications if API is not yet implemented
  const addMockNotification = useCallback(() => {
    const mockTypes = [
      "system",
      "message",
      "invite",
      "trade",
      "group",
      "update",
    ];
    const mockType = mockTypes[Math.floor(Math.random() * mockTypes.length)];

    const mockNotification = {
      _id: Date.now().toString(),
      title: `Test ${mockType} notification`,
      message: `This is a test ${mockType} notification created at ${new Date().toLocaleTimeString()}`,
      type: mockType,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [mockNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const contextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addMockNotification, // For testing
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
