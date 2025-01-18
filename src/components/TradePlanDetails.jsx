// src/components/TradePlanDetails.jsx
import { X } from "lucide-react";

const TradePlanDetails = ({ isOpen, onClose, plan, onStatusChange }) => {
  if (!isOpen || !plan) return null;

  const handleStatusChange = (e) => {
    onStatusChange(plan._id, e.target.value);
  };

  return (
    <div className="px-6 py-4 grid grid-cols-2 gap-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">{plan.ticker}</h3>
        <p className="text-sm text-gray-600">{plan.direction}</p>
        <div className="mt-2 flex justify-between items-center">
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              plan.status === "EXECUTED"
                ? "bg-green-100 text-green-800"
                : plan.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {plan.status}
          </span>
          <select
            value={plan.status}
            onChange={handleStatusChange}
            className="px-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700"
          >
            <option value="PLANNED">Planned</option>
            <option value="EXECUTED">Executed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Trade Attributes */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">
          Trade Attributes
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(plan.attributes).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <span
                className={`w-4 h-4 flex items-center justify-center text-xs mr-2 ${
                  value ? "text-green-600" : "text-gray-400"
                }`}
              >
                {value ? "✓" : "×"}
              </span>
              <span className="text-sm text-gray-600">
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
        <h4 className="text-sm font-semibold text-gray-700">Quality Metrics</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-sm text-gray-600">Float:</span>
            <span className="text-sm font-medium">
              {plan.quality.float || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Support Area:</span>
            <span className="text-sm font-medium">
              {plan.quality.supportArea || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Catalyst Rating:</span>
            <span className="text-sm font-medium">
              {plan.quality.catalystRating || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Setup Grade */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700">Setup Grade</h4>
        <div className="text-sm font-medium">
          {plan.setup.setupGrade || "N/A"}
        </div>
      </div>

      {/* Execution Plan */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Execution Plan</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-sm text-gray-600">Entry:</span>
            <span className="text-sm font-medium">
              ${plan.execution.entry || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Profit Target:</span>
            <span className="text-sm font-medium">
              ${plan.execution.profitTarget || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Stop Loss:</span>
            <span className="text-sm font-medium">
              ${plan.execution.stopLoss || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {plan.notes && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
          <p className="text-sm text-gray-600">{plan.notes}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="col-span-2 mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <span>Created: {new Date(plan.createdAt).toLocaleString()}</span>
        <span>Last Updated: {new Date(plan.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default TradePlanDetails;
