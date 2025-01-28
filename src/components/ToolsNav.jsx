// src/components/ToolsNav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  TrendingUp,
  BarChart2,
  Activity,
  LineChart,
  Bell,
  Search,
} from "lucide-react";

const ToolsNav = () => {
  const location = useLocation();

  const navItems = [
    {
      label: "Insider Trading",
      path: "/tools/insider",
      icon: TrendingUp,
      description: "Track insider trading activity",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                title={item.description}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ToolsNav;
