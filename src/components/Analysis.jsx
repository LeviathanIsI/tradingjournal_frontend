import React from "react";
import ProfitLossChart from "./ProfitLossChart";
import TimeAnalysis from "./TimeAnalysis";
import StreakAndDrawdown from "./StreakAndDrawdown";

const Analysis = ({ trades, activeChart, setActiveChart }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded shadow">
      <div className="min-h-[300px] sm:min-h-[500px] flex flex-col">
        {/* Header and Controls Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Performance Analysis
          </h2>

          {/* Responsive Button Group */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveChart("pnl")}
              className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base ${
                activeChart === "pnl"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              P/L Chart
            </button>
            <button
              onClick={() => setActiveChart("time")}
              className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base ${
                activeChart === "time"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Time Analysis
            </button>
            <button
              onClick={() => setActiveChart("risk")}
              className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base ${
                activeChart === "risk" || activeChart === "streaks"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Risk & Streaks
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
