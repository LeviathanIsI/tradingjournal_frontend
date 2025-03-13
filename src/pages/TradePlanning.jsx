// src/pages/TradePlanning.jsx
import React, { useState } from "react";
import { Plus, ClipboardList, BarChart2, AlertTriangle } from "lucide-react";
import { useTradePlans } from "../hooks/useTradePlans";
import { useAuth } from "../context/AuthContext";
import {
  TradePlanModal,
  TradePlanStats,
  TradePlanTable,
  TradePlanList,
} from "../components/TradePlanning";

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white/90 dark:bg-gray-800/80 p-6 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm">
          <div className="animate-pulse flex flex-col items-center space-y-3">
            <div className="h-8 w-8 bg-primary/40 dark:bg-primary/30 rounded-full"></div>
            <div className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNewPlan = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
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
    <tr
      key={`${plan._id}-details`}
      className="bg-white dark:bg-gray-800/40 border-t border-b border-gray-200 dark:border-gray-700/40"
    >
      <td colSpan="9" className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200/70 dark:border-gray-600/30">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              <div className="h-1 w-4 bg-primary rounded-full mr-2"></div>
              Analysis
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
              {plan.analysis || "No analysis provided"}
            </p>
          </div>
          <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200/70 dark:border-gray-600/30">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              <div className="h-1 w-4 bg-secondary rounded-full mr-2"></div>
              Notes
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
              {plan.notes || "No notes provided"}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <ClipboardList className="h-6 w-6 text-primary mr-2" />
              Trade Planning
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Plan your trades, trade your plan
            </p>
          </div>
          <button
            onClick={handleNewPlan}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md 
            shadow hover:shadow-md transition-all"
          >
            <Plus size={18} className="mr-2" />
            New Plan
          </button>
        </div>

        {/* Feature Info Card */}
        <div className="bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-700/30 dark:to-gray-600/20 p-4 rounded-lg border border-gray-200 dark:border-gray-600/50 shadow-sm backdrop-blur-sm mb-6">
          <div className="flex items-start gap-3">
            <BarChart2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                Trade Planning Features:
              </p>
              <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/80"></div>
                  Create detailed plans before entering trades
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/80"></div>
                  Track your plan execution and results
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/80"></div>
                  Analyze patterns in your successful plans
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="mb-6">
            <TradePlanStats stats={stats} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white/90 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm">
          {/* Mobile view */}
          <div className="sm:hidden p-4">
            <TradePlanList
              tradePlans={tradePlans}
              handleStatusChange={handleStatusChange}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block">
            <TradePlanTable
              tradePlans={tradePlans}
              expandedPlanId={expandedPlanId}
              toggleExpand={toggleExpand}
              handleStatusChange={handleStatusChange}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              renderExpandedDetails={renderExpandedDetails}
            />
          </div>
        </div>

        {/* Modal */}
        <TradePlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          plan={selectedPlan}
        />
      </div>
    </div>
  );
};

export default TradePlanning;
