import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Bell, Settings } from "lucide-react";

const AdminNav = () => {
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Announcements",
      path: "/admin/announcements",
      icon: Bell,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/admin/dashboard" && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-16 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/60">
      <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-none">
        <div className="flex justify-center min-w-max px-4 sm:px-6 lg:px-8">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center justify-center px-3 py-4 text-sm font-medium transition-colors ${
                isActive(path)
                  ? "border-b-2 border-primary text-primary dark:text-primary"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Icon className="h-5 w-5 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden text-center" aria-label={label}>
                {label.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;
