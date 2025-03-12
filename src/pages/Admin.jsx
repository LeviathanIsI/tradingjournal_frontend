import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminNav from "../components/Admin/AdminNav";
import Dashboard from "../components/Admin/Dashboard";
import UserManagement from "../components/Admin/UserManagement";
import Announcements from "../components/Admin/Announcements";
import Settings from "../components/Admin/Settings";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-800/80">
        <div className="animate-pulse text-lg text-primary">Loading...</div>
      </div>
    );
  }

  // Extra check for admin access
  const isAdmin =
    user?.specialAccess?.hasAccess && user?.specialAccess?.reason === "Admin";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-gray-50 dark:bg-gray-800/30">
      {/* Admin Navigation */}
      <AdminNav />

      {/* Admin Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/40">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-accent/5 dark:from-primary/20 dark:to-accent/10 p-6 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Manage users, content, and system settings
            </p>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users/*" element={<UserManagement />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
