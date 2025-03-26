import React from "react";
import ProfitLossChart from "./ProfitLossChart";
import TimeAnalysis from "./TimeAnalysis";
import StreakAndDrawdown from "./StreakAndDrawdown";
import { BarChart2, Clock, TrendingUp } from "lucide-react";

const Analysis = ({ trades, activeChart, setActiveChart }) => {
  return (
    <div className="bg-white/90 dark:bg-gray-800/60 p-5 sm:p-6 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm">
      <div className="min-h-[300px] sm:min-h-[500px] flex flex-col">
        {/* Header and Controls Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="h-5 w-1 bg-primary rounded-full mr-2"></div>
            Performance Analysis
          </h2>

          {/* Responsive Button Group */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveChart("pnl")}
              className={`flex-1 sm:flex-none px-4 py-2 round-sm text-sm flex items-center justify-center gap-2 transition-all ${
                activeChart === "pnl"
                  ? "bg-primary text-white shadow hover:bg-primary/90"
                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700/40"
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              <span>P/L Chart</span>
            </button>
            <button
              onClick={() => setActiveChart("time")}
              className={`flex-1 sm:flex-none px-4 py-2 round-sm text-sm flex items-center justify-center gap-2 transition-all ${
                activeChart === "time"
                  ? "bg-primary text-white shadow hover:bg-primary/90"
                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700/40"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Time Analysis</span>
            </button>
            <button
              onClick={() => setActiveChart("risk")}
              className={`flex-1 sm:flex-none px-4 py-2 round-sm text-sm flex items-center justify-center gap-2 transition-all ${
                activeChart === "risk" || activeChart === "streaks"
                  ? "bg-primary text-white shadow hover:bg-primary/90"
                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700/40"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Risk & Streaks</span>
            </button>
          </div>
        </div>

        {/* Chart Display Section */}
        <div className="flex-1 w-full">
          {activeChart === "pnl" ? (
            <ProfitLossChart trades={trades} />
          ) : activeChart === "time" ? (
            <TimeAnalysis trades={trades} />
          ) : activeChart === "risk" || activeChart === "streaks" ? (
            <StreakAndDrawdown trades={trades} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
