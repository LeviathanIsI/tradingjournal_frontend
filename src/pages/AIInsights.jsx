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
import {
  CalendarCheck,
  Brain,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Bot,
  Sparkles,
} from "lucide-react";

// SubNav component for AI features - Add preventDefault to links
const AISubNav = () => {
  const location = useLocation();

  // Define the navigation items with icons
  const navItems = [
    {
      path: "/dashboard/ai-insights/weekly-review",
      label: "Weekly Review",
      icon: CalendarCheck,
    },
    {
      path: "/dashboard/ai-insights/trade-coaching",
      label: "Smart Trade Coaching",
      icon: Brain,
    },
    {
      path: "/dashboard/ai-insights/pattern-recognition",
      label: "Pattern Recognition",
      icon: TrendingUp,
    },
    {
      path: "/dashboard/ai-insights/predictive-analysis",
      label: "Predictive Analysis",
      icon: BarChart2,
    },
    {
      path: "/dashboard/ai-insights/execution-replay",
      label: "Execution Replay",
      icon: RefreshCw,
    },
    {
      path: "/dashboard/ai-insights/trading-bot",
      label: "Trading Bot Simulator",
      icon: Bot,
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
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex flex-nowrap gap-2 md:gap-3 pb-4 mb-6 border-b border-gray-200 dark:border-gray-700/40 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-md transition-all text-sm font-medium whitespace-nowrap
                ${
                  isActive
                    ? "bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 border border-transparent"
                }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
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
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-2 rounded-md">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
              AI Trade Insights
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Leverage AI to enhance your trading strategy and performance
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm mb-6">
        <div className="p-4 sm:p-6">
          <AICreditsInfo />
        </div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm">
        <div className="p-4 sm:p-6">
          <AISubNav />

          <div className="mt-4">
            <Routes>
              <Route
                path=""
                element={<Navigate to="weekly-review" replace />}
              />
              <Route path="weekly-review" element={<WeeklyReview />} />
              <Route path="trade-coaching" element={<SmartTradeCoaching />} />
              <Route
                path="pattern-recognition"
                element={<PatternRecognition />}
              />
              <Route
                path="predictive-analysis"
                element={<PredictiveAnalysis />}
              />
              <Route
                path="execution-replay"
                element={<TradeExecutionReplay />}
              />
              <Route path="trading-bot" element={<TradingBotSimulator />} />
              <Route
                path="*"
                element={<Navigate to="weekly-review" replace />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
