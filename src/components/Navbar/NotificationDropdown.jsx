import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  X,
  MoreHorizontal,
  Info,
  AlertCircle,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format the notification time
  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    // Navigate or perform action based on notification type/link if needed
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon with notification badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-medium rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-sm shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700/60 transform origin-top-right animate-[scaleIn_0.2s_ease-out]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700/40 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80">
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded text-xs">
                    {unreadCount} new
                  </span>
                )}
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-lighter flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading notifications...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                  <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700/30">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${
                      !notification.read
                        ? "bg-blue-50/70 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex">
                      {/* Notification icon */}
                      <div className="flex-shrink-0 mr-3 mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div
                        className="flex-1 cursor-pointer min-w-0"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-8">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap ml-2">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-3 right-2 flex items-center space-x-1">
                      {!notification.read ? (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-primary dark:text-primary-light hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-800/80 flex justify-between items-center">
            <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline">
              View all
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
