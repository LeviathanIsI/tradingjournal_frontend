import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";

const AICreditsInfo = () => {
  const { user } = useAuth();
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    if (user?.aiRequestLimits?.nextResetDate) {
      updateTimeUntilReset();

      const intervalId = setInterval(updateTimeUntilReset, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user?.aiRequestLimits?.nextResetDate]);

  const updateTimeUntilReset = () => {
    if (user?.aiRequestLimits?.nextResetDate) {
      const resetDate = new Date(user.aiRequestLimits.nextResetDate);
      setTimeUntilReset(formatDistanceToNow(resetDate, { addSuffix: true }));
    }
  };

  if (!user?.aiRequestLimits) {
    return (
      <div className="bg-blue-700/20 border border-blue-500/20 rounded-md p-3 mb-4 text-sm text-center">
        <span className="text-blue-300 dark:text-blue-200">
          Use an AI feature to see your remaining credits
        </span>
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
            {user.aiRequestLimits.remainingRequests} /{" "}
            {user.aiRequestLimits.weeklyLimit} remaining
          </span>
        </div>
      </div>
      <div className="text-blue-300 dark:text-blue-200">Resets {timeUntilReset}</div>
    </div>
  );
};

export default AICreditsInfo;