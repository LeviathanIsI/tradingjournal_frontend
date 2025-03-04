// src/pages/PricingPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PricingComponent from "../components/PricingComponent";

const PricingPage = () => {
  const {
    user,
    checkSubscriptionStatus,
    isSubscriptionLoading,
    isFreeTier,
    isAuthenticated,
  } = useAuth();
  const location = useLocation();
  const fromSignup = location.state?.fromSignup || false;
  const fromRestrictedPage = location.state?.from || false;

  // Single loading state with initial value of false for immediate render
  const [isPageLoading, setIsPageLoading] = useState(false);
  const subscriptionChecked = useRef(false);

  // Only check subscription once, and do it after initial render
  useEffect(() => {
    if (
      isAuthenticated() &&
      !subscriptionChecked.current &&
      !isSubscriptionLoading
    ) {
      subscriptionChecked.current = true;
      // Don't make the page wait for this - do it in the background
      checkSubscriptionStatus().catch((err) => {
        console.error("Error checking subscription:", err);
      });
    }
  }, [isAuthenticated, checkSubscriptionStatus, isSubscriptionLoading]);

  // Simple function to determine message content
  function getMessageData() {
    // For non-authenticated users
    if (!isAuthenticated()) {
      return {
        title: "Choose Your Plan",
        message: "Sign up for an account to get started with TraderJournal.",
      };
    }

    // For authenticated users
    if (fromSignup) {
      return {
        title: "Welcome to TraderJournal!",
        message:
          "Your account has been successfully created. Choose your plan below to get started.",
      };
    } else if (fromRestrictedPage) {
      return {
        title: "Subscription Required",
        message:
          "You need a subscription to access this feature. Choose a plan below to continue.",
      };
    } else if (user?.subscription?.cancelAtPeriodEnd) {
      return {
        title: "Your Subscription is Ending Soon",
        message: `Your subscription will end on ${new Date(
          user.subscription.currentPeriodEnd
        ).toLocaleDateString()}. Reactivate or change your plan below.`,
      };
    } else if (user?.subscription?.active && !isFreeTier()) {
      return {
        title: "Manage Your Subscription",
        message:
          "You currently have an active subscription. You can manage or upgrade your plan below.",
      };
    } else if (isFreeTier()) {
      return {
        title: "Upgrade Your Experience",
        message:
          "You're currently on the free plan. Upgrade to access premium features.",
      };
    }

    return {
      title: "Choose Your Plan",
      message: "Select the plan that best fits your trading needs.",
    };
  }

  function getMessageClass() {
    if (!isAuthenticated()) return "bg-gray-50 dark:bg-gray-700/30";
    if (fromSignup || fromRestrictedPage)
      return "bg-blue-50 dark:bg-blue-900/30";
    if (isFreeTier()) return "bg-green-50 dark:bg-green-900/30";
    if (user?.subscription?.cancelAtPeriodEnd)
      return "bg-yellow-50 dark:bg-yellow-900/30";
    return "bg-gray-50 dark:bg-gray-700/30";
  }

  function getIcon() {
    if (!isAuthenticated()) {
      return (
        <svg
          className="h-6 w-6 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
    }

    if (fromSignup) {
      return (
        <svg
          className="h-6 w-6 text-blue-500 dark:text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    // Other icon cases...
    return (
      <svg
        className="h-6 w-6 text-gray-500 dark:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    );
  }

  function getTextColorClass() {
    if (!isAuthenticated()) return "text-gray-800 dark:text-gray-200";
    if (fromSignup || fromRestrictedPage)
      return "text-blue-800 dark:text-blue-200";
    if (isFreeTier()) return "text-green-800 dark:text-green-200";
    if (user?.subscription?.cancelAtPeriodEnd)
      return "text-yellow-800 dark:text-yellow-200";
    return "text-gray-800 dark:text-gray-200";
  }

  function getDescriptionColorClass() {
    if (!isAuthenticated()) return "text-gray-700 dark:text-gray-300";
    if (fromSignup || fromRestrictedPage)
      return "text-blue-700 dark:text-blue-300";
    if (isFreeTier()) return "text-green-700 dark:text-green-300";
    if (user?.subscription?.cancelAtPeriodEnd)
      return "text-yellow-700 dark:text-yellow-300";
    return "text-gray-700 dark:text-gray-300";
  }

  const messageData = getMessageData();
  const messageClass = getMessageClass();
  const messageIcon = getIcon();
  const textColorClass = getTextColorClass();
  const descriptionColorClass = getDescriptionColorClass();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800/90 pt-16">
      <div
        className={`max-w-7xl mx-auto px-4 py-6 ${messageClass} rounded-lg mb-6 shadow-sm`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">{messageIcon}</div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${textColorClass}`}>
              {messageData.title}
            </h3>
            <div className={`mt-1 text-sm ${descriptionColorClass}`}>
              <p>{messageData.message}</p>
            </div>
          </div>
        </div>
      </div>

      <PricingComponent />
    </div>
  );
};

export default PricingPage;
