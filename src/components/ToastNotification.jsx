// src/components/ToastNotification.jsx
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
    <div className="fixed inset-0 pointer-events-none flex items-start justify-center">
      <div
        className="fixed top-4 right-4 pointer-events-auto z-[9999] animate-fade-in"
        style={{ maxWidth: "90vw" }}
      >
        <div
          className={`
            ${
              type === "success"
                ? "bg-green-100 border-green-500 text-green-700"
                : type === "error"
                ? "bg-red-100 border-red-500 text-red-700"
                : "bg-blue-100 border-blue-500 text-blue-700"
            } 
            border-l-4 p-4 rounded shadow-lg
          `}
        >
          <div className="flex justify-between items-center gap-4">
            <div className="flex-grow font-medium">{message}</div>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
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
