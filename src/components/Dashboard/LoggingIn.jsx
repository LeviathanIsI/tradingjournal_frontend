import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader, CheckCircle, XCircle } from "lucide-react";

/**
 * LoggingIn Component - With progressive verification checkmarks
 */
const LoggingIn = () => {
  const { user } = useAuth();
  const location = useLocation();
  const redirectTimerRef = useRef(null);

  // State to track loading status
  const [state, setState] = useState({
    isLoading: true,
    readyToRedirect: false,
    secondsRemaining: 15,
    progress: 0,
  });

  // Track completed steps with visible progression
  const [steps, setSteps] = useState({
    userDataLoaded: false,
    subscriptionLoaded: false,
    specialAccessLoaded: false,
    additionalChecks: false,
    allDataVerified: false,
    readyToRedirect: false,
  });

  // Start time tracking
  const startTimeRef = useRef(Date.now());

  // Effect to handle loading simulation and countdown
  useEffect(() => {
    // Update progress and countdown every 100ms
    const progressInterval = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const secondsRemaining = Math.max(0, 15 - elapsedSeconds);
      const progress = Math.min(95, (elapsedMs / 15000) * 100);

      setState({
        isLoading: true,
        readyToRedirect: false,
        secondsRemaining,
        progress,
      });

      // Simulate steps completing at different points in time
      // These timing points spread the checkmarks throughout the loading process
      if (elapsedSeconds >= 2 && !steps.userDataLoaded) {
        setSteps((prev) => ({ ...prev, userDataLoaded: true }));
      }
      if (elapsedSeconds >= 5 && !steps.subscriptionLoaded) {
        setSteps((prev) => ({ ...prev, subscriptionLoaded: true }));
      }
      if (elapsedSeconds >= 8 && !steps.specialAccessLoaded) {
        setSteps((prev) => ({ ...prev, specialAccessLoaded: true }));
      }
      if (elapsedSeconds >= 11 && !steps.additionalChecks) {
        setSteps((prev) => ({ ...prev, additionalChecks: true }));
      }
      if (elapsedSeconds >= 13 && !steps.allDataVerified) {
        setSteps((prev) => ({ ...prev, allDataVerified: true }));
      }
      if (elapsedSeconds >= 14 && !steps.readyToRedirect) {
        setSteps((prev) => ({ ...prev, readyToRedirect: true }));
      }
    }, 100);

    // Set up the redirect timer (exactly 15 seconds)
    redirectTimerRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        readyToRedirect: true,
        progress: 100,
        secondsRemaining: 0,
      }));
    }, 15000);

    // Cleanup timers on unmount
    return () => {
      clearInterval(progressInterval);
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // Redirect when ready
  if (state.readyToRedirect) {
    const redirectTo = location.state?.from || "/dashboard";
    sessionStorage.setItem("showWelcome", "true");
    return <Navigate to={redirectTo} replace />;
  }

  // Calculate loading message
  const getLoadingMessage = () => {
    if (state.secondsRemaining <= 5) {
      return "Preparing dashboard...";
    } else if (state.secondsRemaining <= 10) {
      return "Retrieving user data...";
    } else {
      return "Initializing...";
    }
  };

  // Helper function for check icons
  const renderCheckStatus = (isComplete) => {
    return isComplete ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  // Loading UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-700 p-8 rounded-sm border border-gray-200 dark:border-gray-600 shadow-md text-center max-w-md w-full">
        <Loader className="animate-spin h-10 w-10 mx-auto mb-4 text-blue-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Logging you in
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Please wait while we prepare your dashboard...
        </p>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {getLoadingMessage()}
        </div>

        {/* Time remaining counter */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Estimated time remaining: {state.secondsRemaining} seconds
        </div>

        {/* Visual progress indicator */}
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${state.progress}%` }}
          ></div>
        </div>

        {/* Detailed information with checkmarks that update */}
        <div className="mt-6">
          <div className="text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-sm border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loading Progress
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  User data loaded:
                </span>
                <span className="flex items-center">
                  {renderCheckStatus(steps.userDataLoaded)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subscription loaded:
                </span>
                <span className="flex items-center">
                  {renderCheckStatus(steps.subscriptionLoaded)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Special access loaded:
                </span>
                <span className="flex items-center">
                  {renderCheckStatus(steps.specialAccessLoaded)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Additional checks:
                </span>
                <span className="flex items-center">
                  {renderCheckStatus(steps.additionalChecks)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  All data verified:
                </span>
                <span className="flex items-center">
                  {renderCheckStatus(steps.allDataVerified)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Ready to redirect:
                </span>
                <span className="flex items-center">
                  {renderCheckStatus(steps.readyToRedirect)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">
                  Loading progress:
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(state.progress)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Time elapsed:
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {15 - state.secondsRemaining}s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Time remaining:
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {state.secondsRemaining}s
                </span>
              </div>
            </div>

            {/* Conditionally show user information if available */}
            {user && (
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.subscription && (
                    <div className="flex items-center justify-between">
                      <span>Subscription active:</span>
                      <span className="font-medium">
                        {user.subscription.active ? "Yes" : "No"}
                      </span>
                    </div>
                  )}

                  {user.specialAccess && (
                    <div className="flex items-center justify-between">
                      <span>Special access:</span>
                      <span className="font-medium">
                        {user.specialAccess.hasAccess ? "Yes" : "No"}
                        {user.specialAccess.reason
                          ? ` (${user.specialAccess.reason})`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoggingIn);
