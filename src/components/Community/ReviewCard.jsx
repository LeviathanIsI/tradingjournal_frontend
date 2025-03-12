import React from "react";
import { Link } from "react-router-dom";
import { Award, LineChart, Users, Info } from "lucide-react";
import ReviewInteractions from "./ReviewInteractions";

// Move formatCurrency to a utility function that can be imported
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const ReviewCard = ({ review, onUpdate }) => {
  if (!review) return null;

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0 mb-5">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {review.trade?.symbol || "Unknown"} -{" "}
            {review.trade?.type || "Unknown"}
          </h3>
          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-3.5 w-3.5 mr-1.5 text-primary/70 dark:text-primary-light/70" />
            <Link
              to={
                review.user ? `/community/profile/${review.user.username}` : "#"
              }
              className="text-primary dark:text-primary-light hover:text-primary/80 dark:hover:text-primary-light/80 font-medium"
            >
              {review.user?.username || "Unknown User"}
            </Link>
            <span className="mx-2">•</span>
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {review.trade?.profitLoss?.realized !== undefined && (
          <div
            className={`self-start sm:self-center px-4 py-1.5 rounded-md text-sm font-medium ${
              review.trade.profitLoss.realized >= 0
                ? "bg-green-100/90 dark:bg-green-800/30 text-green-800 dark:text-green-300"
                : "bg-red-100/90 dark:bg-red-800/30 text-red-800 dark:text-red-300"
            }`}
          >
            {formatCurrency(review.trade.profitLoss.realized)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <Award className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
            What Went Well
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.whatWentWell}
          </p>
        </div>
        <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <Award className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
            What Went Wrong
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.whatWentWrong}
          </p>
        </div>
        <div className="col-span-1 sm:col-span-2 bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
            Lessons Learned
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.lessonLearned}
          </p>
        </div>
        <div className="col-span-1 sm:col-span-2 bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
            Future Adjustments
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.futureAdjustments}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700/40">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
          <Info className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          Trade Details
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md">
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Entry Price
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ${review.trade?.entryPrice}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Exit Price
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ${review.trade?.exitPrice}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Shares/Contracts
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {review.trade?.entryQuantity}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Trading Session
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {review.trade?.session}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ReviewInteractions review={review} onUpdate={onUpdate} />
      </div>
    </div>
  );
};

export default ReviewCard;
