import React from "react";
import { X } from "lucide-react";
import TradeReview from "./TradeReview";

const ReviewModal = ({ isOpen, onClose, trade, review, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Review Trade: {trade.symbol}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Trade Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium">{trade.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Entry:</span>
                <span className="ml-2 font-medium">${trade.entryPrice}</span>
              </div>
              <div>
                <span className="text-gray-500">Exit:</span>
                <span className="ml-2 font-medium">${trade.exitPrice}</span>
              </div>
              <div>
                <span className="text-gray-500">P/L:</span>
                <span
                  className={`ml-2 font-medium ${
                    trade.profitLoss.realized >= 0
                      ? "text-green-600"
                      : "text-red-600"
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
