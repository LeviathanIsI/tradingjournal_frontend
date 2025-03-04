// src/components/SubscriptionRequired.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SubscriptionRequired = ({ children, allowFree = false }) => {
  const { user, isSubscriptionLoading, hasActiveSubscription, isFreeTier } =
    useAuth();
  const location = useLocation();

  // Show loading state while checking subscription
  if (isSubscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-800/90">
        <div className="animate-pulse p-4 rounded-lg text-lg text-gray-700 dark:text-gray-200">
          Loading...
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

  // Otherwise redirect to pricing page
  return <Navigate to="/pricing" state={{ from: location }} replace />;
};

export default SubscriptionRequired;
