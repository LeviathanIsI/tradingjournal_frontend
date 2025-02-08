import React from "react";
import ProfitLossChart from "./ProfitLossChart";
import TimeAnalysis from "./TimeAnalysis";
import StreakAndDrawdown from "./StreakAndDrawdown";

const Analysis = ({ trades, activeChart, setActiveChart }) => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="min-h-[500px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Analysis
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveChart("pnl")}
              className={`px-3 py-1 rounded-lg ${
                activeChart === "pnl"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              P/L Chart
            </button>
            <button
              onClick={() => setActiveChart("time")}
              className={`px-3 py-1 rounded-lg ${
                activeChart === "time"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Time Analysis
            </button>
            <button
              onClick={() => setActiveChart("risk")}
              className={`px-3 py-1 rounded-lg ${
                activeChart === "risk" || activeChart === "streaks"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Risk & Streaks
            </button>
          </div>
        </div>

        {activeChart === "pnl" ? (
          <ProfitLossChart trades={trades} />
        ) : activeChart === "time" ? (
          <TimeAnalysis trades={trades} />
        ) : activeChart === "risk" || activeChart === "streaks" ? (
          <StreakAndDrawdown trades={trades} />
        ) : null}
      </div>
    </div>
  );
};

export default Analysis;
