// src/components/TradePlanDetails.jsx
import {
  X,
  FileEdit, // Replaced PlaneLine with FileEdit in the imports
  Check,
  AlertTriangle,
  Clipboard,
  Calendar,
  ChevronDown,
} from "lucide-react";

const TradePlanDetails = ({ isOpen, onClose, plan, onStatusChange }) => {
  if (!isOpen || !plan) return null;

  const handleStatusChange = (e) => {
    onStatusChange(plan._id, e.target.value);
  };

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

  // Prepare attribute display names
  const attributeDisplayNames = {
    lowFloat: "Low Float",
    upMoreThan10Percent: "Up more than 10%",
    unusualVolume: "Unusual Volume",
    formerRunner: "Former Runner",
    hasCatalyst: "Has Catalyst",
    wholeHalfDollarBreak: "Whole/Half $ Break",
    clearSupport: "Clear Support",
  };

  const getGradeColor = (grade) => {
    if (!grade)
      return "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400";
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100/90 dark:bg-green-800/30 text-green-800 dark:text-green-300";
      case "B":
        return "bg-blue-100/90 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300";
      case "C":
        return "bg-yellow-100/90 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300";
      case "D":
      case "F":
        return "bg-red-100/90 dark:bg-red-800/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-lg p-6 space-y-6">
      {/* Header with Ticker and Direction */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {plan.ticker}
            </h2>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-md ${getStatusStyles(
                plan.status
              )}`}
            >
              {plan.status}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex items-center">
            <FileEdit className="h-4 w-4 mr-1.5 text-primary/70 dark:text-primary-light/70" />
            {plan.direction} Strategy
          </div>
        </div>

        <div className="relative">
          <select
            value={plan.status}
            onChange={handleStatusChange}
            className="pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600/70 rounded-md
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

      {/* Two-column layout for details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Trade Attributes */}
        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200/70 dark:border-gray-600/40">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <Check className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
            Trade Attributes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(plan.attributes).map(([key, value]) => (
              <div key={key} className="flex items-center p-1.5 rounded-md">
                <div
                  className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center 
                  ${
                    value
                      ? "bg-green-100/80 dark:bg-green-800/30"
                      : "bg-gray-100/80 dark:bg-gray-600/30"
                  }`}
                >
                  {value ? (
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {attributeDisplayNames[key] || key}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality and Setup */}
        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200/70 dark:border-gray-600/40">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
            Quality & Setup
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Float
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {plan.quality.float || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Support Area
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {plan.quality.supportArea || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Catalyst Rating
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {plan.quality.catalystRating
                  ? `${plan.quality.catalystRating}/10`
                  : "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Setup Grade
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${getGradeColor(
                  plan.setup.setupGrade
                )}`}
              >
                {plan.setup.setupGrade || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Plan */}
      <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200/70 dark:border-gray-600/40">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
          <FileEdit className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
          Execution Plan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-white/80 dark:bg-gray-800/40 rounded-md border border-gray-200/60 dark:border-gray-600/30">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Entry Price
            </div>
            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
              {plan.execution.entry
                ? `$${plan.execution.entry.toFixed(2)}`
                : "—"}
            </div>
          </div>

          <div className="p-3 bg-white/80 dark:bg-gray-800/40 rounded-md border border-gray-200/60 dark:border-gray-600/30">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Profit Target
            </div>
            <div className="text-base font-medium text-green-600 dark:text-green-400">
              {plan.execution.profitTarget
                ? `$${plan.execution.profitTarget.toFixed(2)}`
                : "—"}
            </div>
          </div>

          <div className="p-3 bg-white/80 dark:bg-gray-800/40 rounded-md border border-gray-200/60 dark:border-gray-600/30">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Stop Loss
            </div>
            <div className="text-base font-medium text-red-600 dark:text-red-400">
              {plan.execution.stopLoss
                ? `$${plan.execution.stopLoss.toFixed(2)}`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {plan.notes && (
        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200/70 dark:border-gray-600/40">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <Clipboard className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
            Notes
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {plan.notes}
          </p>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700/40 flex flex-col sm:flex-row justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
        <div className="flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
          <span>Created: {new Date(plan.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
          <span>Last Updated: {new Date(plan.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TradePlanDetails;
