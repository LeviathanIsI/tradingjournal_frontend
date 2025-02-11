import React from "react";

const StatsOverview = ({ user, stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-transparent">
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400">
              Starting Capital
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(user?.preferences?.startingCapital || 0)}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400">
              Current Balance
            </h3>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-2xl font-bold ${
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
              {user?.preferences?.startingCapital > 0 && (
                <span
                  className={`text-sm ${
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

      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow flex justify-between">
        <div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400">
            Total Trades
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats?.totalTrades || 0}
          </p>
        </div>
        <div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Win Rate</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats?.winRate?.toFixed(1) || 0}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        <h3 className="text-sm text-gray-600 dark:text-gray-400">Total P/L</h3>
        <p
          className={`text-2xl font-bold ${
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
