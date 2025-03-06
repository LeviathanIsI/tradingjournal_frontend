import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ReviewInteractions from "./ReviewInteractions";
import FiltersBar from "./FiltersBar";
import {
  formatCurrency,
  filterAndSortData,
  getSortOptions,
  makeApiRequest,
} from "../../utils/communityUtils";

const PublicReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    profitType: "all",
    timeFrame: "all",
  });
  const [currentSort, setCurrentSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Standard sort options for reviews
  const sortOptions = getSortOptions();

  // Load reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await makeApiRequest("/api/trade-reviews/public");
        setReviews(data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Apply filtering and sorting
  const filteredAndSortedReviews = useMemo(() => {
    return filterAndSortData(
      reviews.filter((review) => review.trade), // Basic validation
      filters,
      currentSort,
      searchQuery
    );
  }, [reviews, filters, currentSort, searchQuery]);

  // Handle review updates (likes, comments)
  const handleReviewUpdate = (updatedReview) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review._id === updatedReview._id ? updatedReview : review
      )
    );
  };

  if (loading)
    return <div className="text-gray-900 dark:text-gray-100">Loading...</div>;
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400">
        Error loading reviews: {error}
      </div>
    );
  if (!reviews.length)
    return (
      <div className="text-gray-900 dark:text-gray-100">
        No public reviews available yet.
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
        Public Trade Reviews
      </h2>

      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        setSort={setCurrentSort}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {filteredAndSortedReviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-md">
          <p className="text-gray-600 dark:text-gray-300">
            No reviews match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {filteredAndSortedReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-4 sm:p-6"
            >
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
                        review.user
                          ? `/community/profile/${review.user.username}`
                          : "#"
                      }
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {review.user?.username || "Unknown User"}
                    </Link>{" "}
                    • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {review.trade?.profitLoss?.realized !== undefined && (
                  <div
                    className={`self-start sm:self-center px-3 py-1 rounded-sm text-sm ${
                      review.trade.profitLoss.realized >= 0
                        ? "bg-green-100 dark:bg-green-700/30 text-green-800 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-700/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {formatCurrency(review.trade.profitLoss.realized)}
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
              <ReviewInteractions
                review={review}
                onUpdate={handleReviewUpdate}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicReviews;
