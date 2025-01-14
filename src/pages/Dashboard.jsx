// src/pages/Dashboard.jsx
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import TradeModal from "../components/TradeModal";
import { useTrades } from "../hooks/useTrades";
import ProfitLossChart from "../components/ProfitLossChart";
import WinLossChart from "../components/WinLossChart";

const Dashboard = () => {
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const { trades, stats, loading, error, addTrade, updateTrade, deleteTrade } =
    useTrades();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
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

  const handleModalClose = () => {
    setIsTradeModalOpen(false);
    setSelectedTrade(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="w-full p-6 text-black">Loading...</div>;
  }

  if (error) {
    return <div className="w-full p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full p-6 text-black">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-black">Total Trades</h3>
          <p className="text-2xl font-bold text-black">
            {stats?.totalTrades || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-black">Win Rate</h3>
          <p className="text-2xl font-bold text-black">
            {stats?.winRate?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-black">Profit Factor</h3>
          <p className="text-2xl font-bold text-black">
            {stats?.profitFactor || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-black">Total P/L</h3>
          <p className="text-2xl font-bold text-black">
            {formatCurrency(stats?.totalProfit || 0)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">
            Profit/Loss Over Time
          </h2>
          <div className="h-64">
            <ProfitLossChart trades={trades} />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">
            Win/Loss Distribution
          </h2>
          <div className="h-64">
            <WinLossChart trades={trades} />
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">Recent Trades</h2>
          <button
            onClick={() => setIsTradeModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Trade
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
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
                  <td colSpan="7" className="py-4">
                    No trades yet
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade._id} className="border-b hover:bg-gray-50">
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
      />
    </div>
  );
};

export default Dashboard;
