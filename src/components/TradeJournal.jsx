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
  handleEditClick={handleEditClick},
  handleDeleteClick={handleDeleteClick},
  handleSelectTrade,
  handleSelectAll,
  handleBulkDelete,
  handleAddTradeClick,
  handleAddOptionTradeClick,
  selectedTrades,
  isDeleting,
  bulkDeleteError,
  setBulkDeleteError,
  formatDate,
  formatCurrency,
  setSelectedTradeForReview,
  setIsReviewModalOpen,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [activeTradeType, setActiveTradeType] = useState("stock");

  // Split trades by type first for better performance
  const tradesByType = useMemo(() => {
    const stockTrades = [];
    const optionTrades = [];

    trades.forEach((trade) => {
      if (trade.contractType) {
        optionTrades.push(trade);
      } else {
        stockTrades.push(trade);
      }
    });

    return {
      stock: stockTrades,
      option: optionTrades,
    };
  }, [trades]);

  // Filter trades based on time period and type
  const filteredTrades = useMemo(() => {
    const tradesToFilter = tradesByType[activeTradeType];
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return tradesToFilter.filter((trade) => {
      // Filter based on time period
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
  }, [tradesByType, timeFilter, customDateRange, activeTradeType]);

  const getTableHeaders = () => {
    if (activeTradeType === "stock") {
      return [
        { label: "Date", align: "left" },
        { label: "Symbol", align: "left" },
        { label: "Type", align: "left" },
        { label: "Entry", align: "right" },
        { label: "Exit", align: "right" },
        { label: "P/L", align: "right" },
        { label: "Actions", align: "right" },
      ];
    }
    return [
      { label: "Date", align: "left" },
      { label: "Symbol", align: "left" },
      { label: "Strike", align: "right" },
      { label: "Exp", align: "center" },
      { label: "Type", align: "left" },
      { label: "Entry", align: "right" },
      { label: "Exit", align: "right" },
      { label: "P/L", align: "right" },
      { label: "Actions", align: "right" },
    ];
  };

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

  const renderTradeRow = (trade) => {
    const isOptionTrade = trade.contractType; // If it has contractType, it's an option trade

    const baseClasses = {
      td: "p-3 sm:p-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap",
      checkbox: "w-4 h-4 rounded border-gray-300 dark:border-gray-600",
      profitLoss:
        trade.profitLoss?.realized >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
      actionButton: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded",
    };

    // Common columns that appear in both types
    const commonColumns = (
      <>
        <td className="p-3 sm:p-4">
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={selectedTrades.has(trade._id)}
              onChange={() => handleSelectTrade(trade._id)}
              className={baseClasses.checkbox}
            />
          </div>
        </td>
        <td className={baseClasses.td}>{formatDate(trade.entryDate)}</td>
        <td className={baseClasses.td}>{trade.symbol}</td>
      </>
    );

    // Action buttons that appear in both types
    const actionButtons = (
      <td className="p-3 sm:p-4">
        <div className="flex justify-end gap-1 sm:gap-2">
          <button
            onClick={() => {
              setSelectedTradeForReview(trade);
              setIsReviewModalOpen(true);
            }}
            className={baseClasses.actionButton}
            title="Review Trade"
          >
            <BookOpen className="h-4 w-4 text-green-600" />
          </button>
          <button
            onClick={() => handleEditClick(trade)}
            className={baseClasses.actionButton}
            title="Edit Trade"
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteClick(trade)}
            className={baseClasses.actionButton}
            title="Delete Trade"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </td>
    );

    if (isOptionTrade) {
      return (
        <tr
          key={trade._id}
          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          {commonColumns}
          <td className={baseClasses.td}>{formatCurrency(trade.strike, 2)}</td>
          <td className={`${baseClasses.td} text-center`}>
            {formatDate(trade.expiration, "MM/dd/yy")}
          </td>
          <td className={baseClasses.td}>
            {`${trade.type} ${trade.contractType}`}
          </td>
          <td className={`${baseClasses.td} text-right`}>
            {trade.contracts} @ {formatCurrency(trade.entryPrice, 2)}
          </td>
          <td className={`${baseClasses.td} text-right`}>
            {trade.exitPrice
              ? `${trade.contracts} @ ${formatCurrency(trade.exitPrice, 2)}`
              : "-"}
          </td>
          <td className={`${baseClasses.td} text-right`}>
            {trade.profitLoss?.realized ? (
              <span className={baseClasses.profitLoss}>
                {formatCurrency(trade.profitLoss.realized, 2)}
              </span>
            ) : (
              "-"
            )}
          </td>
          {actionButtons}
        </tr>
      );
    }

    return (
      <tr
        key={trade._id}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        {commonColumns}
        <td className={baseClasses.td}>{trade.type}</td>
        <td className={`${baseClasses.td} text-right`}>
          {formatCurrency(trade.entryPrice, 6)}
        </td>
        <td className={`${baseClasses.td} text-right`}>
          {trade.exitPrice ? formatCurrency(trade.exitPrice, 6) : "-"}
        </td>
        <td className={`${baseClasses.td} text-right`}>
          {trade.profitLoss?.realized ? (
            <span className={baseClasses.profitLoss}>
              {formatCurrency(trade.profitLoss.realized, 6)}
            </span>
          ) : (
            "-"
          )}
        </td>
        {actionButtons}
      </tr>
    );
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
              Add Stock Trade
            </button>
            <button
              onClick={handleAddOptionTradeClick}
              className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Add Option Trade
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

        {/* Trade Type Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => {
                setActiveTradeType("stock");
                setCurrentPage(1);
              }}
              className={`${
                activeTradeType === "stock"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300"
              } px-4 py-2 text-sm font-medium border-b-2`}
            >
              Stock Trades ({tradesByType.stock.length})
            </button>
            <button
              onClick={() => {
                setActiveTradeType("option");
                setCurrentPage(1);
              }}
              className={`${
                activeTradeType === "option"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300"
              } px-4 py-2 text-sm font-medium border-b-2`}
            >
              Option Trades ({tradesByType.option.length})
            </button>
          </nav>
        </div>

        {/* Controls and Table */}
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
                        checked={
                          currentTrades.length > 0 &&
                          currentTrades.every((trade) =>
                            selectedTrades.has(trade._id)
                          )
                        }
                        onChange={() => handleSelectAll(currentTrades)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </th>
                  {getTableHeaders().map((header) => (
                    <th
                      key={header.label}
                      className={`p-3 sm:p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-${header.align}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentTrades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTradeType === "stock" ? "8" : "10"}
                      className="p-4 text-sm text-center text-gray-500 dark:text-gray-400"
                    >
                      {filteredTrades.length === 0
                        ? "No trades found for the selected period"
                        : "No trades on this page"}
                    </td>
                  </tr>
                ) : (
                  currentTrades.map((trade) => renderTradeRow(trade))
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
