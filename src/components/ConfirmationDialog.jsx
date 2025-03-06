import React, { useEffect, useRef } from "react";

const ConfirmationDialog = ({ isOpen, onClose, title, children, footer }) => {
  const dialogRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Store previous active element
      const previouslyFocused = document.activeElement;

      // Focus the dialog
      dialogRef.current.focus();

      return () => {
        // Restore focus when dialog closes
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="relative transform overflow-hidden rounded-md bg-white dark:bg-gray-700/80 px-4 pb-4 pt-5 text-left shadow-md transition-all border border-gray-100 dark:border-gray-600/50 sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="mb-4">
            <h3
              id="dialog-title"
              className="text-lg font-medium text-gray-900 dark:text-gray-100"
            >
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

export default React.memo(ConfirmationDialog);
