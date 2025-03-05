import React, { useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import WeeklyReview from "../components/Dashboard/WeeklyReview";
import SmartTradeCoaching from "../components/Dashboard/SmartTradeCoaching";
import PatternRecognition from "../components/Dashboard/PatternRecognition";
import PredictiveAnalysis from "../components/Dashboard/PredictiveAnalysis";
import TradeExecutionReplay from "../components/Dashboard/TradeExecutionReplay";
import TradingBotSimulator from "../components/Dashboard/TradingBotSimulator";
import AICreditsInfo from "../components/Dashboard/AICreditsInfo";
import { useAI } from "../context/AIContext";

// SubNav component for AI features - Add preventDefault to links
const AISubNav = () => {
  const location = useLocation();

  // Define the navigation items
  const navItems = [
    {
      path: "/dashboard/ai-insights/weekly-review",
      label: "Weekly Review",
    },
    {
      path: "/dashboard/ai-insights/trade-coaching",
      label: "Smart Trade Coaching",
    },
    {
      path: "/dashboard/ai-insights/pattern-recognition",
      label: "Pattern Recognition",
    },
    {
      path: "/dashboard/ai-insights/predictive-analysis",
      label: "Predictive Analysis",
    },
    {
      path: "/dashboard/ai-insights/execution-replay",
      label: "Execution Replay",
    },
    {
      path: "/dashboard/ai-insights/trading-bot",
      label: "Trading Bot Simulator",
    },
  ];

  // Handle link clicks to prevent form submission
  const handleLinkClick = (e) => {
    // Only prevent default if we're already on this page
    // This prevents unwanted form submissions without breaking navigation
    if (e.currentTarget.getAttribute("href") === location.pathname) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-wrap space-x-2 md:space-x-4 mb-6 border-b border-gray-200 dark:border-gray-600/50 pb-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={handleLinkClick}
          className={`px-2 md:px-3 py-2 rounded-sm transition-colors text-sm md:text-base whitespace-nowrap ${
            location.pathname === item.path
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "hover:bg-gray-50 dark:hover:bg-gray-600/30 text-gray-600 dark:text-gray-300"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

const AIInsights = () => {
  // Prevent any default form submissions that might be occurring at this level
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    // Wrap in a div with onSubmit handler to catch any form submissions
    <div className="max-w-6xl mx-auto p-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        AI Trade Insights
      </h2>

      <AICreditsInfo />
      <AISubNav />

      <Routes>
        <Route path="" element={<Navigate to="weekly-review" replace />} />
        <Route path="weekly-review" element={<WeeklyReview />} />
        <Route path="trade-coaching" element={<SmartTradeCoaching />} />
        <Route path="pattern-recognition" element={<PatternRecognition />} />
        <Route path="predictive-analysis" element={<PredictiveAnalysis />} />
        <Route path="execution-replay" element={<TradeExecutionReplay />} />
        <Route path="trading-bot" element={<TradingBotSimulator />} />
        <Route path="*" element={<Navigate to="weekly-review" replace />} />
      </Routes>
    </div>
  );
};

export default AIInsights;
