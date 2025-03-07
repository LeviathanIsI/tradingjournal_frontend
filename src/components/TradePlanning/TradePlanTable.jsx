import React from "react";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const TradePlanTable = ({
  tradePlans,
  expandedPlanId,
  toggleExpand,
  handleStatusChange,
  handleEdit,
  handleDelete,
  renderExpandedDetails,
}) => {
  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm border border-gray-200 dark:border-gray-600/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-600/30 border-b border-gray-200 dark:border-gray-600/50">
              <th className="w-8"></th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Symbol
              </th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Direction
              </th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Entry
              </th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Profit Target
              </th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Stop Loss
              </th>
              <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tradePlans.map((plan) => (
              <React.Fragment key={plan._id}>
                <tr
                  className="border-b border-gray-200 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-600/30 cursor-pointer"
                  onClick={() => toggleExpand(plan._id)}
                >
                  <td className="py-3 px-2 text-gray-500 dark:text-gray-400">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded-sm">
                      {expandedPlanId === plan._id ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {plan.ticker}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {plan.direction}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {plan.execution?.entry ? `$${plan.execution.entry}` : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {plan.execution?.profitTarget
                      ? `$${plan.execution.profitTarget}`
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {plan.execution?.stopLoss
                      ? `$${plan.execution.stopLoss}`
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={plan.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(plan._id, e.target.value);
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600/70 rounded-sm 
                      bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-200"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="EXECUTED">Executed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(plan);
                        }}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(plan._id);
                        }}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedPlanId === plan._id && renderExpandedDetails(plan)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradePlanTable;
