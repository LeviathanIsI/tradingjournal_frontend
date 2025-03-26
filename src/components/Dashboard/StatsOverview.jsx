// src/components/Dashboard/StatsOverview.jsx
import React from "react";
import { useTradingStats } from "../../context/TradingStatsContext";
import { useAuth } from "../../context/AuthContext";
import { TrendingUp, TrendingDown, BarChart2, DollarSign } from "lucide-react";

const StatsOverview = () => {
  const { stats, formatters } = useTradingStats();
  const { user } = useAuth();
  const { formatCurrency, formatPercent, formatRatio } = formatters;

  // Early return for loading state can be handled by parent component if needed
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-transparent">
        <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-sm">
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
      <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
              Starting Capital
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(startingCapital)}
            </p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center">
              {stats.totalProfit > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1 text-green-500 dark:text-green-400" />
              ) : stats.totalProfit < 0 ? (
                <TrendingDown className="h-4 w-4 mr-1 text-red-500 dark:text-red-400" />
              ) : (
                <DollarSign className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
              )}
              Current Balance
            </h3>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  stats.totalProfit > 0
                    ? "text-green-600 dark:text-green-400"
                    : stats.totalProfit < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-gray-50"
                }`}
              >
                {formatCurrency(currentBalance)}
              </p>
              {startingCapital > 0 && stats.totalProfit !== 0 && (
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    stats.totalProfit > 0
                      ? "text-green-600 dark:text-green-400"
                      : stats.totalProfit < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-50"
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
      <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between">
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <BarChart2 className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
              Total Trades
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stats.totalTrades || 0}
            </p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center justify-end">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500 dark:text-green-400" />
              Win Rate
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatPercent(stats.winRate)}
            </p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/40">
          <div className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-1.5">
            <div
              className="bg-blue-500 dark:bg-blue-400 h-1.5 rounded-full"
              style={{ width: `${stats.winRate || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Win/Loss Ratio Card */}
      <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div>
          <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
            Win/Loss Ratio
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            {formatRatio(stats.winLossRatio)}
          </p>
          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-800/40 text-green-800 dark:text-green-300 rounded mr-2">
              {stats.winningTrades || 0} W
            </span>
            <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-800/40 text-red-800 dark:text-red-300 rounded">
              {stats.losingTrades || 0} L
            </span>
          </div>
        </div>
      </div>

      {/* Total P/L Card */}
      <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center">
          {(stats.totalProfit || 0) >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1 text-green-500 dark:text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1 text-red-500 dark:text-red-400" />
          )}
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
        {stats.avgTradeProfit !== undefined && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Avg per trade:{" "}
            <span className="font-medium">
              {formatCurrency(stats.avgTradeProfit)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsOverview;
