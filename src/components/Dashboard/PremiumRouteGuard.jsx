import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

/**
 * Route guard component for premium features
 *
 * Checks if user has premium access and redirects if not
 * Shows countdown toast before redirecting
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if access granted
 */
const PremiumRouteGuard = ({ children }) => {
  const { user, subscription, hasAccessToFeature, checkSubscriptionStatus } =
    useAuth();
  const { showToast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const redirectTimerRef = useRef(null);

  // Initial check on mount
  useEffect(() => {
    const initialCheck = async () => {
      setIsChecking(true);

      try {
        // Initial check for premium access
        const hasPremiumAccess = hasAccessToFeature("premium");

        // If we don't know yet, force a subscription check
        if (user && !hasPremiumAccess && !user.subscription) {
          await checkSubscriptionStatus();

          // After fetching subscription data, check access again
          const accessAfterCheck = hasAccessToFeature("premium");
          setAccessGranted(accessAfterCheck);
        } else {
          // Otherwise use the current access state
          setAccessGranted(hasPremiumAccess);
        }
      } catch (error) {
        console.error("Error checking premium access:", error);
        setAccessGranted(false);
      } finally {
        setIsChecking(false);
      }
    };

    initialCheck();
  }, []);

  // Handle access changes
  useEffect(() => {
    // Skip if still in initial checking phase
    if (isChecking) return;

    const checkAccess = async () => {
      // Clear any existing redirect timer
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }

      // Check premium access
      const hasPremiumAccess = hasAccessToFeature("premium");
      setAccessGranted(hasPremiumAccess);

      // If no access and not already redirecting, start the redirect process
      if (!hasPremiumAccess && !isRedirecting) {
        setIsRedirecting(true);

        // Show toast with countdown message
        showToast(
          "This feature requires a premium subscription. Redirecting to Overview in 5 seconds...",
          "info",
          true
        );

        // Set up redirect timer
        redirectTimerRef.current = setTimeout(() => {
          window.location.href = "/dashboard/overview";
        }, 5000);
      }

      // If user gains premium access and we were redirecting, cancel redirect
      if (hasPremiumAccess && isRedirecting) {
        setIsRedirecting(false);
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
          showToast("Premium access confirmed!", "success");
        }
      }
    };

    checkAccess();

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [
    user?.id,
    subscription?.active,
    hasAccessToFeature,
    isRedirecting,
    showToast,
    isChecking,
  ]);

  // Show loading state during initial check
  if (isChecking) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Verifying access...
        </p>
      </div>
    );
  }

  // Only render children if premium access is confirmed
  return accessGranted ? (
    children
  ) : isRedirecting ? (
    <div className="p-4 text-center">
      <p className="text-lg text-gray-700 dark:text-gray-300">
        This feature requires a premium subscription.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Redirecting to Overview...
      </p>
    </div>
  ) : (
    <Navigate to="/dashboard/overview" replace />
  );
};

export default PremiumRouteGuard;
