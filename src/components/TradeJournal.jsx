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
    <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <select
          value={timeFilter}
          onChange={(e) => {
            setTimeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Time</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>

        {timeFilter === "custom" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) =>
                setCustomDateRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">to</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) =>
                setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        <select
          value={entriesPerPage}
          onChange={(e) => {
            setEntriesPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={filteredTrades.length}>All</option>
        </select>
      </div>

      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-full sm:w-auto text-center sm:text-right">
        Showing {indexOfFirstTrade + 1} to{" "}
        {Math.min(indexOfLastTrade, filteredTrades.length)} of{" "}
        {filteredTrades.length} entries
      </div>
    </div>
  );

  // Pagination UI
  const renderPagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-2 sm:px-0">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 rounded 
      border border-gray-300 dark:border-gray-600 
      enabled:hover:bg-gray-50 dark:enabled:hover:bg-gray-700 
      disabled:opacity-50 text-sm text-gray-900 dark:text-gray-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`min-w-[2.5rem] px-3 py-2 rounded border text-sm
          ${
            currentPage === number
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          }`}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 rounded 
      border border-gray-300 dark:border-gray-600 
      enabled:hover:bg-gray-50 dark:enabled:hover:bg-gray-700 
      disabled:opacity-50 text-sm text-gray-900 dark:text-gray-100"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Features Info */}
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
        <p className="text-sm text-gray-900 dark:text-gray-100">
          Trade Journal Features:
        </p>
        <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
          <li>• Add, edit, and review your trades</li>
          <li>• Bulk select and manage multiple trades</li>
          <li>• Track entry/exit prices and P/L</li>
          <li>• Add detailed trade reviews and notes</li>
        </ul>
        <p className="text-xs italic text-gray-600 dark:text-gray-400 mt-2">
          Pro tip: Use trade reviews to document your thought process and
          improve your strategy
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trade Journal
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedTrades.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 
                disabled:bg-red-400 flex items-center justify-center gap-2 text-sm"
              >
                {isDeleting
                  ? "Deleting..."
                  : `Delete Selected (${selectedTrades.size})`}
              </button>
            )}
            <button
              onClick={handleAddTradeClick}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Add Trade
            </button>
          </div>
        </div>

        {/* Error Message */}
        {bulkDeleteError && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 
          flex justify-between items-center text-sm"
          >
            <span>{bulkDeleteError}</span>
            <button
              onClick={() => setBulkDeleteError(null)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Actions Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md mb-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
            Available Actions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-400">
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

        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="w-12 p-3 sm:p-4">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={currentTrades.every((trade) =>
                          selectedTrades.has(trade._id)
                        )}
                        onChange={() => handleSelectAll(currentTrades)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </th>
                  {[
                    "Date",
                    "Symbol",
                    "Type",
                    "Entry",
                    "Exit",
                    "P/L",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="p-3 sm:p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentTrades.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-4 text-sm text-center text-gray-500 dark:text-gray-400"
                    >
                      {filteredTrades.length === 0
                        ? "No trades found for the selected period"
                        : "No trades on this page"}
                    </td>
                  </tr>
                ) : (
                  currentTrades.map((trade) => (
                    <tr
                      key={trade._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="p-3 sm:p-4">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedTrades.has(trade._id)}
                            onChange={() => handleSelectTrade(trade._id)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {formatDate(trade.entryDate)}
                      </td>
                      <td className="p-3 sm:p-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {trade.symbol}
                      </td>
                      <td className="p-3 sm:p-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {trade.type}
                      </td>
                      <td className="p-3 sm:p-4 text-sm text-gray-900 dark:text-gray-100 text-right whitespace-nowrap">
                        {formatCurrency(trade.entryPrice)}
                      </td>
                      <td className="p-3 sm:p-4 text-sm text-gray-900 dark:text-gray-100 text-right whitespace-nowrap">
                        {trade.exitPrice
                          ? formatCurrency(trade.exitPrice)
                          : "-"}
                      </td>
                      <td className="p-3 sm:p-4 text-sm text-right whitespace-nowrap">
                        {trade.profitLoss?.realized ? (
                          <span
                            className={
                              trade.profitLoss.realized >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {formatCurrency(trade.profitLoss.realized)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedTradeForReview(trade);
                              setIsReviewModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Review Trade"
                          >
                            <BookOpen className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleEditClick(trade)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Edit Trade"
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(trade._id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Delete Trade"
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
        {renderPagination()}
      </div>
    </div>
  );
};

export default TradeJournal;
