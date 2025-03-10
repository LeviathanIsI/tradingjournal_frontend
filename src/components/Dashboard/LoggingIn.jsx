import React, { useEffect, useState, useRef, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "lucide-react";

/**
 * LoggingIn Component - Final Version
 * Ensures ALL data is loaded before redirecting
 */
const LoggingIn = () => {
  const { user, loading, updateUser } = useAuth();
  const location = useLocation();

  // Use a single state object to reduce re-renders
  const [state, setState] = useState({
    error: null,
    statusMessage: "Initializing...",
    attempts: 0,
    allDataLoaded: false,
    readyToRedirect: false,
  });

  // Use refs for values that shouldn't trigger re-renders
  const loadingStateRef = useRef({
    validateApiCalled: false,
    subscriptionApiCalled: false,
    specialAccessApiCalled: false,
    validateApiSuccess: false,
    subscriptionApiSuccess: false,
    specialAccessApiSuccess: false,
  });

  const timersRef = useRef({
    loading: null,
    redirect: null,
  });

  // Debug logging helper that doesn't trigger re-renders
  const logStatus = useCallback((message) => {
    setState((prev) => ({ ...prev, statusMessage: message }));
  }, []);

  // Function to load user data via API
  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/validate`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  }, []);

  // Function to load subscription data via API
  const loadSubscriptionData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/subscription`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error("Error loading subscription data:", error);
      return null;
    }
  }, []);

  // Function to load special access data via API
  const loadSpecialAccessData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/me/special-access`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return {
        hasAccess: data.hasSpecialAccess,
        expiresAt: null,
        reason: data.reason || "other",
      };
    } catch (error) {
      console.error("Error loading special access data:", error);
      return null;
    }
  }, []);

  // Strict validation of user data
  const verifyAllDataLoaded = useCallback(() => {
    if (!user) return false;

    // Check subscription fields are properly populated
    const hasSubscription =
      user.subscription &&
      typeof user.subscription.active === "boolean" &&
      user.subscription.type !== undefined;

    // Check special access fields are properly populated
    const hasSpecialAccess =
      user.specialAccess && typeof user.specialAccess.hasAccess === "boolean";

    // Only return true if both are confirmed to be populated
    const isComplete = hasSubscription && hasSpecialAccess;

    return isComplete;
  }, [user]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  // Main effect for loading all user data
  useEffect(() => {
    // Skip if already completed the process or already redirecting
    if (state.allDataLoaded || state.readyToRedirect) {
      return;
    }

    // Skip if still in loading state
    if (loading) {
      logStatus("Waiting for auth to initialize...");
      return;
    }

    // Error if no user
    if (!user) {
      setState((prev) => ({
        ...prev,
        error: "Authentication failed. Please try logging in again.",
      }));
      return;
    }

    // Start loading all data
    const loadAllData = async () => {
      logStatus("Loading user profile data...");

      try {
        // Step 1: Check if all data is already loaded
        // IMPORTANT: Force at least one API call to ensure fresh data
        if (state.attempts > 0 && verifyAllDataLoaded()) {
          logStatus("All required data already present!");
          setState((prev) => ({ ...prev, allDataLoaded: true }));

          // Schedule redirect with a slight delay - no welcome message here
          timersRef.current.redirect = setTimeout(() => {
            logStatus("Data loaded, ready to redirect");
            setState((prev) => ({ ...prev, readyToRedirect: true }));
          }, 500);
          return;
        }

        // First load user data if needed
        if (!loadingStateRef.current.validateApiSuccess) {
          logStatus("Loading base user data...");
          const userData = await loadUserData();

          if (userData) {
            loadingStateRef.current.validateApiSuccess = true;
            updateUser(userData);
            logStatus("Base user data loaded");
          }
        }

        // Then load subscription data if needed
        if (!loadingStateRef.current.subscriptionApiSuccess) {
          logStatus("Loading subscription data...");
          const subscriptionData = await loadSubscriptionData();

          if (subscriptionData) {
            loadingStateRef.current.subscriptionApiSuccess = true;
            updateUser({ subscription: subscriptionData });
            logStatus("Subscription data loaded");
          }
        }

        // Finally load special access data if needed
        if (!loadingStateRef.current.specialAccessApiSuccess) {
          logStatus("Loading special access data...");
          const specialAccessData = await loadSpecialAccessData();

          if (specialAccessData) {
            loadingStateRef.current.specialAccessApiSuccess = true;
            updateUser({ specialAccess: specialAccessData });
            logStatus("Special access data loaded");
          }
        }

        // Verify all data is properly loaded
        const allDataLoaded = verifyAllDataLoaded();

        if (allDataLoaded) {
          logStatus("All data loading complete!");
          setState((prev) => ({ ...prev, allDataLoaded: true }));

          // Schedule redirect
          timersRef.current.redirect = setTimeout(() => {
            logStatus("Data loaded, ready to redirect");
            setState((prev) => ({ ...prev, readyToRedirect: true }));
          }, 500);
        } else {
          // Data isn't fully loaded, schedule a retry
          const nextAttempt = state.attempts + 1;
          logStatus(`Data incomplete, scheduling retry #${nextAttempt}...`);

          setState((prev) => ({ ...prev, attempts: nextAttempt }));

          // Reset API flags for fields that are still missing
          if (
            !user?.subscription ||
            typeof user.subscription.active !== "boolean"
          ) {
            loadingStateRef.current.subscriptionApiSuccess = false;
          }
          if (
            !user?.specialAccess ||
            typeof user.specialAccess.hasAccess !== "boolean"
          ) {
            loadingStateRef.current.specialAccessApiSuccess = false;
          }

          // Schedule retry
          timersRef.current.loading = setTimeout(loadAllData, 1000);
        }
      } catch (error) {
        console.error("Error loading user data:", error);

        // If too many retries, show error
        if (state.attempts >= 5) {
          setState((prev) => ({
            ...prev,
            error: `Failed to load user profile after ${state.attempts} attempts.`,
          }));
        } else {
          // Otherwise schedule a retry
          const nextAttempt = state.attempts + 1;
          logStatus(`Error occurred, scheduling retry #${nextAttempt}...`);

          setState((prev) => ({ ...prev, attempts: nextAttempt }));
          timersRef.current.loading = setTimeout(loadAllData, 1000);
        }
      }
    };

    // Start the data loading process
    loadAllData();
  }, [
    loading,
    user,
    state.allDataLoaded,
    state.readyToRedirect,
    state.attempts,
    loadUserData,
    loadSubscriptionData,
    loadSpecialAccessData,
    verifyAllDataLoaded,
    updateUser,
    logStatus,
  ]);

  // Handle error state
  if (state.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-700/60">
        <div className="bg-white dark:bg-gray-600/30 p-8 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm text-center max-w-md w-full">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{state.error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Redirect when ready - add showWelcome flag to state
  if (state.readyToRedirect) {
    const redirectTo = location.state?.from || "/dashboard";

    // Store welcome flag in sessionStorage instead of navigation state
    sessionStorage.setItem("showWelcome", "true");

    // Use replace navigation without relying on state
    return <Navigate to={redirectTo} replace />;
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    let progress = 20; // Base progress

    if (loadingStateRef.current.validateApiSuccess) progress += 25;
    if (loadingStateRef.current.subscriptionApiSuccess) progress += 25;
    if (loadingStateRef.current.specialAccessApiSuccess) progress += 25;

    return Math.min(progress, 95); // Cap at 95% until redirect
  };

  // Loading UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-700/60">
      <div className="bg-white dark:bg-gray-600/30 p-8 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm text-center max-w-md w-full">
        <Loader className="animate-spin h-10 w-10 mx-auto mb-4 text-blue-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Logging you in
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Please wait while we prepare your dashboard...
        </p>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {state.statusMessage}
          {state.attempts > 0 &&
            !state.allDataLoaded &&
            ` (Attempt ${state.attempts})`}
        </div>

        {/* Visual progress indicator */}
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="mt-6 text-left">
            <details>
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                Debug information
              </summary>
              <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-sm overflow-auto max-h-40">
                <p>
                  <strong>User:</strong> {user ? "Present" : "Missing"}
                </p>
                <p>
                  <strong>User data loaded:</strong>{" "}
                  {loadingStateRef.current.validateApiSuccess ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Subscription loaded:</strong>{" "}
                  {loadingStateRef.current.subscriptionApiSuccess ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Special access loaded:</strong>{" "}
                  {loadingStateRef.current.specialAccessApiSuccess
                    ? "✅"
                    : "❌"}
                </p>
                <p>
                  <strong>All data verified:</strong>{" "}
                  {state.allDataLoaded ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Ready to redirect:</strong>{" "}
                  {state.readyToRedirect ? "✅" : "❌"}
                </p>
                {user && user.subscription && (
                  <p>
                    <strong>Subscription active:</strong>{" "}
                    {user.subscription.active ? "true" : "false"}
                  </p>
                )}
                {user && user.specialAccess && (
                  <p>
                    <strong>Special access:</strong>{" "}
                    {user.specialAccess.hasAccess ? "true" : "false"}
                  </p>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(LoggingIn);
