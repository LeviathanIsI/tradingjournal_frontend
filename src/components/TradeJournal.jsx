import React from "react";
import { Pencil, Trash2, BookOpen, X } from "lucide-react";

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
    </div>
  );
};

export default TradeJournal;
