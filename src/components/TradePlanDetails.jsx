// src/components/TradePlanDetails.jsx
import { X } from "lucide-react";

const TradePlanDetails = ({ isOpen, onClose, plan, onStatusChange }) => {
  if (!isOpen || !plan) return null;

  const handleStatusChange = (e) => {
    onStatusChange(plan._id, e.target.value);
  };

  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
          {plan.ticker}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {plan.direction}
        </p>
        <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center">
          <span
            className={`px-2 py-1 text-sm rounded-full w-fit ${
              plan.status === "EXECUTED"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : plan.status === "CANCELLED"
                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
            }`}
          >
            {plan.status}
          </span>
          <select
            value={plan.status}
            onChange={handleStatusChange}
            className="px-3 py-1.5 sm:py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="PLANNED">Planned</option>
            <option value="EXECUTED">Executed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Trade Attributes */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Trade Attributes
        </h4>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
          {Object.entries(plan.attributes).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <span
                className={`w-4 h-4 flex items-center justify-center text-xs mr-2 ${
                  value
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {value ? "✓" : "×"}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Quality Metrics
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-2">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 block sm:inline">
              Float:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-0 sm:ml-2">
              {plan.quality.float || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 block sm:inline">
              Support Area:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-0 sm:ml-2">
              {plan.quality.supportArea || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 block sm:inline">
              Catalyst Rating:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-0 sm:ml-2">
              {plan.quality.catalystRating || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Setup Grade */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Setup Grade
        </h4>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {plan.setup.setupGrade || "N/A"}
        </div>
      </div>

      {/* Execution Plan */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Execution Plan
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-2">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 block sm:inline">
              Entry:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-0 sm:ml-2">
              ${plan.execution.entry || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 block sm:inline">
              Profit Target:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-0 sm:ml-2">
              ${plan.execution.profitTarget || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 block sm:inline">
              Stop Loss:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-0 sm:ml-2">
              ${plan.execution.stopLoss || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {plan.notes && (
        <div className="col-span-1 sm:col-span-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Notes
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {plan.notes}
          </p>
        </div>
      )}

      {/* Timestamps */}
      <div
        className="col-span-1 sm:col-span-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 
      flex flex-col sm:flex-row justify-between text-xs text-gray-500 dark:text-gray-400 gap-2 sm:gap-0"
      >
        <span>Created: {new Date(plan.createdAt).toLocaleString()}</span>
        <span>Last Updated: {new Date(plan.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default TradePlanDetails;
