// src/components/StatsOverview.jsx
import React, { useEffect } from "react";

const StatsOverview = ({ user, stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-transparent">
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Starting Capital
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(user?.preferences?.startingCapital || 0)}
            </p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Current Balance
            </h3>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  stats?.totalProfit > 0
                    ? "text-green-600 dark:text-green-400"
                    : stats?.totalProfit < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {formatCurrency(
                  (user?.preferences?.startingCapital || 0) +
                    (stats?.totalProfit || 0)
                )}
              </p>
              {user?.preferences?.startingCapital > 0 &&
                stats?.totalProfit !== 0 && (
                  <span
                    className={`text-xs sm:text-sm ${
                      stats?.totalProfit > 0
                        ? "text-green-600 dark:text-green-400"
                        : stats?.totalProfit < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {(
                      ((stats?.totalProfit || 0) /
                        user.preferences.startingCapital) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <div className="flex justify-between">
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Total Trades
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalTrades || 0}
            </p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Win Rate
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {/* Recalculate win rate as a fallback if missing from stats */}
              {(
                stats?.winRate ||
                (stats?.profitableTrades && stats?.totalTrades
                  ? (stats.profitableTrades / stats.totalTrades) * 100
                  : 0)
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <div>
          <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Win/Loss Ratio
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {/* Recalculate win/loss ratio as a fallback if missing from stats */}
            {(
              stats?.winLossRatio ||
              (stats?.profitableTrades &&
              stats?.losingTrades &&
              stats.losingTrades > 0
                ? stats.profitableTrades / stats.losingTrades
                : stats?.profitableTrades || 0)
            ).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats?.profitableTrades || 0} W / {stats?.losingTrades || 0} L
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Total P/L
        </h3>
        <p
          className={`text-xl sm:text-2xl font-bold ${
            (stats?.totalProfit || 0) >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(stats?.totalProfit || 0)}
        </p>
      </div>
    </div>
  );
};

export default StatsOverview;
