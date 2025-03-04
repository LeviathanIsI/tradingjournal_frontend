// src/components/ToastNotification.jsx

import React from "react";

const ToastNotification = ({
  message,
  type = "success",
  onClose,
  autoClose = true,
}) => {
  React.useEffect(() => {
    // Only auto-hide if autoClose is true
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose, autoClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      <div className="pointer-events-auto animate-fade-in">
        <div
          className={`
          ${
            type === "success"
              ? "bg-green-200 border-green-600 text-green-900 dark:bg-green-700/40 dark:border-green-400 dark:text-green-200"
              : type === "error"
              ? "bg-red-200 border-red-600 text-red-900 dark:bg-red-700/40 dark:border-red-400 dark:text-red-200"
              : type === "welcome"
              ? "bg-blue-200 border-blue-600 text-blue-900 dark:bg-blue-900/50 dark:border-blue-400 dark:text-blue-200"
              : "bg-blue-200 border-blue-600 text-blue-900 dark:bg-blue-700/40 dark:border-blue-400 dark:text-blue-200"
          } 
          border-l-4 p-4 md:p-5 rounded-md shadow-lg max-w-md md:max-w-lg mx-auto transition-all duration-300
        `}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow font-medium">{message}</div>
            <button
              onClick={onClose}
              className="p-1 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
