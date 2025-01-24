// src/components/PublicReviews.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ReviewInteractions from "./ReviewInteractions";
import FiltersBar from "./FiltersBar";

const PublicReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    profitType: "all",
    timeFrame: "all",
  });
  const [currentSort, setCurrentSort] = useState("newest");
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "mostLiked", label: "Most Liked" },
    { value: "mostComments", label: "Most Comments" },
    { value: "highestProfit", label: "Highest Profit" },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Handle review updates (likes, comments)
  const handleReviewUpdate = (updatedReview) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review._id === updatedReview._id ? updatedReview : review
      )
    );
  };

  // Add filtering and sorting logic
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews].filter((review) => review.trade); // Only include reviews with trade data

    if (filters.profitType !== "all") {
      filtered = filtered.filter((review) => {
        const profit = review.trade?.profitLoss?.realized || 0;
        if (filters.profitType === "winning") return profit > 0;
        if (filters.profitType === "losing") return profit < 0;
        return true;
      });
    }

    // ... rest of your filtering logic

    return filtered;
  }, [reviews, filters, currentSort]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/trade-reviews/public"
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch reviews");
        }

        setReviews(data.data || []); // Ensure we always set an array
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading reviews: {error}</div>;
  if (!reviews.length) return <div>No public reviews available yet.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Public Trade Reviews
      </h2>

      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        setSort={setCurrentSort}
      />

      <div className="grid gap-6">
        {filteredAndSortedReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {review.trade?.symbol || "Unknown"} -{" "}
                  {review.trade?.type || "Unknown"}
                </h3>
                <p className="text-sm text-gray-500">
                  by{" "}
                  <Link
                    to={`/profile/${review.user.username}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {review.user.username}
                  </Link>{" "}
                  • {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              {review.trade?.profitLoss?.realized !== undefined && (
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    review.trade.profitLoss.realized >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formatCurrency(review.trade.profitLoss.realized)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  What Went Well
                </h4>
                <p className="text-gray-600">{review.whatWentWell}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  What Went Wrong
                </h4>
                <p className="text-gray-600">{review.whatWentWrong}</p>
              </div>
              <div className="col-span-2">
                <h4 className="font-medium text-gray-700 mb-2">
                  Lessons Learned
                </h4>
                <p className="text-gray-600">{review.lessonLearned}</p>
              </div>
              <div className="col-span-2">
                <h4 className="font-medium text-gray-700 mb-2">
                  Future Adjustments
                </h4>
                <p className="text-gray-600">{review.futureAdjustments}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-700 mb-2">Trade Details</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Entry:</span>
                  <span className="ml-2 text-gray-900">
                    ${review.trade.entryPrice}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Exit:</span>
                  <span className="ml-2 text-gray-900">
                    ${review.trade.exitPrice}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Shares:</span>
                  <span className="ml-2 text-gray-900">
                    {review.trade.entryQuantity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Session:</span>
                  <span className="ml-2 text-gray-900">
                    {review.trade.session}
                  </span>
                </div>
              </div>
            </div>
            <ReviewInteractions
              review={review}
              onUpdate={(updatedReview) => {
                setReviews(
                  reviews.map((r) =>
                    r._id === updatedReview._id ? updatedReview : r
                  )
                );
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicReviews;
