// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TradeModal from "../components/TradeModal";
import OptionTradeModal from "../components/OptionTradeModal";
import { useTrades } from "../hooks/useTrades";
import { useAuth } from "../context/AuthContext";
import ReviewModal from "../components/ReviewModal";
import ImportTradeModal from "../components/ImportTradeModal";
import DashboardNav from "../components/DashboardNav";
import { formatInTimeZone } from "date-fns-tz";
import Overview from "../components/Overview";
import TradeJournal from "../components/TradeJournal";
import Analysis from "../components/Analysis";
import Planning from "../components/Planning";
import StatsOverview from "../components/StatsOverview";
import AIInsights from "../pages/AIInsights";
import WeeklyReview from "../components/WeeklyReview";
import { useToast } from "../context/ToastContext";

const Dashboard = () => {
  const { user, checkSubscriptionStatus, loading: authLoading } = useAuth();
  const userTimeZone = user?.preferences?.timeZone || "UTC";
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isOptionTradeModalOpen, setIsOptionTradeModalOpen] = useState(false);
  const [selectedOptionTrade, setSelectedOptionTrade] = useState(null);
  const [activeChart, setActiveChart] = useState("pnl");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTradeForReview, setSelectedTradeForReview] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState(new Set());
  const [bulkDeleteError, setBulkDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Get all trade-related functions from the hook
  const {
    trades: allTrades,
    stats,
    error,
    loading: dataLoading,
    deleteTrade,
    submitTrade,
    bulkDeleteTrades,
    submitTradeReview,
    importTrades,
    fetchTradesForWeek,
    analyzeTradesForWeek,
  } = useTrades(user);

  // UI-specific handler functions that call the hook functions
  const handleEditClick = (trade) => {
    if (trade.contractType) {
      setSelectedOptionTrade(trade);
      setIsOptionTradeModalOpen(true);
    } else {
      setSelectedTrade(trade);
      setIsTradeModalOpen(true);
    }
  };

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

  const handleBulkDelete = async () => {
    if (selectedTrades.size === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedTrades.size} trades?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setBulkDeleteError(null);

    const result = await bulkDeleteTrades(selectedTrades);

    if (result.success) {
      setSelectedTrades(new Set());
      showToast(
        `Successfully deleted ${selectedTrades.size} trades`,
        "success"
      );
    } else {
      setBulkDeleteError(
        result.error || "Failed to delete trades. Please try again."
      );
    }

    setIsDeleting(false);
  };

  const handleTradeSubmit = async (tradeData) => {
    try {
      const success = await submitTrade(tradeData, selectedTrade);

      if (success) {
        setIsTradeModalOpen(false);
        setSelectedTrade(null);
        showToast("Trade saved successfully", "success");
      } else {
        showToast("Failed to save trade", "error");
      }
    } catch (error) {
      console.error("Error saving trade:", error);
      showToast(error.message || "Failed to save trade", "error");
    }
  };

  const handleOptionTradeSubmit = async (tradeData) => {
    try {
      const success = await submitTrade(tradeData, selectedOptionTrade);

      if (success) {
        setIsOptionTradeModalOpen(false);
        setSelectedOptionTrade(null);
        showToast("Option trade saved successfully", "success");
      } else {
        showToast("Failed to save option trade", "error");
      }
    } catch (error) {
      console.error("Error saving option trade:", error);
      showToast(error.message || "Failed to save option trade", "error");
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    const success = await submitTradeReview(reviewData);

    if (success) {
      setIsReviewModalOpen(false);
      setSelectedTradeForReview(null);
      showToast("Review submitted successfully", "success");
    } else {
      showToast("Failed to submit review", "error");
    }
  };

  const handleImportTrades = async (trades) => {
    const success = await importTrades(trades);

    if (success) {
      setIsImportModalOpen(false);
      showToast("Trades imported successfully", "success");
    } else {
      showToast("Failed to import trades", "error");
    }
  };

  useEffect(() => {
    const checkStripeSuccess = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get("success") === "true") {
        try {
          await checkSubscriptionStatus();
          showToast("Subscription activated successfully!", "success");
          window.history.replaceState({}, "", "/dashboard");
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking subscription status:", error);
          showToast(
            "Error verifying subscription. Please refresh the page.",
            "error"
          );
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    checkStripeSuccess();
  }, [checkSubscriptionStatus, showToast]);

  const handleAddTradeClick = () => {
    setSelectedTrade(null);
    setIsTradeModalOpen(true);
  };

  const handleAddOptionTradeClick = () => {
    setSelectedOptionTrade(null);
    setIsOptionTradeModalOpen(true);
  };

  const handleSelectTrade = (tradeId) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedTrades(newSelected);
  };

  const handleSelectAll = (currentTrades) => {
    const areAllSelected = currentTrades.every((trade) =>
      selectedTrades.has(trade._id)
    );

    if (areAllSelected) {
      const newSelected = new Set(selectedTrades);
      currentTrades.forEach((trade) => newSelected.delete(trade._id));
      setSelectedTrades(newSelected);
    } else {
      const newSelected = new Set(selectedTrades);
      currentTrades.forEach((trade) => newSelected.add(trade._id));
      setSelectedTrades(newSelected);
    }
  };

  // Utility functions
  const formatCurrency = (value, maxDecimals = 2) => {
    if (!value && value !== 0) return "-";

    // Convert to string and remove any existing formatting
    const numStr = Math.abs(value).toString();

    // Find the number of actual decimal places
    const decimalPlaces = numStr.includes(".")
      ? numStr.split(".")[1].replace(/0+$/, "").length // Remove trailing zeros
      : 0;

    // Use the smaller of actual decimal places or maxDecimals
    const decimals = Math.min(decimalPlaces, maxDecimals);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return formatInTimeZone(
      new Date(dateString),
      userTimeZone,
      "MM/dd/yyyy hh:mm a"
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen pt-16 px-3 sm:px-6 py-3 sm:py-6 flex items-center justify-center text-red-600 dark:text-red-400">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-sm border border-red-100 dark:border-red-800/50 shadow-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <DashboardNav />
      {/* Stats Overview Section */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-transparent">
        <StatsOverview
          user={user}
          stats={stats}
          formatCurrency={formatCurrency}
        />
      </div>
      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="" element={<Navigate to="overview" replace />} />
          {[
            {
              path: "overview",
              element: (
                <Overview
                  trades={allTrades}
                  stats={stats}
                  formatCurrency={formatCurrency}
                />
              ),
            },
            {
              path: "journal",
              element: (
                <TradeJournal
                  trades={allTrades}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                  handleSelectTrade={handleSelectTrade}
                  handleSelectAll={handleSelectAll}
                  handleBulkDelete={handleBulkDelete}
                  handleAddTradeClick={handleAddTradeClick}
                  handleAddOptionTradeClick={handleAddOptionTradeClick}
                  selectedTrades={selectedTrades}
                  isDeleting={isDeleting}
                  bulkDeleteError={bulkDeleteError}
                  setBulkDeleteError={setBulkDeleteError}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  setSelectedTradeForReview={setSelectedTradeForReview}
                  setIsReviewModalOpen={setIsReviewModalOpen}
                />
              ),
            },
            {
              path: "analysis",
              element: (
                <Analysis
                  trades={allTrades}
                  activeChart={activeChart}
                  setActiveChart={setActiveChart}
                />
              ),
            },
            {
              path: "planning",
              element: (
                <Planning trades={allTrades} user={user} stats={stats} />
              ),
            },
            {
              path: "ai-insights/*",
              element: (
                <AIInsights
                  fetchTradesForWeek={fetchTradesForWeek}
                  analyzeTradesForWeek={analyzeTradesForWeek}
                />
              ),
            },
            {
              path: "weekly-review",
              element: (
                <WeeklyReview
                  trades={allTrades}
                  fetchTradesForWeek={fetchTradesForWeek}
                  analyzeTradesForWeek={analyzeTradesForWeek}
                />
              ),
            },
          ].map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <div className="px-3 sm:px-6 py-3 sm:py-4">{element}</div>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
      {/* Modals */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSubmit={handleTradeSubmit}
        trade={selectedTrade}
        userTimeZone={userTimeZone}
      />
      <OptionTradeModal
        isOpen={isOptionTradeModalOpen}
        onClose={() => {
          setIsOptionTradeModalOpen(false);
          setSelectedOptionTrade(null);
        }}
        onSubmit={handleOptionTradeSubmit}
        trade={selectedOptionTrade}
        userTimeZone={userTimeZone}
      />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedTradeForReview(null);
        }}
        trade={selectedTradeForReview}
        onSubmit={handleReviewSubmit}
      />
      <ImportTradeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportTrades}
      />
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-sm border border-red-100 dark:border-red-800/50 shadow-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
