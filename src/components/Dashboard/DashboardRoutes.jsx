// components/Dashboard/DashboardRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Component imports
import Overview from "./Overview";
import TradeJournal from "./TradeJournal";
import Analysis from "./Analysis";
import Planning from "./Planning";
import AIInsights from "../../pages/AIInsights";
import WeeklyReview from "./WeeklyReview";

// Custom component imports
import PremiumRouteGuard from "./PremiumRouteGuard";

// Utility imports
import { formatDate } from "./utils/formatters";

/**
 * Component to manage all dashboard routes
 *
 * Centralizes route definitions and premium route protection
 */
const DashboardRoutes = ({
  // User and trade data
  user,
  trades,
  stats,

  // Chart state
  activeChart,
  setActiveChart,

  // Trade action handlers
  onEditClick,
  onDeleteClick,
  onSelectTrade,
  onSelectAll,
  onBulkDelete,
  onAddTradeClick,
  onAddOptionTradeClick,
  selectedTrades,
  isDeleting,
  bulkDeleteError,
  setBulkDeleteError,

  // Review handlers
  onOpenReviewModal,

  // Trade data handlers
  fetchTradesForWeek,
  analyzeTradesForWeek,

  // Format helpers
  formatCurrency,
}) => {
  // User timezone for date formatting
  const userTimeZone = user?.preferences?.timeZone || "UTC";

  // Create formatDate function with user timezone
  const formatDateWithTz = (dateString, format) =>
    formatDate(dateString, userTimeZone, format);

  return (
    <Routes>
      <Route path="" element={<Navigate to="overview" replace />} />

      {/* Free routes available to all users */}
      <Route
        path="overview"
        element={
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <Overview
              trades={trades}
              stats={stats}
              formatCurrency={formatCurrency}
            />
          </div>
        }
      />

      <Route
        path="journal"
        element={
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <TradeJournal
              trades={trades}
              handleEditClick={onEditClick}
              handleDeleteClick={onDeleteClick}
              handleSelectTrade={onSelectTrade}
              handleSelectAll={onSelectAll}
              handleBulkDelete={onBulkDelete}
              handleAddTradeClick={onAddTradeClick}
              handleAddOptionTradeClick={onAddOptionTradeClick}
              selectedTrades={selectedTrades}
              isDeleting={isDeleting}
              bulkDeleteError={bulkDeleteError}
              setBulkDeleteError={setBulkDeleteError}
              formatDate={formatDateWithTz}
              formatCurrency={formatCurrency}
              setSelectedTradeForReview={onOpenReviewModal}
              setIsReviewModalOpen={() => {}} // This is now handled by onOpenReviewModal
            />
          </div>
        }
      />

      <Route
        path="analysis"
        element={
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <Analysis
              trades={trades}
              activeChart={activeChart}
              setActiveChart={setActiveChart}
            />
          </div>
        }
      />

      {/* Protected premium routes */}
      <Route
        path="planning"
        element={
          <PremiumRouteGuard>
            <div className="px-3 sm:px-6 py-3 sm:py-4">
              <Planning trades={trades} user={user} stats={stats} />
            </div>
          </PremiumRouteGuard>
        }
      />

      <Route
        path="ai-insights/*"
        element={
          <PremiumRouteGuard>
            <div className="px-3 sm:px-6 py-3 sm:py-4">
              <AIInsights
                fetchTradesForWeek={fetchTradesForWeek}
                analyzeTradesForWeek={analyzeTradesForWeek}
              />
            </div>
          </PremiumRouteGuard>
        }
      />

      <Route
        path="weekly-review"
        element={
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <WeeklyReview
              trades={trades}
              fetchTradesForWeek={fetchTradesForWeek}
              analyzeTradesForWeek={analyzeTradesForWeek}
            />
          </div>
        }
      />

      <Route path="*" element={<Navigate to="overview" replace />} />
    </Routes>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(DashboardRoutes);
