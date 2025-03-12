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
import { LineChart, Award, Users, Info } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-lg text-gray-700 dark:text-gray-200 flex items-center">
          <div className="h-2.5 w-2.5 bg-primary rounded-full mr-2"></div>
          <div className="h-2.5 w-2.5 bg-primary/70 rounded-full mr-2"></div>
          <div className="h-2.5 w-2.5 bg-primary/40 rounded-full mr-2"></div>
          Loading reviews...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800/50 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 rounded-full bg-red-100 dark:bg-red-800/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="font-medium text-red-600 dark:text-red-400">
            Error Loading Reviews
          </h3>
        </div>
        <p className="text-red-600 dark:text-red-400 ml-8">{error}</p>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="bg-white dark:bg-gray-800/80 p-6 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
          <Info className="h-6 w-6 text-primary dark:text-primary-light" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          No public reviews available yet. Check back later or be the first to
          share a review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <div className="h-6 w-1.5 bg-primary rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Public Trade Reviews
        </h2>
      </div>

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
        <div className="bg-gray-50/80 dark:bg-gray-800/40 rounded-lg border border-gray-200/70 dark:border-gray-700/40 p-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-4">
            <Info className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Matching Reviews
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            No reviews match your current filters. Try adjusting your search
            criteria or filters to see more results.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow p-6"
            >
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
                        review.user
                          ? `/community/profile/${review.user.username}`
                          : "#"
                      }
                      className="text-primary dark:text-primary-light hover:text-primary/80 dark:hover:text-primary-light/80 font-medium"
                    >
                      {review.user?.username || "Unknown User"}
                    </Link>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
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
                      ${review.trade.entryPrice}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Exit Price
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${review.trade.exitPrice}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Shares/Contracts
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {review.trade.entryQuantity}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Trading Session
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {review.trade.session}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <ReviewInteractions
                  review={review}
                  onUpdate={handleReviewUpdate}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicReviews;
