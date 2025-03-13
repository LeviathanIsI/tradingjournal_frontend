import React, { useEffect, useRef } from "react";

const ToastNotification = ({
  message,
  type = "success",
  onClose,
  autoClose = true,
  position = "top-right",
}) => {
  const toastRef = useRef(null);

  // Auto-close logic
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  // Click-outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toastRef.current && !toastRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Get toast type styles
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-white/90 dark:bg-gray-800/90 border-l-4 border-green-500 text-gray-900 dark:text-gray-100";
      case "error":
        return "bg-white/90 dark:bg-gray-800/90 border-l-4 border-red-500 text-gray-900 dark:text-gray-100";
      case "warning":
        return "bg-white/90 dark:bg-gray-800/90 border-l-4 border-yellow-500 text-gray-900 dark:text-gray-100";
      case "info":
        return "bg-white/90 dark:bg-gray-800/90 border-l-4 border-blue-500 text-gray-900 dark:text-gray-100";
      case "welcome":
        return "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary text-gray-900 dark:text-gray-100";
      default:
        return "bg-white/90 dark:bg-gray-800/90 border-l-4 border-blue-500 text-gray-900 dark:text-gray-100";
    }
  };

  // Get toast position styles
  const getPositionStyles = () => {
    switch (position) {
      case "top-left":
        return "items-start justify-start p-4";
      case "top-center":
        return "items-start justify-center p-4";
      case "top-right":
        return "items-start justify-end p-4";
      case "bottom-left":
        return "items-end justify-start p-4";
      case "bottom-center":
        return "items-end justify-center p-4";
      case "bottom-right":
        return "items-end justify-end p-4";
      default:
        return "items-start justify-end p-4";
    }
  };

  // Get type icon
  const getTypeIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-green-500 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 text-yellow-500 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      case "welcome":
        return (
          <svg
            className="w-5 h-5 text-primary flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 flex pointer-events-none z-[9999] ${getPositionStyles()}`}
    >
      <div
        className="pointer-events-auto transform transition-all duration-300 ease-out animate-[fadeIn_0.3s_ease-out] max-w-sm"
        ref={toastRef}
      >
        <div
          className={`${getTypeStyles()} shadow-lg rounded-lg backdrop-blur-sm p-4 overflow-hidden`}
        >
          <div className="flex items-start gap-3">
            {getTypeIcon()}
            <div className="flex-grow">
              <div className="font-medium text-sm">{message}</div>
              {type === "welcome" && (
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                  <div className="h-1 bg-primary animate-[progress_5s_linear]"></div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50 transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add progress animation to your CSS or tailwind.config.js
// @keyframes progress {
//   0% { width: 100%; }
//   100% { width: 0%; }
// }
// @keyframes fadeIn {
//   0% { opacity: 0; transform: translateY(-10px); }
//   100% { opacity: 1; transform: translateY(0); }
// }

export default ToastNotification;
