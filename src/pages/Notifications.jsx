import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2, Bell, ChevronLeft } from "lucide-react";
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center border border-blue-600 dark:border-blue-400 rounded-md px-3 py-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading notifications...
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-md p-4">
          <p className="text-red-700 dark:text-red-400">
            Error loading notifications. Please try again.
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            When you receive notifications, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden shadow-sm">
          {Object.entries(groupedNotifications).map(([date, notifs]) => (
            <div key={date}>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {date}
                </h2>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifs.map((notification) => (
                  <li
                    key={notification._id}
                    className={`relative hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-start ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Mark as read"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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
  );
};

export default NotificationsPage;
