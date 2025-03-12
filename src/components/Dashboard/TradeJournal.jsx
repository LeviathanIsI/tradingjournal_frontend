import React, { useState, useMemo, useCallback } from "react";
import { VariableSizeList as List } from "react-window";
import {
  Pencil,
  Trash2,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  ArrowUpDown,
} from "lucide-react";

const TradeJournal = ({
  trades,
  handleEditClick,
  handleDeleteClick,
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
      checkbox:
        "w-4 h-4 rounded-sm border-gray-300 dark:border-gray-600/70 focus:ring-primary focus:ring-2 focus:ring-offset-1",
      profitLoss:
        trade.profitLoss?.realized >= 0
          ? "text-green-600 dark:text-green-400 font-medium"
          : "text-red-600 dark:text-red-400 font-medium",
      actionButton:
        "p-2 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-sm transition-colors",
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
        <td className={`${baseClasses.td} font-medium`}>{trade.symbol}</td>
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
            <BookOpen className="h-4 w-4 text-secondary dark:text-secondary" />
          </button>
          <button
            onClick={() => handleEditClick(trade)}
            className={baseClasses.actionButton}
            title="Edit Trade"
          >
            <Pencil className="h-4 w-4 text-primary dark:text-primary" />
          </button>
          <button
            onClick={() => handleDeleteClick(trade)}
            className={baseClasses.actionButton}
            title="Delete Trade"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </td>
    );

    if (isOptionTrade) {
      return (
        <tr
          key={trade._id}
          className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
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
        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
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

  // Controls UI with improved styling
  const renderControls = () => (
    <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto pl-9 pr-3 py-2 text-sm 
            border border-gray-300 dark:border-gray-600/70 rounded-md
            bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
            focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-1
            appearance-none"
          >
            <option value="all">All Time</option>
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {timeFilter === "custom" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 dark:bg-gray-700/20 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600/50">
            <Calendar className="hidden sm:block h-4 w-4 text-primary" />
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) =>
                setCustomDateRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className="w-full sm:w-auto border border-gray-300 dark:border-gray-600/70 rounded-md px-3 py-1 text-sm 
            bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
            focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-1"
            />
            <span className="text-gray-600 dark:text-gray-400">to</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) =>
                setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full sm:w-auto border border-gray-300 dark:border-gray-600/70 rounded-md px-3 py-1 text-sm 
            bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
            focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-1"
            />
          </div>
        )}

        <div className="relative">
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto pl-9 pr-3 py-2 text-sm 
            border border-gray-300 dark:border-gray-600/70 rounded-md
            bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
            focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-1
            appearance-none"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={filteredTrades.length}>All</option>
          </select>
          <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-full sm:w-auto text-center sm:text-right bg-gray-50 dark:bg-gray-700/20 px-3 py-2 rounded-md">
        Showing {indexOfFirstTrade + 1} to{" "}
        {Math.min(indexOfLastTrade, filteredTrades.length)} of{" "}
        {filteredTrades.length} entries
      </div>
    </div>
  );

  // Enhanced pagination UI
  const renderPagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-2 sm:px-0">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 rounded-md
      border border-gray-300 dark:border-gray-600/70
      enabled:hover:bg-primary/5 dark:enabled:hover:bg-primary/10
      disabled:opacity-50 text-sm text-gray-700 dark:text-gray-300
      transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-1 sm:gap-1 overflow-x-auto no-scrollbar">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`min-w-[2.5rem] px-3 py-2 rounded-md border text-sm transition-all
          ${
            currentPage === number
              ? "bg-primary text-white border-primary dark:bg-primary/90 dark:border-primary"
              : "border-gray-300 dark:border-gray-600/70 hover:bg-primary/5 dark:hover:bg-primary/10 text-gray-700 dark:text-gray-300"
          }`}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 rounded-md
      border border-gray-300 dark:border-gray-600/70
      enabled:hover:bg-primary/5 dark:enabled:hover:bg-primary/10
      disabled:opacity-50 text-sm text-gray-700 dark:text-gray-300
      transition-all"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  // Row renderer function for virtualized list
  const largeDataRowRenderer = ({ index, style }) => {
    if (index >= currentTrades.length) return null;

    const trade = currentTrades[index];
    return (
      <div
        style={style}
        className="border-b border-gray-200 dark:border-gray-600/50"
      >
        {renderTradeRow(trade)}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Features Info Card */}
      <div className="bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-700/30 dark:to-gray-600/20 p-4 rounded-lg border border-gray-200 dark:border-gray-600/50 shadow-sm backdrop-blur-sm">
        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
          Trade Journal Features:
        </p>
        <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/80"></div>
            Add, edit, and review your trades
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/80"></div>
            Bulk select and manage multiple trades
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/80"></div>
            Track entry/exit prices and P/L
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/80"></div>
            Add detailed trade reviews and notes
          </li>
        </ul>
        <p className="text-xs italic text-gray-600 dark:text-gray-400 mt-2 border-t border-gray-200 dark:border-gray-600/50 pt-2">
          Pro tip: Use trade reviews to document your thought process and
          improve your strategy
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white/90 dark:bg-gray-800/60 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-600/50 shadow-sm backdrop-blur-sm">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="h-6 w-1 bg-primary rounded-full mr-2"></div>
            Trade Journal
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedTrades.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-none bg-red-500 dark:bg-red-500/90 text-white px-4 py-2 rounded-md
                hover:bg-red-600 dark:hover:bg-red-600/90 shadow hover:shadow-md
                disabled:bg-red-400 disabled:dark:bg-red-400/80 
                disabled:shadow-none transition-all
                flex items-center justify-center gap-2 text-sm"
              >
                {isDeleting
                  ? "Deleting..."
                  : `Delete Selected (${selectedTrades.size})`}
              </button>
            )}
            <button
              onClick={handleAddTradeClick}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md shadow hover:shadow-md transition-all text-sm"
            >
              Add Stock Trade
            </button>
            <button
              onClick={handleAddOptionTradeClick}
              className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-md shadow hover:shadow-md transition-all text-sm"
            >
              Add Option Trade
            </button>
          </div>
        </div>

        {/* Error Message */}
        {bulkDeleteError && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-4 
            flex justify-between items-center text-sm shadow-sm"
          >
            <span>{bulkDeleteError}</span>
            <button
              onClick={() => setBulkDeleteError(null)}
              className="p-1 text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Trade Type Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-600/50 mb-5">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => {
                setActiveTradeType("stock");
                setCurrentPage(1);
              }}
              className={`${
                activeTradeType === "stock"
                  ? "border-primary text-primary dark:text-primary"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600/70"
              } px-4 py-2 text-sm font-medium border-b-2 transition-colors`}
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
                  ? "border-secondary text-secondary dark:text-secondary"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600/70"
              } px-4 py-2 text-sm font-medium border-b-2 transition-colors`}
            >
              Option Trades ({tradesByType.option.length})
            </button>
          </nav>
        </div>

        {/* Controls and Table */}
        {renderControls()}
        <div className="overflow-x-auto -mx-3 sm:-mx-5 rounded-md">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600/50">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-700/30">
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
                        className="w-4 h-4 rounded-sm border-gray-300 dark:border-gray-600/70 focus:ring-primary focus:ring-2 focus:ring-offset-1"
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
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600/50 bg-white dark:bg-gray-800/40">
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
                ) : // Use standard table rendering for small datasets
                // and virtualized list for larger datasets (over 100 trades)
                currentTrades.length <= 100 ? (
                  currentTrades.map((trade) => renderTradeRow(trade))
                ) : (
                  <tr>
                    <td
                      colSpan={activeTradeType === "stock" ? "8" : "10"}
                      className="p-0"
                    >
                      <div style={{ height: 600 }}>
                        <List
                          height={600}
                          itemCount={currentTrades.length}
                          itemSize={56} // Adjust based on your actual row height
                          width="100%"
                        >
                          {largeDataRowRenderer}
                        </List>
                      </div>
                    </td>
                  </tr>
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
