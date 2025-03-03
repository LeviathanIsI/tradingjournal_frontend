import React from "react";

const Notification = ({ message, type = "success", onClose }) => {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-fade-in">
      <div
        className={`${
          type === "success"
            ? "bg-green-100 dark:bg-green-700/30 border-green-500 dark:border-green-500/70 text-green-700 dark:text-green-300"
            : type === "error"
            ? "bg-red-100 dark:bg-red-700/30 border-red-500 dark:border-red-500/70 text-red-700 dark:text-red-300"
            : "bg-blue-100 dark:bg-blue-700/30 border-blue-500 dark:border-blue-500/70 text-blue-700 dark:text-blue-300"
        } border-l-4 p-3 sm:p-4 rounded-sm shadow-sm w-full sm:max-w-sm`}
      >
        <div className="flex justify-between items-center">
          <div className="flex-grow text-sm sm:text-base">{message}</div>
          <button
            onClick={onClose}
            className="ml-3 sm:ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 p-1"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
