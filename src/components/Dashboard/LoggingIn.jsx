import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader, CheckCircle, XCircle } from "lucide-react";

/**
 * LoggingIn Component - With proper step-by-step verification
 */
const LoggingIn = () => {
  const { user } = useAuth();
  const location = useLocation();
  const redirectTimerRef = useRef(null);
  const shouldRedirectRef = useRef(false);

  // State to track loading status
  const [state, setState] = useState({
    isLoading: true,
    readyToRedirect: false,
    secondsRemaining: 15,
    progress: 0,
  });

  // Track completed steps
  const [steps, setSteps] = useState({
    userDataLoaded: false,
    subscriptionLoaded: false,
    specialAccessLoaded: false,
    additionalChecks: false,
    allDataVerified: false,
    readyToRedirect: false,
  });

  // Current action message
  const [currentAction, setCurrentAction] = useState(
    "Initializing your session..."
  );

  // Step timing distribution (in seconds) - total should add up to 15s
  const stepTimings = {
    userDataLoaded: 2, // 0-2s
    subscriptionLoaded: 3, // 2-5s
    specialAccessLoaded: 3, // 5-8s
    additionalChecks: 3, // 8-11s
    allDataVerified: 2, // 11-13s
    readyToRedirect: 2, // 13-15s
  };

  // Step text display
  const stepMessages = {
    initializing: "Initializing your session...",
    userDataLoaded: "Loading user profile data...",
    subscriptionLoaded: "Verifying subscription status...",
    specialAccessLoaded: "Checking account privileges...",
    additionalChecks: "Performing security validation...",
    allDataVerified: "Finalizing data verification...",
    readyToRedirect: "Preparing to load dashboard...",
  };

  // Step completion text
  const completionMessages = {
    userDataLoaded: "Profile loaded",
    subscriptionLoaded: "Status verified",
    specialAccessLoaded: "Privileges confirmed",
    additionalChecks: "Validation complete",
    allDataVerified: "All systems go",
    readyToRedirect: "Ready to launch",
  };

  // Start time tracking
  const startTimeRef = useRef(Date.now());

  // Effect to handle the loading simulation
  useEffect(() => {
    let cumulativeTime = 0;

    // Set up the main interval to update progress and time
    const progressInterval = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const secondsRemaining = Math.max(0, 15 - elapsedSeconds);
      const progress = Math.min(99, (elapsedMs / 15000) * 100);

      setState({
        isLoading: true,
        readyToRedirect: false,
        secondsRemaining,
        progress,
      });

      // Handle redirect at the end
      if (elapsedSeconds >= 15 && !shouldRedirectRef.current) {
        shouldRedirectRef.current = true;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          readyToRedirect: true,
          progress: 100,
          secondsRemaining: 0,
        }));
      }
    }, 100);

    // Set up each step with appropriate timing

    // Initial message is already set

    // STEP 1: User data loading
    cumulativeTime += stepTimings.userDataLoaded * 1000;
    setTimeout(() => {
      setCurrentAction(stepMessages.userDataLoaded);

      // After showing the message, mark as complete
      setTimeout(() => {
        setSteps((prev) => ({ ...prev, userDataLoaded: true }));
      }, 500);
    }, 100); // Start almost immediately

    // STEP 2: Subscription loading
    setTimeout(() => {
      setCurrentAction(stepMessages.subscriptionLoaded);

      setTimeout(() => {
        setSteps((prev) => ({ ...prev, subscriptionLoaded: true }));
      }, 500);
    }, cumulativeTime);

    // STEP 3: Special access check
    cumulativeTime += stepTimings.subscriptionLoaded * 1000;
    setTimeout(() => {
      setCurrentAction(stepMessages.specialAccessLoaded);

      setTimeout(() => {
        setSteps((prev) => ({ ...prev, specialAccessLoaded: true }));
      }, 500);
    }, cumulativeTime);

    // STEP 4: Security checks
    cumulativeTime += stepTimings.specialAccessLoaded * 1000;
    setTimeout(() => {
      setCurrentAction(stepMessages.additionalChecks);

      setTimeout(() => {
        setSteps((prev) => ({ ...prev, additionalChecks: true }));
      }, 500);
    }, cumulativeTime);

    // STEP 5: Data verification
    cumulativeTime += stepTimings.additionalChecks * 1000;
    setTimeout(() => {
      setCurrentAction(stepMessages.allDataVerified);

      setTimeout(() => {
        setSteps((prev) => ({ ...prev, allDataVerified: true }));
      }, 500);
    }, cumulativeTime);

    // STEP 6: Dashboard preparation
    cumulativeTime += stepTimings.allDataVerified * 1000;
    setTimeout(() => {
      setCurrentAction(stepMessages.readyToRedirect);

      setTimeout(() => {
        setSteps((prev) => ({ ...prev, readyToRedirect: true }));
      }, 500);
    }, cumulativeTime);

    // Set the final redirect to occur at 15s
    redirectTimerRef.current = setTimeout(() => {
      setState({
        isLoading: false,
        readyToRedirect: true,
        secondsRemaining: 0,
        progress: 100,
      });
    }, 15000);

    // Clean up on unmount
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

  // Helper function to render status row
  const renderStatusRow = (step, label, completionText) => {
    const isComplete = steps[step];
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">{label}:</span>
          {isComplete && (
            <span className="text-xs text-green-600 dark:text-green-400 italic">
              {completionText}
            </span>
          )}
        </div>
        <span className="flex items-center">
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg border border-gray-200 dark:border-gray-600 shadow-md text-center max-w-md w-full">
        <Loader className="animate-spin h-10 w-10 mx-auto mb-4 text-blue-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Logging you in
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Please wait while we prepare your dashboard...
        </p>

        {/* Current action text */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
          {currentAction}
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

        {/* Loading progress panel */}
        <div className="mt-6">
          <div className="text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Loading Progress
            </h3>

            <div className="space-y-2 text-xs">
              {renderStatusRow(
                "userDataLoaded",
                "User data",
                completionMessages.userDataLoaded
              )}
              {renderStatusRow(
                "subscriptionLoaded",
                "Subscription",
                completionMessages.subscriptionLoaded
              )}
              {renderStatusRow(
                "specialAccessLoaded",
                "Special access",
                completionMessages.specialAccessLoaded
              )}
              {renderStatusRow(
                "additionalChecks",
                "Security checks",
                completionMessages.additionalChecks
              )}
              {renderStatusRow(
                "allDataVerified",
                "Data verification",
                completionMessages.allDataVerified
              )}
              {renderStatusRow(
                "readyToRedirect",
                "Dashboard preparation",
                completionMessages.readyToRedirect
              )}

              <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-200 dark:border-gray-600">
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
