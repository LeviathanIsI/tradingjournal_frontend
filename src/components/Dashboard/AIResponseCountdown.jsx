// src/components/AIResponseCountdown.jsx
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const AIResponseCountdown = ({ isLoading, estimatedTime = 30 }) => {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);

  useEffect(() => {
    let timer;

    if (isLoading) {
      setTimeRemaining(estimatedTime);
      setShowExtendedMessage(false);

      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          // When we hit zero, show extended message instead of negative numbers
          if (prev <= 1) {
            setShowExtendedMessage(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Reset when loading completes
      setTimeRemaining(estimatedTime);
      setShowExtendedMessage(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, estimatedTime]);

  if (!isLoading) return null;

  return (
    <div className="mt-3 text-center">
      <div className="flex items-center justify-center mb-2">
        <Clock className="animate-pulse h-5 w-5 mr-2 text-indigo-400 dark:text-indigo-400" />
        {showExtendedMessage ? (
          <span className="text-gray-600 dark:text-gray-300">
            Still analyzing... AI responses may take a bit longer for complex
            trades
          </span>
        ) : (
          <span className="text-gray-600 dark:text-gray-300">
            Estimated time remaining:{" "}
            <span className="font-medium">{timeRemaining}</span> seconds
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-sm h-2.5">
        <div
          className="bg-indigo-500 dark:bg-indigo-400 h-2.5 rounded-sm transition-all duration-300 ease-in-out"
          style={{
            width: showExtendedMessage
              ? "90%" // Keep at 90% when we're past the estimated time
              : `${Math.max(5, (timeRemaining / estimatedTime) * 100)}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default AIResponseCountdown;
