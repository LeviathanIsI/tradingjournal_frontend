// src/pages/Dashboard.jsx
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Pencil, Trash2, BookOpen, Upload, X } from "lucide-react";
import TradeModal from "../components/TradeModal";
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

const Dashboard = () => {
  const { user } = useAuth();
  const userTimeZone = user?.preferences?.timeZone || "UTC";
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const {
    trades,
    stats,
    loading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    fetchTrades,
    fetchStats,
  } = useTrades();
  const [activeChart, setActiveChart] = useState("pnl");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTradeForReview, setSelectedTradeForReview] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState(new Set());
  const [bulkDeleteError, setBulkDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch("http://localhost:5000/api/trade-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        setIsReviewModalOpen(false);
        setSelectedTradeForReview(null);
        // Optionally show a success message
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      // Optionally show an error message
    }
  };

  const handleSubmit = async (tradeData) => {
    let success;
    if (selectedTrade) {
      // If we have a selectedTrade, we're editing
      success = await updateTrade(selectedTrade._id, tradeData);
    } else {
      // Otherwise, we're adding a new trade
      success = await addTrade(tradeData);
    }

    if (success) {
      setIsTradeModalOpen(false);
      setSelectedTrade(null);
    }
  };

  const handleEditClick = (trade) => {
    setSelectedTrade(trade);
    setIsTradeModalOpen(true);
  };

  const handleDeleteClick = async (tradeId) => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      await deleteTrade(tradeId);
    }
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

    try {
      const response = await fetch(
        "http://localhost:5000/api/trades/bulk-delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            tradeIds: Array.from(selectedTrades),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete trades");
      }

      // Instead of calling deleteTrade for each trade, just refetch everything
      await Promise.all([fetchTrades(), fetchStats()]);
      setSelectedTrades(new Set());
    } catch (err) {
      setBulkDeleteError("Failed to delete trades. Please try again.");
      console.error("Bulk delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    setIsTradeModalOpen(false);
    setSelectedTrade(null);
  };

  const handleAddTradeClick = () => {
    setSelectedTrade(null);
    setIsTradeModalOpen(true);
  };

  const formatDate = (dateString) => {
    return formatInTimeZone(
      new Date(dateString),
      userTimeZone,
      "MM/dd/yyyy hh:mm a"
    );
  };

  if (error) {
    return (
      <div className="w-full p-6 text-red-600 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  const handleImportTrades = async (trades) => {
    const success = await importTrades(trades);
    if (success) {
      setIsImportModalOpen(false);
    }
  };

  return (
    <div className="w-full p-6 text-gray-900 dark:text-gray-100">
      <DashboardNav />
      <div className="p-6 bg-gray-50 dark:bg-gray-800">
        <StatsOverview
          user={user}
          stats={stats}
          formatCurrency={formatCurrency}
        />
      </div>

      <Routes>
        <Route path="" element={<Navigate to="overview" replace />} />
        <Route
          path="overview"
          element={
            <Overview
              trades={trades}
              stats={stats}
              formatCurrency={formatCurrency}
            />
          }
        />
        <Route
          path="journal"
          element={
            <TradeJournal
              trades={trades}
              handleEditClick={handleEditClick}
              handleDeleteClick={handleDeleteClick}
              handleSelectTrade={handleSelectTrade}
              handleSelectAll={handleSelectAll}
              handleBulkDelete={handleBulkDelete}
              handleAddTradeClick={handleAddTradeClick}
              selectedTrades={selectedTrades}
              isDeleting={isDeleting}
              bulkDeleteError={bulkDeleteError}
              setBulkDeleteError={setBulkDeleteError}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              setSelectedTradeForReview={setSelectedTradeForReview}
              setIsReviewModalOpen={setIsReviewModalOpen}
            />
          }
        />
        <Route
          path="analysis"
          element={
            <Analysis
              trades={trades}
              activeChart={activeChart}
              setActiveChart={setActiveChart}
            />
          }
        />
        <Route
          path="planning"
          element={<Planning trades={trades} user={user} stats={stats} />}
        />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        trade={selectedTrade}
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
    </div>
  );
};

export default Dashboard;
