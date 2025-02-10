import { useState, useEffect } from "react";
import { Star, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import ReviewInteractions from "./ReviewInteractions";

const FeaturedReviews = () => {
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/trade-reviews/featured"
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch featured reviews");
        }

        setFeaturedReviews(data.data || []);
      } catch (error) {
        console.error("Error fetching featured reviews:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedReviews();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Featured Reviews
          </h2>
        </div>
        <div className="flex justify-center py-8 text-gray-600 dark:text-gray-400">
          Loading featured reviews...
        </div>
      </div>
    );
  }

  if (error || !featuredReviews.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Featured Reviews
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Top reviews from {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-6">
        {featuredReviews.map((review) => (
          <div
            key={review._id}
            className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {review.trade.symbol} - {review.trade.type}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  by{" "}
                  <Link
                    to={`/community/profile/${review.user.username}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {review.user.username}
                  </Link>{" "}
                  • {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  review.trade.profitLoss.realized >= 0
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                }`}
              >
                {formatCurrency(review.trade.profitLoss.realized)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  What Went Well
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {review.whatWentWell}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  What Went Wrong
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {review.whatWentWrong}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lesson Learned
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {review.lessonLearned}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Entry:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    ${review.trade.entryPrice}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Exit:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    ${review.trade.exitPrice}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Shares:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {review.trade.entryQuantity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Session:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {review.trade.session}
                  </span>
                </div>
              </div>
            </div>

            <ReviewInteractions
              review={review}
              onUpdate={(updatedReview) => {
                setFeaturedReviews(
                  featuredReviews.map((r) =>
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

export default FeaturedReviews;
