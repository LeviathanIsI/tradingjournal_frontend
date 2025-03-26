import React from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

const Notification = ({ message, type = "success", onClose }) => {
  // Get the appropriate icon based on notification type
  const NotificationIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
        );
      case "error":
        return (
          <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
        );
      default:
        return (
          <Info className="h-5 w-5 text-primary dark:text-primary-light" />
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-fade-in">
      <div
        className={`${
          type === "success"
            ? "bg-green-50/95 dark:bg-green-900/20 border-green-500/50 dark:border-green-500/30 text-green-800 dark:text-green-300"
            : type === "error"
            ? "bg-red-50/95 dark:bg-red-900/20 border-red-500/50 dark:border-red-500/30 text-red-800 dark:text-red-300"
            : "bg-blue-50/95 dark:bg-blue-900/20 border-primary/50 dark:border-primary/30 text-primary-dark dark:text-primary-light"
        } border-l-4 p-4 round-sm shadow-md backdrop-blur-sm w-full sm:max-w-md`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <NotificationIcon />
            <div className="flex-grow text-sm font-medium">{message}</div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1 round-sm text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
