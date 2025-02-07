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
      label: "Planning",
      path: "/dashboard/planning",
      icon: Target,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className="bg-white border-b border-gray-200"
      data-tour="dashboard-nav"
    >
      <div className="flex justify-center space-x-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-4 text-sm font-medium ${
                isActive(item.path)
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
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
