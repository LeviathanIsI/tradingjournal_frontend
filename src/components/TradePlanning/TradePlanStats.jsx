import React from "react";
import { CheckCircle, XCircle, ClipboardList } from "lucide-react";

const TradePlanStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white/90 dark:bg-gray-800/60 p-4 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm transition-all hover:shadow group">
        <div className="flex justify-between items-start">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Planned Trades
          </h3>
          <ClipboardList className="h-5 w-5 text-primary/70 dark:text-primary/60 group-hover:text-primary transition-colors" />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          {stats.planned || 0}
        </p>
        <div className="h-1 w-16 bg-primary/20 rounded-full mt-3"></div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/60 p-4 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm transition-all hover:shadow group">
        <div className="flex justify-between items-start">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Executed Trades
          </h3>
          <CheckCircle className="h-5 w-5 text-green-500/70 dark:text-green-500/60 group-hover:text-green-500 transition-colors" />
        </div>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
          {stats.executed || 0}
        </p>
        <div className="h-1 w-16 bg-green-500/20 rounded-full mt-3"></div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/60 p-4 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm transition-all hover:shadow group">
        <div className="flex justify-between items-start">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Cancelled Trades
          </h3>
          <XCircle className="h-5 w-5 text-red-500/70 dark:text-red-500/60 group-hover:text-red-500 transition-colors" />
        </div>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
          {stats.cancelled || 0}
        </p>
        <div className="h-1 w-16 bg-red-500/20 rounded-full mt-3"></div>
      </div>
    </div>
  );
};

export default TradePlanStats;
