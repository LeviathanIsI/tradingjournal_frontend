import React from "react";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

const TradePlanTable = ({
  tradePlans,
  expandedPlanId,
  toggleExpand,
  handleStatusChange,
  handleEdit,
  handleDelete,
  renderExpandedDetails,
}) => {
  // Helper function to get status styles
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

  // Helper function to get direction icon
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

  // This wrapping function ensures expanded details are rendered properly in table
  const renderExpandedContent = (plan) => {
    // Instead of directly using renderExpandedDetails, we'll wrap its content
    // in a way that works with table structure
    return (
      <div className="px-4 py-5 bg-gray-800/95 text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Analysis</h3>
            <p className="text-gray-400">
              {plan.analysis || "No analysis provided"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Notes</h3>
            <p className="text-gray-400">{plan.notes || "No notes provided"}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/60 overflow-hidden">
      {tradePlans.length === 0 ? (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-3">
            <AlertCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            No Trade Plans Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Create your first trade plan to start tracking your trading
            strategies.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/40">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-700/30">
                <th className="w-10"></th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Direction
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Entry
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profit Target
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stop Loss
                </th>
                <th className="text-center py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800/40 divide-y divide-gray-200 dark:divide-gray-700/40">
              {tradePlans.map((plan) => (
                <React.Fragment key={plan._id}>
                  <tr
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(plan._id)}
                  >
                    <td className="py-4 px-3 text-gray-500 dark:text-gray-400">
                      <button className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-600/50 rounded-md transition-colors">
                        {expandedPlanId === plan._id ? (
                          <ChevronDown
                            size={16}
                            className="text-primary dark:text-primary-light"
                          />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {new Date(plan.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {plan.ticker}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-1.5">
                          {getDirectionIcon(plan.direction)}
                        </span>
                        {plan.direction}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {plan.execution?.entry
                        ? `$${Number(plan.execution.entry).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="py-4 px-4 text-sm text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                      {plan.execution?.profitTarget
                        ? `$${Number(plan.execution.profitTarget).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="py-4 px-4 text-sm text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                      {plan.execution?.stopLoss
                        ? `$${Number(plan.execution.stopLoss).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md ${getStatusStyles(
                          plan.status
                        )}`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1 items-center">
                        <select
                          value={plan.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(plan._id, e.target.value);
                          }}
                          className="mr-2 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600/70 rounded-md 
                          bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                          appearance-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="PLANNED">Planned</option>
                          <option value="EXECUTED">Executed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(plan);
                          }}
                          className="p-1.5 text-primary dark:text-primary-light hover:bg-primary/5 dark:hover:bg-primary/10 rounded-md transition-colors"
                          aria-label="Edit trade plan"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(plan._id);
                          }}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          aria-label="Delete trade plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedPlanId === plan._id && (
                    <tr className="bg-gray-50/80 dark:bg-gray-700/30">
                      <td colSpan="9" className="p-0">
                        {/* Use our custom wrapper instead of the renderExpandedDetails function */}
                        {renderExpandedContent(plan)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradePlanTable;
