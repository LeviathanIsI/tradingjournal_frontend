// src/pages/MaintenancePage.jsx
import React from "react";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const MaintenancePage = () => {
  const { maintenanceMessage } = useSettings();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-yellow-100 p-3">
            <svg
              className="w-16 h-16 text-yellow-500"
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
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center dark:text-white">
          Under Maintenance
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
          {maintenanceMessage ||
            "We're currently updating our systems to serve you better. Please check back shortly."}
        </p>

        {user &&
          user.specialAccess?.hasAccess &&
          user.specialAccess?.reason === "Admin" && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-sm">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                <strong>Admin Notice:</strong> You're seeing this page because
                the site is in maintenance mode. As an admin, you can still
                access the admin panel to disable maintenance mode.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/admin/settings"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Go to Admin Settings
                </Link>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default MaintenancePage;
