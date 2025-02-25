// src/components/ConfirmationDialog.jsx
import React from "react";

const ConfirmationDialog = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>

          {/* Content */}
          <div className="mt-2">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
