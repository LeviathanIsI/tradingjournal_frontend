import React, {
  useEffect,
  useState,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { RefreshCw, Info } from "lucide-react";

// Reducer to manage related states
const limitsReducer = (state, action) => {
  switch (action.type) {
    case "SET_LIMITS":
      return { ...state, limits: action.payload, loading: false };
    case "START_LOADING":
      return { ...state, loading: true };
    case "STOP_LOADING":
      return { ...state, loading: false };
    case "QUEUE_UPDATE":
      return { ...state, updateQueued: true };
    case "COMPLETE_UPDATE":
      return { ...state, updateQueued: false };
    default:
      return state;
  }
};

// Use React.memo to prevent unnecessary re-renders
const AICreditsInfo = React.memo(() => {
  const { user } = useAuth();
  const { fetchAILimits, aiLimitsUpdateEvent } = useAI();
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [updateTimeout, setUpdateTimeout] = useState(null);

  // Use reducer for related state management
  const [state, dispatch] = useReducer(limitsReducer, {
    limits: user?.aiRequestLimits,
    loading: false,
    updateQueued: false,
  });

  // Memoize the display limits
  const displayLimits = useMemo(
    () => state.limits || user?.aiRequestLimits,
    [state.limits, user?.aiRequestLimits]
  );

  // Function to fetch latest limits from API - guaranteed to be fresh
  const fetchLatestLimits = useCallback(async () => {
    dispatch({ type: "START_LOADING" });

    try {
      if (typeof fetchAILimits === "function") {
        const freshLimits = await fetchAILimits();
        if (freshLimits) {
          dispatch({ type: "SET_LIMITS", payload: freshLimits });
          return freshLimits;
        }
      }
    } catch (error) {
      console.error("❌ Error fetching latest AI limits:", error);
    } finally {
      dispatch({ type: "STOP_LOADING" });
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
    dispatch({ type: "QUEUE_UPDATE" });

    // Set a new timeout - wait 1500ms to allow database updates to propagate
    const timeoutId = setTimeout(async () => {
      await fetchLatestLimits();
      dispatch({ type: "COMPLETE_UPDATE" });
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
    const handleAILimitsUpdate = () => {
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
    if (user?.aiRequestLimits && !state.loading && !state.updateQueued) {
      dispatch({ type: "SET_LIMITS", payload: user.aiRequestLimits });
    }
  }, [user?.aiRequestLimits, state.loading, state.updateQueued]);

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
  const handleRefresh = useCallback(async () => {
    if (state.loading) return;
    await fetchLatestLimits();
  }, [fetchLatestLimits, state.loading]);

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
      <div className="bg-primary/10 border border-primary/20 rounded-sm p-4 mb-4 text-sm text-center flex justify-between items-center backdrop-blur-sm">
        <span className="text-primary-dark dark:text-primary-light font-medium">
          Use an AI feature to see your remaining credits
        </span>
        <button
          onClick={handleRefresh}
          disabled={state.loading}
          className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center gap-1.5 p-1.5 hover:bg-primary/10 round-sm transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${state.loading ? "animate-spin" : ""}`}
          />
          <span className="text-xs font-medium">Refresh</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-sm p-4 mb-4 text-sm flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-primary dark:text-primary-light" />
        <div>
          <span className="text-primary-dark dark:text-primary-light font-medium">
            AI Credits:{" "}
          </span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {state.updateQueued ? (
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
      <div className="flex items-center gap-3">
        <div className="text-primary-dark dark:text-primary-light">
          Resets {timeUntilReset}
        </div>
        <button
          onClick={handleRefresh}
          disabled={state.loading || state.updateQueued}
          className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary p-1.5 hover:bg-primary/10 round-sm transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              state.loading || state.updateQueued ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
});

AICreditsInfo.displayName = "AICreditsInfo";

export default AICreditsInfo;
