// src/pages/TradePlanning.jsx
import React, { useState } from "react";
import {
  Plus,
  List,
  FileText,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import TradePlanModal from "../components/TradePlanModal";
import { useTradePlans } from "../hooks/useTradePlans";

const TradePlanning = () => {
  const {
    tradePlans,
    stats,
    loading,
    error,
    addTradePlan,
    updateTradePlan,
    deleteTradePlan,
  } = useTradePlans();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [view, setView] = useState("list");
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  const handleNewPlan = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    let success;
    if (selectedPlan) {
      success = await updateTradePlan(selectedPlan._id, formData);
    } else {
      success = await addTradePlan(formData);
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trade plan?")) {
      await deleteTradePlan(id);
    }
  };

  const handleStatusChange = async (planId, newStatus) => {
    await updateTradePlan(planId, { status: newStatus });
  };

  const renderListView = () => (
    <table className="min-w-full">
      <thead>
        <tr className="border-b">
          <th className="w-8"></th>
          <th className="text-left py-3 px-4 text-gray-500">Date</th>
          <th className="text-left py-3 px-4 text-gray-500">Symbol</th>
          <th className="text-left py-3 px-4 text-gray-500">Direction</th>
          <th className="text-left py-3 px-4 text-gray-500">Entry</th>
          <th className="text-left py-3 px-4 text-gray-500">Profit Target</th>
          <th className="text-left py-3 px-4 text-gray-500">Stop Loss</th>
          <th className="text-center py-3 px-4 text-gray-500">Status</th>
          <th className="text-right py-3 px-4 text-gray-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tradePlans.map((plan) => (
          <React.Fragment key={plan._id}>
            <tr
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                setExpandedPlanId(expandedPlanId === plan._id ? null : plan._id)
              }
            >
              <td className="py-3 px-2 text-gray-500">
                {expandedPlanId === plan._id ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </td>
              <td className="py-3 px-4 text-gray-900">
                {new Date(plan.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-gray-900">{plan.ticker}</td>
              <td className="py-3 px-4 text-gray-900">{plan.direction}</td>
              <td className="py-3 px-4 text-gray-900">
                {plan.execution?.entry ? `$${plan.execution.entry}` : "N/A"}
              </td>
              <td className="py-3 px-4 text-gray-900">
                {plan.execution?.profitTarget ? `$${plan.execution.profitTarget}` : "N/A"}
              </td>
              <td className="py-3 px-4 text-gray-900">
                {plan.execution?.stopLoss ? `$${plan.execution.stopLoss}` : "N/A"}
              </td>
              <td className="py-3 px-4 text-center">
                <select
                  value={plan.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(plan._id, e.target.value);
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="EXECUTED">Executed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </td>
              <td
                className="py-3 px-4 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 bg-white rounded border border-gray-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="p-1 text-red-600 hover:bg-red-50 bg-white rounded border border-gray-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
            {expandedPlanId === plan._id && (
              <tr className="bg-gray-50">
                <td colSpan="9">
                  <div className="px-4 py-3 grid grid-cols-3 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-3">
                      {/* Trade Attributes */}
                      <h4 className="font-medium text-gray-900">
                        Trade Attributes
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(plan.attributes).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <span
                              className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${
                                value ? "text-green-600" : "text-gray-400"
                              }`}
                            >
                              {value ? "✓" : "×"}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-3">
                      {/* Quality Metrics */}
                      <h4 className="font-medium text-gray-900">
                        Quality Metrics
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Float:</span>
                          <span className="text-gray-900">
                            {plan.quality?.float || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Support Area:</span>
                          <span className="text-gray-900">
                            {plan.quality?.supportArea || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Catalyst Rating:
                          </span>
                          <span className="text-gray-900">
                            {plan.quality?.catalystRating || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Setup Grade:</span>
                          <span className="text-gray-900">
                            {plan.setup?.setupGrade || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-3">
                      {/* Execution Plan */}
                      <h4 className="font-medium text-gray-900">
                        Execution Plan
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Entry:</span>
                          <span className="text-gray-900">
                            ${plan.execution?.entry || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Profit Target:</span>
                          <span className="text-gray-900">
                            ${plan.execution?.profitTarget || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stop Loss:</span>
                          <span className="text-gray-900">
                            ${plan.execution?.stopLoss || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {plan.notes && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Notes
                          </h4>
                          <p className="text-sm text-gray-600">{plan.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tradePlans.map(
        (plan) =>
          console.log("plan:", plan) || (
            <div
              key={plan._id}
              className="border rounded-lg p-4 hover:shadow-md bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{plan.ticker}</h3>
                  <p className="text-sm text-gray-500">{plan.direction}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <select
                  value={plan.status}
                  onChange={(e) => handleStatusChange(plan._id, e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="EXECUTED">Executed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Entry:</span>
                    <p className="font-medium text-gray-900">
                      {plan.execution && plan.execution.entry !== undefined
                        ? `$${plan.execution.entry}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Profit Target:</span>
                    <p className="font-medium text-gray-900">
                      {plan.execution &&
                      plan.execution.profitTarget !== undefined
                        ? `$${plan.execution.profitTarget}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Stop Loss:</span>
                    <p className="font-medium text-gray-900">
                      {plan.execution && plan.execution.stopLoss !== undefined
                        ? `$${plan.execution.stopLoss}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsModalOpen(true);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 bg-white rounded border border-gray-200"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-1 text-red-600 hover:bg-red-50 bg-white rounded border border-gray-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trade Planning</h1>
        <div className="flex items-center space-x-4">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-l-lg ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-r-lg border-l border-gray-300 ${
                view === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileText size={20} />
            </button>
          </div>
          <button
            onClick={handleNewPlan}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Plan
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Plans</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {stats?.totalPlans || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Executed Plans</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {stats?.executedPlans || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {stats?.successfulPlans
              ? ((stats.successfulPlans / stats.executedPlans) * 100).toFixed(1)
              : "0"}
            %
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg R:R Ratio</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {stats?.averageRR?.toFixed(2) || "0:0"}
          </p>
        </div>
      </div>

      {/* Plans List/Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Plans</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : tradePlans?.length > 0 ? (
            view === "list" ? (
              renderListView()
            ) : (
              renderGridView()
            )
          ) : (
            <div className="text-center text-gray-500 py-8">
              No trade plans yet. Click "New Plan" to create one.
            </div>
          )}
        </div>
      </div>

      <TradePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        plan={selectedPlan}
      />
    </div>
  );
};

export default TradePlanning;
