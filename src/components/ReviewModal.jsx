import React from "react";
import { X } from "lucide-react";
import TradeReview from "./TradeReview";

const ReviewModal = ({ isOpen, onClose, trade, review, onSubmit }) => {
  if (!isOpen) return null;

  const isOptionTrade = !!trade.contractType;

  // Format the title to include trade type
  const tradeTitle = `Review ${isOptionTrade ? "Option " : ""}Trade: ${
    trade.symbol
  }${isOptionTrade ? ` ${trade.contractType} ${trade.strike}` : ""}`;

  const renderTradeSummary = () => {
    if (isOptionTrade) {
      return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              Type:
            </span>
            <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
              {`${trade.type} ${trade.contractType}`}
            </span>
          </div>
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              Strike:
            </span>
            <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
              ${trade.strike}
            </span>
          </div>
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              Contracts:
            </span>
            <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
              {trade.contracts}
            </span>
          </div>
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              Expiration:
            </span>
            <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
              {new Date(trade.expiration).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              Entry:
            </span>
            <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
              ${trade.entryPrice} per contract
            </span>
          </div>
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              Exit:
            </span>
            <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
              ${trade.exitPrice} per contract
            </span>
          </div>
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              P/L:
            </span>
            <span
              className={`sm:ml-2 font-medium ${
                trade.profitLoss.realized >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${trade.profitLoss.realized}
            </span>
          </div>
          <div>
            <span className="block sm:inline text-gray-500 dark:text-gray-300">
              P/L per Contract:
            </span>
            <span
              className={`sm:ml-2 font-medium ${
                trade.profitLoss.perContract >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${trade.profitLoss.perContract}
            </span>
          </div>
        </div>
      );
    }

    // Original stock trade summary
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div>
          <span className="block sm:inline text-gray-500 dark:text-gray-300">
            Type:
          </span>
          <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
            {trade.type}
          </span>
        </div>
        <div>
          <span className="block sm:inline text-gray-500 dark:text-gray-300">
            Entry:
          </span>
          <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
            ${trade.entryPrice}
          </span>
        </div>
        <div>
          <span className="block sm:inline text-gray-500 dark:text-gray-300">
            Exit:
          </span>
          <span className="sm:ml-2 font-medium text-gray-900 dark:text-gray-100">
            ${trade.exitPrice}
          </span>
        </div>
        <div>
          <span className="block sm:inline text-gray-500 dark:text-gray-300">
            P/L:
          </span>
          <span
            className={`sm:ml-2 font-medium ${
              trade.profitLoss.realized >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ${trade.profitLoss.realized}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 sm:p-0">
      <div className="bg-white dark:bg-gray-700/90 rounded-md border border-gray-200 dark:border-gray-600/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-md">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600/50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tradeTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-600/30 rounded-sm border border-gray-200 dark:border-gray-600/50">
            {renderTradeSummary()}
          </div>

          <TradeReview
            trade={trade}
            review={review}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
