// src/pages/TradePlanning.jsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
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
      {stats && <TradePlanStats stats={stats} />}

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
      <div className="sm:hidden">
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
