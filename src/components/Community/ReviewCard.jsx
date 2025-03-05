import React from "react";
import { Link } from "react-router-dom";
import ReviewInteractions from "./ReviewInteractions";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const ReviewCard = ({ review, onUpdate }) => {
  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            {review.trade?.symbol || "Unknown"} -{" "}
            {review.trade?.type || "Unknown"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">
            by{" "}
            <Link
              to={
                review.user ? `/community/profile/${review.user.username}` : "#"
              }
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {review.user?.username || "Unknown User"}
            </Link>{" "}
            • {new Date(review.createdAt).toLocaleDateString()}
          </p>
          {review.trade?.profitLoss?.realized !== undefined && (
            <div
              className={`self-start sm:self-center px-3 py-1 rounded-sm text-sm ${
                review.trade.profitLoss.realized >= 0
                  ? "bg-green-100 dark:bg-green-700/30 text-green-800 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-700/30 text-red-800 dark:text-red-300"
              }`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(review.trade.profitLoss.realized)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              What Went Well
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {review.whatWentWell}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              What Went Wrong
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {review.whatWentWrong}
            </p>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Lessons Learned
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {review.lessonLearned}
            </p>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Future Adjustments
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {review.futureAdjustments}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t dark:border-gray-600/50">
          <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
            Trade Details
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="block sm:inline text-gray-500 dark:text-gray-400">
                Entry:
              </span>
              <span className="sm:ml-2 text-gray-900 dark:text-gray-100">
                ${review.trade.entryPrice}
              </span>
            </div>
            <div>
              <span className="block sm:inline text-gray-500 dark:text-gray-400">
                Exit:
              </span>
              <span className="sm:ml-2 text-gray-900 dark:text-gray-100">
                ${review.trade.exitPrice}
              </span>
            </div>
            <div>
              <span className="block sm:inline text-gray-500 dark:text-gray-400">
                Shares:
              </span>
              <span className="sm:ml-2 text-gray-900 dark:text-gray-100">
                {review.trade.entryQuantity}
              </span>
            </div>
            <div>
              <span className="block sm:inline text-gray-500 dark:text-gray-400">
                Session:
              </span>
              <span className="sm:ml-2 text-gray-900 dark:text-gray-100">
                {review.trade.session}
              </span>
            </div>
          </div>
        </div>
      </div>
      <ReviewInteractions review={review} onUpdate={onUpdate} />
    </div>
  );
};

export default ReviewCard;
