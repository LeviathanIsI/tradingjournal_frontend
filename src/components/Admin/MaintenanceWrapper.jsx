// src/components/common/MaintenanceWrapper.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

/**
 * Wrapper component to redirect to maintenance page when site is in maintenance mode
 * Admins bypass this check and are allowed to access all routes
 */
const MaintenanceWrapper = ({ children }) => {
  const { isMaintenanceMode, settings } = useSettings();
  const { user } = useAuth();
  
  // Check if user is an admin
  const isAdmin = user?.specialAccess?.hasAccess && user?.specialAccess?.reason === "Admin";

  console.log("[MaintenanceWrapper] Checking maintenance mode:", isMaintenanceMode);
  console.log("[MaintenanceWrapper] User is admin:", isAdmin);
  
  // Wait for settings to be loaded
  if (settings.isLoading) {
    console.log("[MaintenanceWrapper] Settings still loading...");
    // Return a simple loading state while we wait for settings
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If site is in maintenance mode and user is not an admin, redirect to maintenance page
  if (isMaintenanceMode && !isAdmin) {
    console.log("[MaintenanceWrapper] In maintenance mode and not admin, redirecting to maintenance page");
    return <Navigate to="/maintenance" replace />;
  }

  // Otherwise, render children as normal
  console.log("[MaintenanceWrapper] Maintenance check passed, rendering content");
  return children;
};

export default MaintenanceWrapper;