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
    },
    {
      label: "Trade Journal",
      path: "/dashboard/journal",
      icon: ClipboardList,
    },
    {
      label: "Analysis",
      path: "/dashboard/analysis",
      icon: LineChart,
    },
    {
      label: "Entry/Exit Analysis",
      path: "/dashboard/planning",
      icon: Target,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-center space-x-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-4 text-sm font-medium ${
                isActive(item.path)
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardNav;
