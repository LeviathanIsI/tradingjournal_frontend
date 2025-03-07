import React from "react";

const TradePlanStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Planned Trades
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          {stats.planned || 0}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Executed Trades
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.executed || 0}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Cancelled Trades
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
          {stats.cancelled || 0}
        </p>
      </div>
    </div>
  );
};

export default TradePlanStats;
