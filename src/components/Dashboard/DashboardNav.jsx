import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LineChart,
  ClipboardList,
  Target,
  BarChart,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DashboardNav = () => {
  const location = useLocation();
  const { hasAccessToFeature, user, subscription, checkSubscriptionStatus } =
    useAuth();
  const [hasPremium, setHasPremium] = useState(hasAccessToFeature("premium"));

  // Define all navigation items
  const allNavItems = [
    {
      label: "Overview",
      path: "/dashboard/overview",
      icon: BarChart,
      shortLabel: "Overview",
      premium: false, // Available to all users
    },
    {
      label: "Trade Journal",
      path: "/dashboard/journal",
      icon: ClipboardList,
      shortLabel: "Journal",
      premium: false, // Available to all users
    },
    {
      label: "Analysis",
      path: "/dashboard/analysis",
      icon: LineChart,
      shortLabel: "Analysis",
      premium: false, // Available to all users
    },
    {
      label: "Entry/Exit Analysis",
      path: "/dashboard/planning",
      icon: Target,
      shortLabel: "Entry/Exit",
      premium: true, // Premium feature
    },
    {
      label: "AI Insights",
      path: "/dashboard/ai-insights",
      icon: BrainCircuit,
      shortLabel: "AI",
      premium: true, // Premium feature
    },
  ];

  // Effect to update premium status when user or subscription changes
  useEffect(() => {
    const checkPremiumAccess = async () => {
      // If we're logged in but don't have subscription data, fetch it
      if (user && !user.subscription) {
        try {
          await checkSubscriptionStatus();
        } catch (error) {
          console.error("Error checking subscription:", error);
        }
      }

      // Update our local premium state
      const isPremium = hasAccessToFeature("premium");

      setHasPremium(isPremium);
    };

    checkPremiumAccess();
  }, [user, subscription, hasAccessToFeature, checkSubscriptionStatus]);

  // Filter nav items based on user access - use state-based premium status
  const navItems = allNavItems.filter((item) => !item.premium || hasPremium);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700/60 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-none">
        <div className="flex justify-center min-w-max px-2 sm:px-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center min-w-[4.5rem] sm:min-w-0 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  active
                    ? "border-b-2 border-primary text-primary dark:text-primary-light"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Icon
                  className={`h-5 w-5 sm:h-4 sm:w-4 sm:mr-2 ${
                    active
                      ? "text-primary dark:text-primary-light"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
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
