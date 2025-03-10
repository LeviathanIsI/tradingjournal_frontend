import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, Cog, Archive, Trash2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../../context/NotificationsContext";

const NotificationBell = () => {
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
    // Navigate or perform action based on notification type if needed
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon with notification badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gray-700">
            <h3 className="text-sm font-medium text-gray-100">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="px-4 py-2 border-b border-gray-700 flex justify-between bg-gray-750">
            <div className="flex items-center">
              <button className="text-xs text-gray-300 hover:text-gray-100 flex items-center bg-gray-700 px-3 py-1 rounded-md mr-2">
                Filter
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gray-300 hover:text-gray-100 flex items-center bg-gray-700 px-3 py-1 rounded-md"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </button>
              )}
              <button className="text-xs text-gray-300 hover:text-gray-100 flex items-center bg-gray-700 px-3 py-1 rounded-md">
                <Cog className="h-3 w-3 mr-1" />
                Settings
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center items-center py-6">
                <div className="h-5 w-5 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-400">
                  Loading notifications...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-gray-400 mb-2">
                  You don't have any notifications
                </p>
                <p className="text-gray-500 text-sm">
                  When you receive notifications, they will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`relative px-4 py-3 hover:bg-gray-700 transition-colors ${
                      !notification.read ? "bg-gray-750" : ""
                    }`}
                  >
                    <div className="flex justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="text-sm font-medium text-gray-200">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-start space-x-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-gray-600"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-600"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-700 flex justify-between">
            <button
              className="text-xs text-gray-300 hover:text-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
            <button
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={() => {
                /* Navigate to full notifications page */
              }}
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
