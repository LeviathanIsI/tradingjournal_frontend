import React, { useEffect } from "react";

const ToastNotification = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      <div className="pointer-events-auto animate-fade-in">
        <div
          className={`
          ${
            type === "success"
              ? "bg-green-100 border-green-500 text-green-700"
              : type === "error"
              ? "bg-red-100 border-red-500 text-red-700"
              : "bg-blue-100 border-blue-500 text-blue-700"
          } 
          border-l-4 p-4 rounded shadow-lg max-w-md mx-auto
        `}
        >
          <div className="flex justify-between items-center gap-4">
            <div className="flex-grow font-medium">{message}</div>
            <button
              onClick={onClose}
              className="p-1 text-2xl text-gray-400 hover:text-gray-600 transition-colors"
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
