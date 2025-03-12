// src/components/SubscriptionRequired.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader, Lock, AlertCircle } from "lucide-react";

const SubscriptionRequired = ({ children, allowFree = false }) => {
  const { user, isSubscriptionLoading, hasActiveSubscription, isFreeTier } =
    useAuth();
  const location = useLocation();

  // Show loading state while checking subscription
  if (isSubscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white/90 dark:bg-gray-800/80 p-6 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-base font-medium text-gray-700 dark:text-gray-200">
            Verifying subscription status...
          </p>
        </div>
      </div>
    );
  }

  // Check if user has an active subscription
  const hasActiveSubscriptionStatus = hasActiveSubscription();

  // Check if user is on free tier
  const isOnFreeTier = isFreeTier();

  // Check if user has special access (useful for beta testers, etc.)
  const hasSpecialAccess =
    user?.specialAccess?.hasAccess &&
    (!user.specialAccess.expiresAt ||
      new Date() < new Date(user.specialAccess.expiresAt));

  // Allow access if user has a paid subscription or special access
  if (hasActiveSubscriptionStatus || hasSpecialAccess) {
    return children;
  }

  // If free tier is allowed for this route and user is on free tier, allow access
  if (allowFree && isOnFreeTier) {
    return children;
  }

  // Show subscription required message before redirecting
  setTimeout(() => {
    window.location.href =
      "/pricing" +
      (location ? `?from=${encodeURIComponent(location.pathname)}` : "");
  }, 2000);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white/90 dark:bg-gray-800/80 p-6 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Subscription Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This feature requires an active subscription. You're being
            redirected to our pricing page.
          </p>

          <div className="bg-yellow-50/90 dark:bg-yellow-900/20 p-4 rounded-md w-full mt-4 border border-yellow-100 dark:border-yellow-800/40 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Upgrade your account to access all features and enhance your
              trading experience.
            </p>
          </div>

          <div className="w-full pt-4 mt-2">
            <div className="bg-gray-200 dark:bg-gray-700 h-1 w-full rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Redirecting to pricing page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
