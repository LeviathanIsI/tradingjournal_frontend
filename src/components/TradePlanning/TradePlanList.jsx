import React from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  ChevronDown,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";

const TradePlanList = ({
  tradePlans,
  handleStatusChange,
  handleEdit,
  handleDelete,
}) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "EXECUTED":
        return "bg-green-100/90 dark:bg-green-800/30 text-green-800 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100/90 dark:bg-red-800/30 text-red-800 dark:text-red-300";
      default: // PLANNED
        return "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light";
    }
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case "LONG":
        return (
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "SHORT":
        return (
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      case "SWING":
        return (
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {tradePlans.length === 0 ? (
        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6 text-center border border-gray-200/70 dark:border-gray-600/40">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-600/50 rounded-full mb-3">
            <AlertCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            No Trade Plans Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Create your first trade plan to track your strategy and execution.
          </p>
        </div>
      ) : (
        tradePlans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white dark:bg-gray-800/80 rounded-lg shadow-sm hover:shadow transition-shadow p-5 space-y-4 border border-gray-200 dark:border-gray-700/60"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {plan.ticker}
                  </h3>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${getStatusStyles(
                      plan.status
                    )}`}
                  >
                    {plan.status === "EXECUTED" && (
                      <BadgeCheck className="h-3.5 w-3.5" />
                    )}
                    {plan.status}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                  {new Date(plan.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-2 text-primary dark:text-primary-light hover:bg-primary/5 dark:hover:bg-primary/10 rounded-md transition-colors"
                  aria-label="Edit trade plan"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  aria-label="Delete trade plan"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200/70 dark:border-gray-600/40">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/20 mr-3">
                    {getDirectionIcon(plan.direction)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Direction
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {plan.direction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/20 mr-3">
                    <Target className="h-4 w-4 text-primary dark:text-primary-light" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Entry Price
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {plan.execution?.entry
                        ? `$${Number(plan.execution.entry).toFixed(2)}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50/60 dark:bg-green-900/10 rounded-lg p-3 border border-green-100/80 dark:border-green-800/30">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
                  Profit Target
                </p>
                <p className="font-medium text-green-700 dark:text-green-300 text-lg">
                  {plan.execution?.profitTarget
                    ? `$${Number(plan.execution.profitTarget).toFixed(2)}`
                    : "—"}
                </p>
              </div>
              <div className="bg-red-50/60 dark:bg-red-900/10 rounded-lg p-3 border border-red-100/80 dark:border-red-800/30">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium mb-1">
                  Stop Loss
                </p>
                <p className="font-medium text-red-700 dark:text-red-300 text-lg">
                  {plan.execution?.stopLoss
                    ? `$${Number(plan.execution.stopLoss).toFixed(2)}`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <div className="relative">
                <select
                  value={plan.status}
                  onChange={(e) => handleStatusChange(plan._id, e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600/70 rounded-md 
                  bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                  appearance-none"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="EXECUTED">Executed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TradePlanList;
