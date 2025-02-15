import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LineChart,
  ClipboardList,
  Target,
  Clock,
  BarChart,
} from "lucide-react";

const DashboardNav = () => {
  const location = useLocation();

  const navItems = [
    {
      label: "Overview",
      path: "/dashboard/overview",
      icon: BarChart,
      shortLabel: "Overview",
    },
    {
      label: "Trade Journal",
      path: "/dashboard/journal",
      icon: ClipboardList,
      shortLabel: "Journal",
    },
    {
      label: "Analysis",
      path: "/dashboard/analysis",
      icon: LineChart,
      shortLabel: "Analysis",
    },
    {
      label: "Entry/Exit Analysis",
      path: "/dashboard/planning",
      icon: Target,
      shortLabel: "Entry/Exit",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto overflow-x-auto scrollbar-none">
        <div className="flex justify-between sm:justify-center min-w-max px-2 sm:px-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center min-w-[4.5rem] sm:min-w-0 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Icon
                  className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden text-center" aria-label={item.label}>
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
