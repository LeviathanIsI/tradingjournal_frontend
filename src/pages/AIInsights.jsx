import React, { useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import WeeklyReview from "../components/WeeklyReview";
import SmartTradeCoaching from "../components/SmartTradeCoaching";
import PatternRecognition from "../components/PatternRecognition";
import PredictiveAnalysis from "../components/PredictiveAnalysis";
import TradeExecutionReplay from "../components/TradeExecutionReplay";
import TradingBotSimulator from "../components/TradingBotSimulator";
import AICreditsInfo from "../components/AICreditsInfo";
import { useAI } from "../context/AIContext"; // Change this line - use useAI instead of useAuth

// SubNav component for AI features
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

  return (
    <div className="flex flex-wrap space-x-2 md:space-x-4 mb-6 border-b border-gray-200 dark:border-gray-600/50 pb-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
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

  return (
    <div className="max-w-6xl mx-auto p-6">
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
