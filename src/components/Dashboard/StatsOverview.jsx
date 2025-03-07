// src/components/Dashboard/StatsOverview.jsx
import React from "react";
import { useTradingStats } from "../../context/TradingStatsContext";
import { useAuth } from "../../context/AuthContext";

const StatsOverview = () => {
  const { stats, formatters } = useTradingStats();
  const { user } = useAuth();
  const { formatCurrency, formatPercent, formatRatio } = formatters;

  // Early return for loading state can be handled by parent component if needed
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-transparent">
        <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">Loading stats...</p>
        </div>
      </div>
    );
  }

  // Calculate current balance
  const startingCapital = user?.preferences?.startingCapital || 0;
  const currentBalance = startingCapital + (stats.totalProfit || 0);
  const percentageReturn =
    startingCapital > 0
      ? ((stats.totalProfit || 0) / startingCapital) * 100
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-transparent">
      {/* Capital Card */}
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Starting Capital
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(startingCapital)}
            </p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Current Balance
            </h3>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  stats.totalProfit > 0
                    ? "text-green-600 dark:text-green-400"
                    : stats.totalProfit < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {formatCurrency(currentBalance)}
              </p>
              {startingCapital > 0 && stats.totalProfit !== 0 && (
                <span
                  className={`text-xs sm:text-sm ${
                    stats.totalProfit > 0
                      ? "text-green-600 dark:text-green-400"
                      : stats.totalProfit < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {formatPercent(percentageReturn, 2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Stats Card */}
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <div className="flex justify-between">
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Total Trades
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalTrades || 0}
            </p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Win Rate
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatPercent(stats.winRate)}
            </p>
          </div>
        </div>
      </div>

      {/* Win/Loss Ratio Card */}
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <div>
          <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Win/Loss Ratio
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatRatio(stats.winLossRatio)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.winningTrades || 0} W / {stats.losingTrades || 0} L
          </p>
        </div>
      </div>

      {/* Total P/L Card */}
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Total P/L
        </h3>
        <p
          className={`text-xl sm:text-2xl font-bold ${
            (stats.totalProfit || 0) >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(stats.totalProfit || 0)}
        </p>
      </div>
    </div>
  );
};

export default StatsOverview;
