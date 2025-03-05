import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTrades } from "../hooks/useTrades";
import { generateWelcomeMessage } from "../utils/welcomeMessages";

// Dashboard components
import DashboardNav from "../components/Dashboard/DashboardNav";
import {
  DashboardStats,
  DashboardRoutes,
  DashboardModals,
} from "../components/Dashboard";

// Custom hooks
import useModalState from "../hooks/Dashboard/useModalState.js";
import useUIState from "../hooks/Dashboard/useUIState.js";
import useDashboardEffects from "../hooks/Dashboard/useDashboardEffects.js";

// Utility functions
import { formatCurrency } from "../components/Dashboard/utils/formatters";

/**
 * Main Dashboard page component - now significantly leaner
 * with logic extracted to custom hooks and subcomponents
 */
const Dashboard = () => {
  // Get user data and auth state
  const {
    user,
    checkSubscriptionStatus,
    loading: authLoading,
    subscription,
  } = useAuth();
  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);

  const { showToast } = useToast();

  // Dashboard UI state hook
  const {
    selectedTrades,
    hasSelectedTrades,
    activeChart,
    setActiveChart,
    bulkDeleteError,
    isDeleting,
    setBulkDeleteStatus,
    handleSelectTrade,
    handleSelectAll,
    clearSelectedTrades,
  } = useUIState();

  // Modal management hook
  const {
    isTradeModalOpen,
    selectedTrade,
    isOptionTradeModalOpen,
    selectedOptionTrade,
    isReviewModalOpen,
    selectedTradeForReview,
    isImportModalOpen,
    openTradeModal,
    openOptionTradeModal,
    openReviewModal,
    openImportModal,
    closeTradeModal,
    closeOptionTradeModal,
    closeReviewModal,
    closeImportModal,
    handleEditClick,
  } = useModalState();

  // Dashboard effects hook
  const { isLoading, setIsLoading } = useDashboardEffects(
    checkSubscriptionStatus,
    user
  );

  // Get trades and trade functions from the hook
  const {
    trades: allTrades,
    stats,
    error: tradesError,
    loading: tradesLoading,
    deleteTrade,
    submitTrade,
    bulkDeleteTrades,
    submitTradeReview,
    importTrades,
    fetchTradesForWeek,
    analyzeTradesForWeek,
  } = useTrades(user);

  // Set up user timezone from preferences
  const userTimeZone = user?.preferences?.timeZone || "UTC";

  useEffect(() => {
    // Read the flag from sessionStorage
    const shouldShowWelcome = sessionStorage.getItem("showWelcome") === "true";

    // Clear the flag immediately to prevent showing on refresh
    if (shouldShowWelcome) {
      sessionStorage.removeItem("showWelcome");
    }

    // Only show if flag was true and we haven't shown it yet
    if (shouldShowWelcome && !welcomeMessageShown && user) {
      // Add a delay to ensure dashboard is visible first
      const timer = setTimeout(() => {
        try {
          const timezone = user.preferences?.timeZone || "UTC";
          const welcomeMessage = generateWelcomeMessage(
            user.username,
            timezone
          );
          showToast(welcomeMessage, "welcome", false);
          setWelcomeMessageShown(true);
        } catch (e) {
          console.error("Error showing welcome message:", e);
        }
      }, 1000); // Increased delay for reliability

      return () => clearTimeout(timer);
    }
  }, [user, welcomeMessageShown, showToast]);

  // Handler for deleting a single trade
  const handleDeleteClick = async (trade) => {
    if (!trade || !trade._id) {
      console.error("❌ Trade or Trade ID is missing!");
      return;
    }

    const isOptionTrade = trade.contractType !== undefined;

    if (
      window.confirm(
        `Are you sure you want to delete this ${
          isOptionTrade ? "option" : "regular"
        } trade?`
      )
    ) {
      const success = await deleteTrade(trade._id, isOptionTrade);

      if (success) {
        showToast("Trade deleted successfully", "success");
      } else {
        showToast(
          `Failed to delete ${isOptionTrade ? "option" : "regular"} trade`,
          "error"
        );
      }
    }
  };

  // Handler for bulk deleting trades
  const handleBulkDelete = async () => {
    if (selectedTrades.size === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedTrades.size} trades?`
      )
    ) {
      return;
    }

    setBulkDeleteStatus(true, null);

    const result = await bulkDeleteTrades(selectedTrades);

    if (result.success) {
      clearSelectedTrades();
      showToast(
        `Successfully deleted ${selectedTrades.size} trades`,
        "success"
      );
    } else {
      setBulkDeleteStatus(
        false,
        result.error || "Failed to delete trades. Please try again."
      );
    }

    setBulkDeleteStatus(false, null);
  };

  // Handler for submitting a trade
  const handleTradeSubmit = async (tradeData) => {
    try {
      const success = await submitTrade(tradeData, selectedTrade);

      if (success) {
        closeTradeModal();
        showToast("Trade saved successfully", "success");
      } else {
        showToast("Failed to save trade", "error");
      }
    } catch (error) {
      console.error("Error saving trade:", error);
      showToast(error.message || "Failed to save trade", "error");
    }
  };

  // Handler for submitting an option trade
  const handleOptionTradeSubmit = async (tradeData) => {
    try {
      const success = await submitTrade(tradeData, selectedOptionTrade);

      if (success) {
        closeOptionTradeModal();
        showToast("Option trade saved successfully", "success");
      } else {
        showToast("Failed to save option trade", "error");
      }
    } catch (error) {
      console.error("Error saving option trade:", error);
      showToast(error.message || "Failed to save option trade", "error");
    }
  };

  // Handler for submitting a trade review
  const handleReviewSubmit = async (reviewData) => {
    const success = await submitTradeReview(reviewData);

    if (success) {
      closeReviewModal();
      showToast("Review submitted successfully", "success");
    } else {
      showToast("Failed to submit review", "error");
    }
  };

  // Handler for importing trades
  const handleImportTrades = async (trades) => {
    const success = await importTrades(trades);

    if (success) {
      closeImportModal();
      showToast("Trades imported successfully", "success");
    } else {
      showToast("Failed to import trades", "error");
    }
  };

  // Loading state
  if (authLoading || isLoading || tradesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Error state
  if (tradesError) {
    return (
      <div className="w-full min-h-screen pt-16 px-3 sm:px-6 py-3 sm:py-6 flex items-center justify-center text-red-600 dark:text-red-400">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-sm border border-red-100 dark:border-red-800/50 shadow-sm">
          Error: {tradesError}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Navigation */}
      <DashboardNav />

      {/* Stats Overview */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 mt-4 bg-transparent">
        <DashboardStats user={user} stats={stats} />
      </div>

      {/* Main Content with Routes */}
      <div className="flex-1">
        <DashboardRoutes
          user={user}
          trades={allTrades}
          stats={stats}
          activeChart={activeChart}
          setActiveChart={setActiveChart}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onSelectTrade={handleSelectTrade}
          onSelectAll={handleSelectAll}
          onBulkDelete={handleBulkDelete}
          onAddTradeClick={() => openTradeModal()}
          onAddOptionTradeClick={() => openOptionTradeModal()}
          onOpenReviewModal={openReviewModal}
          selectedTrades={selectedTrades}
          isDeleting={isDeleting}
          bulkDeleteError={bulkDeleteError}
          setBulkDeleteError={(error) => setBulkDeleteStatus(isDeleting, error)}
          fetchTradesForWeek={fetchTradesForWeek}
          analyzeTradesForWeek={analyzeTradesForWeek}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Modals */}
      <DashboardModals
        isTradeModalOpen={isTradeModalOpen}
        selectedTrade={selectedTrade}
        isOptionTradeModalOpen={isOptionTradeModalOpen}
        selectedOptionTrade={selectedOptionTrade}
        isReviewModalOpen={isReviewModalOpen}
        selectedTradeForReview={selectedTradeForReview}
        isImportModalOpen={isImportModalOpen}
        onTradeModalClose={closeTradeModal}
        onOptionTradeModalClose={closeOptionTradeModal}
        onReviewModalClose={closeReviewModal}
        onImportModalClose={closeImportModal}
        onTradeSubmit={handleTradeSubmit}
        onOptionTradeSubmit={handleOptionTradeSubmit}
        onReviewSubmit={handleReviewSubmit}
        onImportTrades={handleImportTrades}
        userTimeZone={userTimeZone}
      />
    </div>
  );
};

export default Dashboard;
