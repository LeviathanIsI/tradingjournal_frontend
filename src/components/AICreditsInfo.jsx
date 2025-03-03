import React, { useEffect, useState, useCallback, useReducer } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useAI } from "../context/AIContext";
import { RefreshCw } from "lucide-react";

// Use React.memo to prevent unnecessary re-renders
const AICreditsInfo = React.memo(() => {
  const { user } = useAuth();
  const { fetchAILimits, aiLimitsUpdateEvent } = useAI();
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localAILimits, setLocalAILimits] = useState(user?.aiRequestLimits);
  const [updateQueued, setUpdateQueued] = useState(false);
  const [updateTimeout, setUpdateTimeout] = useState(null);

  // We'll use these limits for display, preferring localAILimits if available
  const displayLimits = localAILimits || user?.aiRequestLimits;

  // Function to fetch latest limits from API - guaranteed to be fresh
  const fetchLatestLimits = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (typeof fetchAILimits === "function") {
        const freshLimits = await fetchAILimits();
        if (freshLimits) {
          setLocalAILimits(freshLimits);
          return freshLimits;
        }
      }
    } catch (error) {
      console.error("❌ Error fetching latest AI limits:", error);
    } finally {
      setIsRefreshing(false);
    }

    return null;
  }, [fetchAILimits]);

  // Handle queued updates with debouncing
  const queueUpdateCheck = useCallback(() => {
    // Clear any existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    // Set flag to show loading indicator
    setUpdateQueued(true);

    // Set a new timeout - wait 1500ms to allow database updates to propagate
    const timeoutId = setTimeout(async () => {
      await fetchLatestLimits();
      setUpdateQueued(false);
    }, 1500);

    setUpdateTimeout(timeoutId);

    // Return cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchLatestLimits, updateTimeout]);

  // Set up event listener for AI limits updates
  useEffect(() => {
    // Handler function for the event
    const handleAILimitsUpdate = (event) => {

      // Instead of immediately updating, queue a check to get the latest data
      queueUpdateCheck();
    };

    // Add event listener
    if (aiLimitsUpdateEvent) {
      aiLimitsUpdateEvent.addEventListener(
        "ai-limits-updated",
        handleAILimitsUpdate
      );
    }

    // Cleanup on unmount
    return () => {
      if (aiLimitsUpdateEvent) {
        aiLimitsUpdateEvent.removeEventListener(
          "ai-limits-updated",
          handleAILimitsUpdate
        );
      }
    };
  }, [aiLimitsUpdateEvent, queueUpdateCheck]);

  // Update local state when user info changes and not updating
  useEffect(() => {
    if (user?.aiRequestLimits && !isRefreshing && !updateQueued) {
      setLocalAILimits(user.aiRequestLimits);
    }
  }, [user?.aiRequestLimits, isRefreshing, updateQueued]);

  // Update the countdown timer
  const updateTimeUntilReset = useCallback(() => {
    if (displayLimits?.nextResetDate) {
      const resetDate = new Date(displayLimits.nextResetDate);
      setTimeUntilReset(formatDistanceToNow(resetDate, { addSuffix: true }));
    }
  }, [displayLimits?.nextResetDate]);

  // Set up timer for countdown
  useEffect(() => {
    if (displayLimits?.nextResetDate) {
      updateTimeUntilReset();
      const intervalId = setInterval(updateTimeUntilReset, 60000);
      return () => clearInterval(intervalId);
    }
  }, [displayLimits?.nextResetDate, updateTimeUntilReset]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (isRefreshing) return;
    await fetchLatestLimits();
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  if (!displayLimits) {
    return (
      <div className="bg-blue-700/20 border border-blue-500/20 rounded-md p-3 mb-4 text-sm text-center flex justify-between items-center">
        <span className="text-blue-300 dark:text-blue-200">
          Use an AI feature to see your remaining credits
        </span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200 flex items-center"
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="text-xs">Refresh</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-700/20 border border-blue-500/20 rounded-md p-3 mb-4 text-sm flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-blue-500 dark:text-blue-400 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 100-2H9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div>
          <span className="text-blue-300 dark:text-blue-200">AI Credits: </span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {updateQueued ? (
              <span className="inline-flex items-center">
                <RefreshCw
                  className="animate-spin h-3 w-3 mr-1"
                  style={{ animationDuration: "1s" }}
                />
                updating...
              </span>
            ) : (
              `${displayLimits.remainingRequests} / ${displayLimits.weeklyLimit} remaining`
            )}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        <div className="text-blue-300 dark:text-blue-200 mr-4">
          Resets {timeUntilReset}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || updateQueued}
          className="text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200 flex items-center"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRefreshing || updateQueued ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
});

AICreditsInfo.displayName = "AICreditsInfo";

export default AICreditsInfo;
