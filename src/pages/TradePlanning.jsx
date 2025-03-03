import React, { useState } from "react";
import {
  Plus,
  List,
  FileText,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
} from "lucide-react";
import TradePlanModal from "../components/TradePlanModal";
import { useTradePlans } from "../hooks/useTradePlans";
import { useAuth } from "../context/AuthContext";

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
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const { user, loading: authLoading } = useAuth();

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-700/60">
        <div className="animate-pulse text-lg text-gray-900 dark:text-gray-100">
          Loading...
        </div>
      </div>
    );
  }

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

  const handleStatusChange = async (id, newStatus) => {
    await updateTradePlan(id, { status: newStatus });
  };

  const toggleExpand = (planId) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const renderExpandedDetails = (plan) => (
    <tr key={`${plan._id}-details`} className="bg-gray-50 dark:bg-gray-600/30">
      <td colSpan="9" className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Analysis
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {plan.analysis || "No analysis provided"}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Notes
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {plan.notes || "No notes provided"}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );

  const renderMobileView = () => (
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
                onClick={() => {
                  setSelectedPlan(plan);
                  setIsModalOpen(true);
                }}
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

  const renderDesktopView = () => (
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
              // Use React.Fragment with a key instead of empty fragment
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
                          setSelectedPlan(plan);
                          setIsModalOpen(true);
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

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Trade Planning
        </h1>
        <button
          onClick={handleNewPlan}
          className="inline-flex items-center px-4 py-2 bg-blue-500 dark:bg-blue-500/90 text-white rounded-sm 
          hover:bg-blue-600 dark:hover:bg-blue-500 shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          New Plan
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
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
      )}

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-50 dark:bg-red-700/30 border border-red-100 dark:border-red-600/50 
        text-red-700 dark:text-red-300 p-3 rounded-sm mb-6"
        >
          {error}
        </div>
      )}

      {/* Mobile view */}
      <div className="sm:hidden">{renderMobileView()}</div>

      {/* Desktop view */}
      <div className="hidden sm:block">{renderDesktopView()}</div>

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
