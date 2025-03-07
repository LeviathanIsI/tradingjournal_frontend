import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const TradePlanList = ({
  tradePlans,
  handleStatusChange,
  handleEdit,
  handleDelete,
}) => {
  return (
    <div className="space-y-4">
      {tradePlans.map((plan) => (
        <div
          key={plan._id}
          className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 space-y-3 border border-gray-200 dark:border-gray-600/50"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {plan.ticker}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(plan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(plan)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(plan._id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Direction</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {plan.direction}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Entry</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {plan.execution?.entry ? `$${plan.execution.entry}` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Profit Target</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {plan.execution?.profitTarget
                  ? `$${plan.execution.profitTarget}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Stop Loss</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {plan.execution?.stopLoss
                  ? `$${plan.execution.stopLoss}`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <select
              value={plan.status}
              onChange={(e) => handleStatusChange(plan._id, e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600/70 rounded-sm 
              bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-200"
            >
              <option value="PLANNED">Planned</option>
              <option value="EXECUTED">Executed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TradePlanList;
