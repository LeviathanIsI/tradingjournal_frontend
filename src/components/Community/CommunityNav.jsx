import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Users, LineChart, PenLine, Star, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CommunityNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Check if user has admin access
  const isAdmin =
    user?.specialAccess?.hasAccess && user?.specialAccess?.reason === "Admin";

  // Define all navigation items including Study Groups (admin only)
  const allNavItems = [
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
      label: "Study Groups",
      path: "/study-groups",
      icon: BookOpen,
      adminOnly: true, // Only visible to admin users
    },
  ];

  // Filter nav items based on admin access
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/community/reviews" && location.pathname.startsWith(path));

  return (
    <nav className="bg-white dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-600/50 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto overflow-x-auto scrollbar-none">
        <div className="flex justify-center min-w-max px-2 sm:px-0">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center justify-center min-w-[4.5rem] sm:min-w-0 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                isActive(path)
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <Icon
                className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2"
                aria-hidden="true"
              />
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

export default CommunityNav;
