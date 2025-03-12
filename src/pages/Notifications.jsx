import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Trash2,
  Bell,
  ChevronLeft,
  Info,
  AlertCircle,
  Clock,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Format the notification time
  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups = {};

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey;

      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(notification);
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate();

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    // Navigate or perform action based on notification type if needed
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return (
          <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
        );
      case "info":
        return <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      case "update":
        return (
          <RefreshCw className="h-4 w-4 text-green-500 dark:text-green-400" />
        );
      default:
        return <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary hover:text-primary/80 dark:hover:text-primary/90 font-medium transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Stay updated with your trading activity
                </p>
              </div>

              {unreadCount > 0 && (
                <div className="ml-3 bg-red-500 text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary bg-primary/10 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors flex items-center rounded-md px-3 py-2 shadow-sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {loading && notifications.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-lg shadow-md backdrop-blur-sm p-12 flex flex-col items-center justify-center">
            <div className="h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading notifications...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p>Error loading notifications. Please try again.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-lg shadow-md backdrop-blur-sm p-12 text-center">
            <div className="bg-gray-100 dark:bg-gray-700/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              When you receive notifications about your trading activity or
              system updates, they will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-lg overflow-hidden shadow-md backdrop-blur-sm">
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                <div className="bg-gray-50/80 dark:bg-gray-700/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700/40 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {date}
                  </h2>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700/40">
                  {notifs.map((notification) => (
                    <li
                      key={notification._id}
                      className={`relative hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors ${
                        !notification.read
                          ? "bg-blue-50/70 dark:bg-blue-900/10"
                          : ""
                      }`}
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex justify-between">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="flex items-center mb-2">
                              <span className="mr-2">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 pl-6 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(notification.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-start ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-primary hover:bg-primary/10 dark:hover:bg-primary/20 p-2 rounded-md transition-colors"
                                title="Mark as read"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification._id)
                              }
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
