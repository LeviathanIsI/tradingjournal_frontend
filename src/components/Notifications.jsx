import React from "react";

const Notification = ({ message, type = "success", onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={`${
          type === "success"
            ? "bg-green-100 border-green-500 text-green-700"
            : type === "error"
            ? "bg-red-100 border-red-500 text-red-700"
            : "bg-blue-100 border-blue-500 text-blue-700"
        } border-l-4 p-4 rounded shadow-lg max-w-sm`}
      >
        <div className="flex justify-between items-center">
          <div className="flex-grow">{message}</div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
