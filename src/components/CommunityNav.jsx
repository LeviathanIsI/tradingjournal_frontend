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
    <div className="bg-white border-b border-gray-200">
      <div className="bg-white border-b border-gray-200 community-nav">
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
    </div>
  );
};

export default CommunityNav;
