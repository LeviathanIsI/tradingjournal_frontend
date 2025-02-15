import React from "react";
import { X } from "lucide-react";
import TradeReview from "./TradeReview";

const ReviewModal = ({ isOpen, onClose, trade, review, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-0">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Review Trade: {trade.symbol}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Trade Summary */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
