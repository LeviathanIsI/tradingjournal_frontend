import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, LineChart, PenLine, Star, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CommunityNav = () => {
  const location = useLocation();
  const { user: currentUser } = useAuth();

  const navItems = [
    {
      label: "Trade Reviews",
      path: "/community/reviews",
      icon: PenLine,
    },
    {
      label: "Traders",
      path: "/community/traders",
      icon: Users,
    },
    {
      label: "Leaderboard",
      path: "/community/leaderboard",
      icon: LineChart,
    },
    {
      label: "Featured",
      path: "/community/featured",
      icon: Star,
    },
    {
      label: "Profile",
      path: `/community/profile/${currentUser?.username}`,
      icon: User,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto overflow-x-auto scrollbar-none">
        <div className="flex justify-between sm:justify-start min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center min-w-[4rem] sm:min-w-0 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
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
                <span className="sm:hidden" aria-label={item.label}>
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CommunityNav;
