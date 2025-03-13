import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PricingComponent from "../components/PricingComponent";

const PricingPage = () => {
  const {
    user,
    checkSubscriptionStatus,
    isSubscriptionLoading,
    isFreeTier,
    isAuthenticated,
  } = useAuth();
  const location = useLocation();
  const fromSignup = location.state?.fromSignup || false;
  const fromRestrictedPage = location.state?.from || false;

  // Single loading state with initial value of false for immediate render
  const [isPageLoading, setIsPageLoading] = useState(false);
  const subscriptionChecked = useRef(false);

  // Only check subscription once, and do it after initial render
  useEffect(() => {
    if (
      isAuthenticated() &&
      !subscriptionChecked.current &&
      !isSubscriptionLoading
    ) {
      subscriptionChecked.current = true;
      // Don't make the page wait for this - do it in the background
      checkSubscriptionStatus().catch((err) => {
        console.error("Error checking subscription:", err);
      });
    }
  }, [isAuthenticated, checkSubscriptionStatus, isSubscriptionLoading]);

  // Generate candlestick data for the hologram
  const generateCandlesticks = (count) => {
    const candlesticks = [];
    let price = 100;

    for (let i = 0; i < count; i++) {
      // Random price movement with slightly upward bias
      const movement = (Math.random() - 0.45) * 10;
      const open = price;
      price += movement;
      const close = price;

      // Random high and low beyond open/close
      const high = Math.max(open, close) + Math.random() * 3;
      const low = Math.min(open, close) - Math.random() * 3;

      candlesticks.push({ open, close, high, low });
    }

    return candlesticks;
  };

  // Simple function to determine message content
  function getMessageData() {
    // For non-authenticated users
    if (!isAuthenticated()) {
      return {
        title: "Choose Your Plan",
        message: "Sign up for an account to get started with TraderJournal.",
      };
    }

    // For authenticated users
    if (fromSignup) {
      return {
        title: "Welcome to TraderJournal!",
        message:
          "Your account has been successfully created. Choose your plan below to get started.",
      };
    } else if (fromRestrictedPage) {
      return {
        title: "Subscription Required",
        message:
          "You need a subscription to access this feature. Choose a plan below to continue.",
      };
    } else if (user?.subscription?.cancelAtPeriodEnd) {
      return {
        title: "Your Subscription is Ending Soon",
        message: `Your subscription will end on ${new Date(
          user.subscription.currentPeriodEnd
        ).toLocaleDateString()}. Reactivate or change your plan below.`,
      };
    } else if (user?.subscription?.active && !isFreeTier()) {
      return {
        title: "Manage Your Subscription",
        message:
          "You currently have an active subscription. You can manage or upgrade your plan below.",
      };
    } else if (isFreeTier()) {
      return {
        title: "Upgrade Your Experience",
        message:
          "You're currently on the free plan. Upgrade to access premium features.",
      };
    }

    return {
      title: "Choose Your Plan",
      message: "Select the plan that best fits your trading needs.",
    };
  }

  function getMessageClass() {
    if (!isAuthenticated()) return "bg-gray-800/60 dark:bg-gray-800/60";
    if (fromSignup || fromRestrictedPage)
      return "bg-primary/10 dark:bg-primary/20";
    if (isFreeTier()) return "bg-secondary/10 dark:bg-secondary/20";
    if (user?.subscription?.cancelAtPeriodEnd)
      return "bg-accent/10 dark:bg-accent/20";
    return "bg-gray-100/80 dark:bg-gray-800/60";
  }

  function getIcon() {
    if (!isAuthenticated()) {
      return (
        <svg
          className="h-6 w-6 text-gray-400 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
    }

    if (fromSignup) {
      return (
        <svg
          className="h-6 w-6 text-primary"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    if (fromRestrictedPage) {
      return (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }

    if (user?.subscription?.cancelAtPeriodEnd) {
      return (
        <svg
          className="h-6 w-6 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }

    if (isFreeTier && isFreeTier()) {
      return (
        <svg
          className="h-6 w-6 text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      );
    }

    // Default icon
    return (
      <svg
        className="h-6 w-6 text-gray-600 dark:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    );
  }

  function getTextColorClass() {
    if (!isAuthenticated()) return "text-gray-100 dark:text-gray-100";
    if (fromSignup || fromRestrictedPage)
      return "text-primary dark:text-primary-light";
    if (isFreeTier()) return "text-secondary dark:text-secondary-light";
    if (user?.subscription?.cancelAtPeriodEnd)
      return "text-accent dark:text-accent-light";
    return "text-gray-800 dark:text-gray-100";
  }

  function getDescriptionColorClass() {
    if (!isAuthenticated()) return "text-gray-300 dark:text-gray-300";
    if (fromSignup || fromRestrictedPage)
      return "text-primary/80 dark:text-primary/80";
    if (isFreeTier()) return "text-secondary/80 dark:text-secondary/80";
    if (user?.subscription?.cancelAtPeriodEnd)
      return "text-accent/80 dark:text-accent/80";
    return "text-gray-600 dark:text-gray-300";
  }

  const messageData = getMessageData();
  const messageClass = getMessageClass();
  const messageIcon = getIcon();
  const textColorClass = getTextColorClass();
  const descriptionColorClass = getDescriptionColorClass();

  // Loading state
  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg text-primary dark:text-primary-light">
          Loading...
        </div>
      </div>
    );
  }

  // Generate two sets of candlesticks for the hologram effect
  const candlesticks1 = generateCandlesticks(20);
  const candlesticks2 = generateCandlesticks(20);

  // Scale functions for SVG
  const scalePrice = (price, min, max, height) => {
    const range = max - min;
    return height - ((price - min) / range) * (height - 20) - 10;
  };

  // Calculate min and max for scaling
  const allValues1 = candlesticks1.flatMap((c) => [c.high, c.low]);
  const allValues2 = candlesticks2.flatMap((c) => [c.high, c.low]);
  const min1 = Math.min(...allValues1) - 5;
  const max1 = Math.max(...allValues1) + 5;
  const min2 = Math.min(...allValues2) - 5;
  const max2 = Math.max(...allValues2) + 5;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 relative overflow-hidden">
      {/* Holographic Chart Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light/Dark overlay */}
        <div className="absolute inset-0 bg-white/70 dark:bg-black/70 z-0"></div>

        {/* First chart (back) */}
        <div className="absolute inset-0 chart-container chart-back">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main chart area with soft glow */}
            <defs>
              <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient
                id="neonGradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.9)" />
                <stop offset="50%" stopColor="rgba(109, 169, 255, 0.95)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.9)" />
              </linearGradient>
            </defs>

            {/* Candlesticks */}
            <g filter="url(#glow1)">
              {candlesticks1.map((candle, i) => {
                const x = 100 + i * 40;
                const isUp = candle.close >= candle.open;
                const highY = scalePrice(candle.high, min1, max1, 600);
                const lowY = scalePrice(candle.low, min1, max1, 600);
                const openY = scalePrice(candle.open, min1, max1, 600);
                const closeY = scalePrice(candle.close, min1, max1, 600);
                const topY = Math.min(openY, closeY);
                const bottomY = Math.max(openY, closeY);
                const height = Math.max(bottomY - topY, 1);

                return (
                  <g key={`candle1-${i}`}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke="rgba(59, 130, 246, 0.9)"
                      strokeWidth="1.5"
                      className="light-mode-stroke"
                    />
                    {/* Body */}
                    <rect
                      x={x - 8}
                      y={topY}
                      width="16"
                      height={height}
                      fill="rgba(59, 130, 246, 0.25)"
                      stroke="rgba(59, 130, 246, 0.9)"
                      strokeWidth="1.5"
                      className="light-mode-fill light-mode-stroke"
                    />
                  </g>
                );
              })}
            </g>

            {/* Moving average line */}
            <path
              d={`M ${100} ${scalePrice(
                candlesticks1[0].close,
                min1,
                max1,
                600
              )} ${candlesticks1
                .map(
                  (c, i) =>
                    `L ${100 + i * 40} ${scalePrice(c.close, min1, max1, 600)}`
                )
                .join(" ")}`}
              stroke="rgba(139, 92, 246, 0.8)"
              strokeWidth="2"
              fill="none"
              filter="url(#glow1)"
              className="light-mode-stroke"
            />
          </svg>
        </div>

        {/* Second chart (front) */}
        <div className="absolute inset-0 chart-container chart-front">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient
                id="neonGradient2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                <stop offset="50%" stopColor="rgba(125, 176, 255, 0.85)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
              </linearGradient>
            </defs>

            {/* Candlesticks */}
            <g filter="url(#glow2)">
              {candlesticks2.map((candle, i) => {
                const x = 100 + i * 40;
                const isUp = candle.close >= candle.open;
                const highY = scalePrice(candle.high, min2, max2, 600);
                const lowY = scalePrice(candle.low, min2, max2, 600);
                const openY = scalePrice(candle.open, min2, max2, 600);
                const closeY = scalePrice(candle.close, min2, max2, 600);
                const topY = Math.min(openY, closeY);
                const bottomY = Math.max(openY, closeY);
                const height = Math.max(bottomY - topY, 1);

                return (
                  <g key={`candle2-${i}`}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke="rgba(59, 130, 246, 0.8)"
                      strokeWidth="1.5"
                      className="light-mode-stroke"
                    />
                    {/* Body */}
                    <rect
                      x={x - 8}
                      y={topY}
                      width="16"
                      height={height}
                      fill="rgba(59, 130, 246, 0.2)"
                      stroke="rgba(59, 130, 246, 0.8)"
                      strokeWidth="1.5"
                      className="light-mode-fill light-mode-stroke"
                    />
                  </g>
                );
              })}
            </g>

            {/* Moving average line */}
            <path
              d={`M ${100} ${scalePrice(
                candlesticks2[0].close,
                min2,
                max2,
                600
              )} ${candlesticks2
                .map(
                  (c, i) =>
                    `L ${100 + i * 40} ${scalePrice(c.close, min2, max2, 600)}`
                )
                .join(" ")}`}
              stroke="rgba(139, 92, 246, 0.7)"
              strokeWidth="2"
              fill="none"
              filter="url(#glow2)"
              className="light-mode-stroke"
            />
          </svg>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div
          className={`${messageClass} p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg mb-6 sm:mb-8 backdrop-blur-md`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">{messageIcon}</div>
            <div className="ml-3">
              <h3
                className={`text-base sm:text-lg font-medium ${textColorClass}`}
              >
                {messageData.title}
              </h3>
              <div
                className={`mt-1 text-sm sm:text-base ${descriptionColorClass}`}
              >
                <p>{messageData.message}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <PricingComponent />
        </div>
      </div>

      {/* CSS for animations with multi-axis rotation */}
      <style jsx>{`
        .chart-container {
          transform-style: preserve-3d;
          perspective: 1200px;
          transform-origin: center center;
        }

        .chart-back {
          animation: rotate3D-back 60s linear infinite;
          opacity: 0.4;
          transform: translateZ(-30px);
        }

        .chart-front {
          animation: rotate3D-front 45s linear infinite reverse;
          opacity: 0.35;
          transform: translateZ(40px);
        }

        :global(.light-mode-stroke) {
          stroke-opacity: 0.7;
        }

        :global(.dark .light-mode-stroke) {
          stroke-opacity: 1;
        }

        :global(.light-mode-fill) {
          fill-opacity: 0.3;
        }

        :global(.dark .light-mode-fill) {
          fill-opacity: 0.2;
        }

        @keyframes rotate3D-back {
          0% {
            transform: translateZ(-30px) rotate3d(1, 1, 1, 0deg);
          }
          100% {
            transform: translateZ(-30px) rotate3d(1, 1, 1, 360deg);
          }
        }

        @keyframes rotate3D-front {
          0% {
            transform: translateZ(40px) rotate3d(1, 2, 0.5, 0deg);
          }
          100% {
            transform: translateZ(40px) rotate3d(1, 2, 0.5, 360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
