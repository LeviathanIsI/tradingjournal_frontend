// src/components/MaintenanceMode.jsx
import React from "react";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";

const MaintenanceMode = () => {
  const { maintenanceMessage } = useSettings();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Maintenance in Progress
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {maintenanceMessage ||
            "The site is currently undergoing scheduled maintenance. Please check back shortly."}
        </p>

        {user &&
          user.specialAccess?.hasAccess &&
          user.specialAccess?.reason === "Admin" && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-sm">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You're seeing this page because the site is in maintenance mode.
                As an admin, you can still access the admin panel.
              </p>
              <a
                href="/admin"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Go to Admin Panel
              </a>
            </div>
          )}
      </div>
    </div>
  );
};

export default MaintenanceMode;
