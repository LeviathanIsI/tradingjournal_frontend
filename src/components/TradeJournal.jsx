import React, { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TradeJournal = ({
  trades,
  handleEditClick,
  handleDeleteClick,
  handleSelectTrade,
  handleSelectAll,
  handleBulkDelete,
  handleAddTradeClick,
  selectedTrades,
  isDeleting,
  bulkDeleteError,
  setBulkDeleteError,
  formatDate,
  formatCurrency,
  setSelectedTradeForReview,
  setIsReviewModalOpen,
}) => {
  // Pagination and display settings
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });

  // Filter trades based on time period
  const filteredTrades = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return trades.filter((trade) => {
      const tradeDate = new Date(trade.entryDate);
      switch (timeFilter) {
        case "day":
          return tradeDate >= startOfDay;
        case "week":
          return tradeDate >= startOfWeek;
        case "month":
          return tradeDate >= startOfMonth;
        case "year":
          return tradeDate >= startOfYear;
        case "custom":
          if (!customDateRange.start || !customDateRange.end) return true;
          const start = new Date(customDateRange.start + "T00:00:00");
          const end = new Date(customDateRange.end + "T23:59:59.999");
          const tzOffset = new Date().getTimezoneOffset() * 60000;
          const startTimestamp = start.getTime() - tzOffset;
          const endTimestamp = end.getTime() - tzOffset;
          const tradeDateTimestamp = tradeDate.getTime();

          return (
            tradeDateTimestamp >= startTimestamp &&
            tradeDateTimestamp <= endTimestamp
          );
        default:
          return true;
      }
    });
  }, [trades, timeFilter, customDateRange]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrades.length / entriesPerPage);
  const indexOfLastTrade = currentPage * entriesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - entriesPerPage;
  const currentTrades = filteredTrades.slice(
    indexOfFirstTrade,
    indexOfLastTrade
  );

  // Pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Additional controls UI
  const renderControls = () => (
    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
      <div className="flex items-center gap-4">
        <select
          value={timeFilter}
          onChange={(e) => {
            setTimeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Time</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>

        {timeFilter === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) =>
                setCustomDateRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className="border rounded px-3 py-2 text-sm"
            />
            <span>to</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) =>
                setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
        )}

        <select
          value={entriesPerPage}
          onChange={(e) => {
            setEntriesPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={filteredTrades.length}>All</option>
        </select>
      </div>

      <div className="text-sm text-gray-600">
        Showing {indexOfFirstTrade + 1} to{" "}
        {Math.min(indexOfLastTrade, filteredTrades.length)} of{" "}
        {filteredTrades.length} entries
      </div>
    </div>
  );

  // Pagination UI
  const renderPagination = () => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded border enabled:hover:bg-gray-50 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-3 py-2 rounded border ${
              currentPage === number
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-50"
            }`}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded border enabled:hover:bg-gray-50 disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-700">Trade Journal Features:</p>
        <ul className="text-xs text-blue-600 mt-2 space-y-1">
          <li>• Add, edit, and review your trades</li>
          <li>• Bulk select and manage multiple trades</li>
          <li>• Track entry/exit prices and P/L</li>
          <li>• Add detailed trade reviews and notes</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2 italic">
          Pro tip: Use trade reviews to document your thought process and
          improve your strategy
        </p>
      </div>
      <div className="bg-white p-4 rounded shadow" data-tour="trades-table">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">Trade Journal</h2>
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

        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <p className="text-sm text-gray-600 mb-2">Available Actions:</p>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span>Add trade review & notes</span>
            </div>
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-blue-600" />
              <span>Edit trade details</span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-600" />
              <span>Delete trade</span>
            </div>
          </div>
        </div>

        {renderControls()}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="w-12 py-3 px-4">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={currentTrades.every((trade) =>
                        selectedTrades.has(trade._id)
                      )}
                      onChange={() => handleSelectAll(currentTrades)}
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
              {currentTrades.length === 0 ? (
                <tr className="text-black text-center">
                  <td colSpan="8" className="py-4">
                    {filteredTrades.length === 0
                      ? "No trades found for the selected period"
                      : "No trades on this page"}
                  </td>
                </tr>
              ) : (
                currentTrades.map((trade) => (
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
        {renderPagination()}
      </div>
    </div>
  );
};

export default TradeJournal;
