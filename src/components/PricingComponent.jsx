// src/components/PricingComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function useResetProcessingOnLoad(setIsLoading, processingPlan, setResetting) {
  useEffect(() => {
    // Reset processing state on component mount
    const resetProcessingState = () => {
      setIsLoading(false);
      processingPlan.current = null;
      setResetting(false);
    };

    // When component mounts
    resetProcessingState();

    // Also reset when the page becomes visible again (returning from Stripe)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetProcessingState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setIsLoading, processingPlan, setResetting]);
}

const PricingComponent = () => {
  const { user, checkSubscriptionStatus, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const fromSignup = location.state?.fromSignup || false;
  const initialSetupDone = useRef(false);
  const processingPlan = useRef(null);

  useResetProcessingOnLoad(setIsLoading, processingPlan, setResetting);

  // Define plans and features
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Basic journaling and tracking",
      features: {
        "Unlimited Journaling": true,
        "Trade Analysis": true,
        "Performance Metrics": true,
        "Pattern Recognition": false,
        "AI-Powered Insights": false,
        "Trading Replay": false,
        "Community Features": false,
      },
      cta: "Start Free",
      highlight: false,
    },
    {
      id: "monthly",
      name: "Pro Monthly",
      price: "$20",
      period: "month",
      description: "Everything you need to improve",
      features: {
        "Unlimited Journaling": true,
        "Trade Analysis": true,
        "Performance Metrics": true,
        "Pattern Recognition": true,
        "AI-Powered Insights": true,
        "Trading Replay": true,
        "Community Features": true,
      },
      cta: "Subscribe Monthly",
      highlight: false,
    },
    {
      id: "yearly",
      name: "Pro Yearly",
      price: "$200",
      period: "year",
      description: "Our best value option",
      features: {
        "Unlimited Journaling": true,
        "Trade Analysis": true,
        "Performance Metrics": true,
        "Pattern Recognition": true,
        "AI-Powered Insights": true,
        "Trading Replay": true,
        "Community Features": true,
      },
      savings: "Save $40/year",
      cta: "Subscribe Yearly",
      highlight: true,
    },
  ];

  const features = [
    "Unlimited Journaling",
    "Trade Analysis",
    "Performance Metrics",
    "Pattern Recognition",
    "AI-Powered Insights",
    "Trading Replay",
    "Community Features",
  ];

  // Reset component state when using browser navigation buttons
  useEffect(() => {
    const handleNavigation = () => {
      setIsLoading(false);
      processingPlan.current = null;

      // If authenticated, set to current subscription, otherwise null
      if (isAuthenticated() && user?.subscription?.type) {
        setSelectedPlan(user.subscription.type);
      } else {
        setSelectedPlan(null);
      }
    };

    window.addEventListener("popstate", handleNavigation);

    // Clean up the listener when component unmounts
    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [isAuthenticated, user]);

  // Set initial selected plan
  useEffect(() => {
    if (initialSetupDone.current) return;
    initialSetupDone.current = true;

    if (isAuthenticated()) {
      if (fromSignup) {
        setSelectedPlan("free");
        // If coming from signup, apply free tier automatically
        handleFreeSubscription();
      } else if (user?.subscription?.type) {
        // Set selected plan to user's current subscription if they have one
        setSelectedPlan(user.subscription.type);
      }
    }
  }, [fromSignup, user, isAuthenticated]);

  // Handle setting user to free tier
  const handleFreeSubscription = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location, selectedPlan: "free" } });
      return;
    }

    try {
      setIsLoading(true);
      processingPlan.current = "free";

      // This endpoint might need to be created on your backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/set-free-tier`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        await checkSubscriptionStatus();
        if (!fromSignup) {
          showToast("You're all set with the Free plan!", "success");
        }
        navigate("/dashboard");
      } else {
        throw new Error(data.error || "Failed to set free tier");
      }
    } catch (error) {
      console.error("Error setting free tier:", error);
      showToast(
        "There was an error setting the free tier. Please try again.",
        "error"
      );
      setIsLoading(false);
      processingPlan.current = null;
    }
  };

  // Create a new subscription with Stripe
  const createSubscription = async (planType) => {
    try {
      setIsLoading(true);
      processingPlan.current = planType;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/create-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            planType,
            isReactivation: user?.subscription?.cancelAtPeriodEnd || false,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      if (data.success && data.url) {
        // Store plan type in session storage before redirecting
        sessionStorage.setItem("pendingSubscription", planType);

        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      showToast(
        "There was an error processing your subscription. Please try again.",
        "error"
      );
      setIsLoading(false);
      processingPlan.current = null;
    }
  };

  // Handle subscription reactivation
  const handleReactivate = async (planType) => {
    try {
      setIsLoading(true);
      processingPlan.current = planType;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reactivate-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ planType }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await checkSubscriptionStatus();
        showToast(
          `Your subscription has been reactivated with the ${planType} plan`,
          "success"
        );
        navigate("/dashboard");
      } else if (data.url) {
        // Store plan type in session storage before redirecting
        sessionStorage.setItem("pendingSubscription", planType);

        // If we got a URL, redirect to it (probably new payment method needed)
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to reactivate subscription");
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      showToast(
        "Failed to reactivate subscription. Please try again.",
        "error"
      );
      setIsLoading(false);
      processingPlan.current = null;
    }
  };

  // Main subscription handler
  const handleSubscribe = async (planType) => {
    // Prevent multiple clicks or processing when already working
    if (isLoading || resetting) return;

    // If user was trying to process a different plan, reset first
    if (processingPlan.current && processingPlan.current !== planType) {
      setResetting(true);
      setIsLoading(false);
      processingPlan.current = null;

      setTimeout(() => {
        setResetting(false);
        // Continue with new plan after reset
        handleSubscribe(planType);
      }, 100);
      return;
    }

    // If user is not logged in, redirect to login page with plan selection info
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location, selectedPlan: planType } });
      return;
    }

    setSelectedPlan(planType);

    if (planType === "free") {
      // For free plan, update user status and navigate to dashboard
      await handleFreeSubscription();
      return;
    }

    // Check if user has a subscription that's set to cancel
    if (user?.subscription?.cancelAtPeriodEnd) {
      // If yes, use reactivate flow
      await handleReactivate(planType);
    } else {
      // If no, create new subscription
      await createSubscription(planType);
    }
  };

  // Get current plan status for UI feedback
  const getPlanStatus = (planId) => {
    if (
      isAuthenticated() &&
      user?.subscription?.active &&
      user.subscription.type === planId
    ) {
      return user.subscription.cancelAtPeriodEnd
        ? "Ending Soon"
        : "Current Plan";
    }
    return null;
  };

  // Handle mouse hover for plan selection UI
  const handleMouseOver = (planId) => {
    if (!isLoading && !resetting) {
      setSelectedPlan(planId);
    }
  };

  // Handle mouse out
  const handleMouseOut = () => {
    if (!isLoading && !resetting && !user?.subscription?.type) {
      setSelectedPlan(null);
    } else if (!isLoading && !resetting && user?.subscription?.type) {
      setSelectedPlan(user.subscription.type);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:flex-col sm:align-center text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Choose Your Trading Journey
        </h1>
        <p className="mt-5 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the plan that matches your trading ambitions.
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-8">
        {plans.map((plan) => {
          const planStatus = getPlanStatus(plan.id);
          const isProcessing = isLoading && processingPlan.current === plan.id;

          // Determine card classes based on selection state
          let cardClasses =
            "flex-1 border rounded-lg overflow-hidden transition-all duration-200 ";
          cardClasses +=
            selectedPlan === plan.id
              ? "scale-105 shadow-lg border-blue-500 dark:border-blue-400 "
              : plan.highlight
              ? "border-blue-200 dark:border-blue-700/50 shadow-md "
              : "border-gray-200 dark:border-gray-600/50 ";
          cardClasses += "bg-white dark:bg-gray-700/60";

          return (
            <div
              key={plan.id}
              className={cardClasses}
              onMouseEnter={() => handleMouseOver(plan.id)}
              onMouseLeave={handleMouseOut}
            >
              {plan.highlight && (
                <div className="bg-blue-500 text-white py-1 px-4 text-center text-sm font-medium">
                  MOST POPULAR
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </h2>
                  {planStatus && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium ${
                        planStatus === "Current Plan"
                          ? "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300"
                      }`}
                    >
                      {planStatus}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-base text-gray-500 dark:text-gray-300">
                    /{plan.period}
                  </span>
                </div>

                {plan.savings && (
                  <p className="mt-2 text-sm text-green-500 dark:text-green-400 font-medium">
                    {plan.savings}
                  </p>
                )}

                <ul className="mt-6 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        {plan.features[feature] ? (
                          <svg
                            className="h-5 w-5 text-green-500 dark:text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-gray-400 dark:text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p
                        className={`ml-3 text-sm ${
                          plan.features[feature]
                            ? "text-gray-700 dark:text-gray-200"
                            : "text-gray-400 dark:text-gray-500 line-through"
                        }`}
                      >
                        {feature}
                      </p>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={
                    isLoading || resetting || planStatus === "Current Plan"
                  }
                  className={`mt-8 block w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    isProcessing
                      ? "bg-gray-400 dark:bg-gray-500/50 cursor-not-allowed"
                      : resetting
                      ? "bg-gray-300 dark:bg-gray-600/50 cursor-not-allowed"
                      : planStatus === "Current Plan"
                      ? "bg-green-600 dark:bg-green-600/90 cursor-not-allowed"
                      : plan.id === "free"
                      ? "bg-gray-600 hover:bg-gray-700 dark:bg-gray-600/90 dark:hover:bg-gray-500 focus:ring-gray-500"
                      : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-500/90 dark:hover:bg-blue-500 focus:ring-blue-400"
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : resetting ? (
                    "Resetting..."
                  ) : planStatus === "Current Plan" ? (
                    "Current Plan"
                  ) : !isAuthenticated() ? (
                    plan.id === "free" ? (
                      "Sign Up Free"
                    ) : (
                      `Subscribe ${
                        plan.id === "monthly" ? "Monthly" : "Yearly"
                      }`
                    )
                  ) : user?.subscription?.cancelAtPeriodEnd &&
                    plan.id !== "free" ? (
                    `Reactivate ${plan.id === "monthly" ? "Monthly" : "Yearly"}`
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can upgrade, downgrade, or cancel your subscription at any time.
        </p>
        {isAuthenticated() && !fromSignup && (
          <p className="mt-2 text-sm">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              disabled={isLoading || resetting}
            >
              Skip for now and explore the dashboard →
            </button>
          </p>
        )}
        {!isAuthenticated() && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from: location } })}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              disabled={isLoading || resetting}
            >
              Log in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default PricingComponent;
