// hooks/Dashboard/useDashboardEffects.js
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

/**
 * Custom hook to handle Dashboard component side effects
 *
 * Handles:
 * - Redirect to overview from dashboard root
 * - Stripe subscription success verification
 * - Subscription status synchronization
 * - Loading states
 */
const useDashboardEffects = (checkSubscriptionStatus, user) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Effect to redirect to overview if at dashboard root
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      navigate("/dashboard/overview");
    }
  }, [location, navigate]);

  // Effect to check Stripe subscription success
  useEffect(() => {
    const checkStripeSuccess = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get("success") === "true") {
        try {
          await checkSubscriptionStatus();
          showToast("Subscription activated successfully!", "success");
          window.history.replaceState({}, "", "/dashboard");
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking subscription status:", error);
          showToast(
            "Error verifying subscription. Please refresh the page.",
            "error"
          );
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkStripeSuccess();
  }, [checkSubscriptionStatus, showToast]);

  // New effect: Ensure subscription data is always synchronized with user state
  // This is critical for premium routes to appear without manual refresh
  useEffect(() => {
    const syncSubscriptionData = async () => {
      // Only proceed if user is loaded but no subscription data,
      // or if we just logged in (for first-time login scenario)
      if (user && (!user.subscription || location.state?.fromLogin)) {
        setIsLoading(true);
        try {
          await checkSubscriptionStatus();
          // If navigated from login, clear that state
          if (location.state?.fromLogin) {
            // Replace state to remove the fromLogin flag
            navigate(location.pathname, {
              replace: true,
              state: { ...location.state, fromLogin: undefined },
            });
          }
        } catch (error) {
          console.error("Error synchronizing subscription status:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    syncSubscriptionData();
  }, [
    user,
    checkSubscriptionStatus,
    location.state,
    navigate,
    location.pathname,
  ]);

  return {
    isLoading,
    setIsLoading,
  };
};

export default useDashboardEffects;
