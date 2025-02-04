// src/pages/Dashboard.jsx
import { useState } from "react";
import { Pencil, Trash2, BookOpen, Upload, X } from "lucide-react";
import TradeModal from "../components/TradeModal";
import { useTrades } from "../hooks/useTrades";
import ProfitLossChart from "../components/ProfitLossChart";
import { useAuth } from "../context/AuthContext";
import TimeAnalysis from "../components/TimeAnalysis";
import DrawdownAnalysis from "../components/DrawdownAnalysis";
import StreakAnalysis from "../components/StreakAnalysis";
import ReviewModal from "../components/ReviewModal";
import ImportTradeModal from "../components/ImportTradeModal";
import StopLossStudy from "../components/StopLossStudy";
import DashboardTour from "../components/DashboardTour";
import { formatInTimeZone } from "date-fns-tz";

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

  const handleSelectAll = () => {
    if (selectedTrades.size === trades.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(trades.map((trade) => trade._id)));
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
    return <div className="w-full p-6 text-red-600">Error: {error}</div>;
  }

  const handleImportTrades = async (trades) => {
    const success = await importTrades(trades);
    if (success) {
      setIsImportModalOpen(false);
    }
  };

  return (
    <div className="w-full p-6 text-black">
      <DashboardTour />
      {/* Stats Overview */}
      <div className="space-y-4 mb-8" data-tour="stats-overview">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="bg-white p-4 rounded shadow"
            data-tour="starting-capital"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="text-sm text-black">Starting Capital</h3>
                <p className="text-2xl font-bold text-black">
                  {formatCurrency(user?.preferences?.startingCapital || 0)}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-black">Current Balance</h3>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-2xl font-bold ${
                      stats?.totalProfit > 0
                        ? "text-green-600"
                        : stats?.totalProfit < 0
                        ? "text-red-600"
                        : "text-black"
                    }`}
                  >
                    {formatCurrency(
                      (user?.preferences?.startingCapital || 0) +
                        (stats?.totalProfit || 0)
                    )}
                  </p>
                  {user?.preferences?.startingCapital > 0 && (
                    <span
                      className={`text-sm ${
                        stats?.totalProfit > 0
                          ? "text-green-600"
                          : stats?.totalProfit < 0
                          ? "text-red-600"
                          : "text-black"
                      }`}
                    >
                      {(
                        ((stats?.totalProfit || 0) /
                          user.preferences.startingCapital) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <h3 className="text-sm text-black">Total Trades</h3>
              <p className="text-2xl font-bold text-black">
                {stats?.totalTrades || 0}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-black">Win Rate</h3>
              <p className="text-2xl font-bold text-black">
                {stats?.winRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm text-black">Total P/L</h3>
            <p
              className={`text-2xl font-bold ${
                (stats?.totalProfit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(stats?.totalProfit || 0)}
            </p>
          </div>
        </div>
        <div className="col-span-1">
          <StopLossStudy trades={trades} user={user} stats={stats} />
        </div>
      </div>

      {/* Charts Section */}
      <div
        className="bg-white p-6 rounded shadow mb-8"
        data-tour="performance-charts"
      >
        <div className="min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Performance Analysis
            </h2>
            <div className="flex gap-2" data-tour="chart-controls">
              <button
                onClick={() => setActiveChart("pnl")}
                className={`px-3 py-1 rounded-lg ${
                  activeChart === "pnl"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                P/L Chart
              </button>
              <button
                onClick={() => setActiveChart("time")}
                className={`px-3 py-1 rounded-lg ${
                  activeChart === "time"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Time Analysis
              </button>
              <button
                onClick={() => setActiveChart("risk")}
                className={`px-3 py-1 rounded-lg ${
                  activeChart === "risk"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Risk Analysis
              </button>
              <button
                onClick={() => setActiveChart("streaks")}
                className={`px-3 py-1 rounded-lg ${
                  activeChart === "streaks"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Streaks
              </button>
            </div>
          </div>

          {activeChart === "pnl" ? (
            <ProfitLossChart trades={trades} />
          ) : activeChart === "time" ? (
            <TimeAnalysis trades={trades} />
          ) : activeChart === "risk" ? (
            <DrawdownAnalysis trades={trades} />
          ) : (
            <StreakAnalysis trades={trades} />
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white p-4 rounded shadow" data-tour="trades-table">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">Recent Trades</h2>
          <div className="flex gap-2">
            {selectedTrades.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
              >
                {isDeleting
                  ? "Deleting..."
                  : `Delete Selected (${selectedTrades.size})`}
              </button>
            )}
            <button
              data-tour="add-trade"
              onClick={handleAddTradeClick}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Trade
            </button>
          </div>
        </div>

        {bulkDeleteError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>{bulkDeleteError}</span>
            <button
              onClick={() => setBulkDeleteError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="w-12 py-3 px-4">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedTrades.size === trades.length &&
                        trades.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-black">Date</th>
                <th className="text-left py-3 px-4 text-black">Symbol</th>
                <th className="text-left py-3 px-4 text-black">Type</th>
                <th className="text-right py-3 px-4 text-black">Entry</th>
                <th className="text-right py-3 px-4 text-black">Exit</th>
                <th className="text-right py-3 px-4 text-black">P/L</th>
                <th className="text-right py-3 px-4 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr className="text-black text-center">
                  <td colSpan="8" className="py-4">
                    No trades yet
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade._id} className="border-b hover:bg-gray-50">
                    <td className="w-12 py-3 px-4">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedTrades.has(trade._id)}
                          onChange={() => handleSelectTrade(trade._id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-black">
                      {formatDate(trade.entryDate)}
                    </td>
                    <td className="py-3 px-4 text-black">{trade.symbol}</td>
                    <td className="py-3 px-4 text-black">{trade.type}</td>
                    <td className="py-3 px-4 text-right text-black">
                      {formatCurrency(trade.entryPrice)}
                    </td>
                    <td className="py-3 px-4 text-right text-black">
                      {trade.exitPrice ? formatCurrency(trade.exitPrice) : "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {trade.profitLoss?.realized ? (
                        <span
                          className={
                            trade.profitLoss.realized >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(trade.profitLoss.realized)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedTradeForReview(trade);
                            setIsReviewModalOpen(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded bg-transparent"
                          title="Review Trade"
                        >
                          <BookOpen className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleEditClick(trade)}
                          className="p-1 hover:bg-gray-100 rounded bg-transparent"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(trade._id)}
                          className="p-1 hover:bg-gray-100 rounded bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
