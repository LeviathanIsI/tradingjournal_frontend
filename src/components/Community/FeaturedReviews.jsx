import { useState, useEffect } from "react";
import {
  Star,
  Calendar,
  TrendingUp,
  TrendingDown,
  BookOpen,
  ArrowRightLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import ReviewInteractions from "./ReviewInteractions";
import { formatCurrency, makeApiRequest } from "../../utils/communityUtils";

const FeaturedReviews = () => {
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        setLoading(true);
        const data = await makeApiRequest("/api/trade-reviews/featured");
        setFeaturedReviews(data || []);
      } catch (error) {
        console.error("Error fetching featured reviews:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedReviews();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm p-5 sm:p-6 mb-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Featured Reviews
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-300">
          <div className="animate-pulse flex space-x-2 items-center mb-3">
            <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>
            <div className="h-2.5 w-2.5 bg-primary/70 rounded-full"></div>
            <div className="h-2.5 w-2.5 bg-primary/40 rounded-full"></div>
          </div>
          <p>Loading featured reviews...</p>
        </div>
      </div>
    );
  }

  if (error || !featuredReviews.length) return null;

  return (
    <div className="bg-white/90 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm p-5 sm:p-6 mb-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-100 dark:bg-yellow-500/20 rounded-full">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Featured Reviews
          </h2>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-1.5" />
          Top reviews from {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid gap-6">
        {featuredReviews.map((review) => (
          <div
            key={review._id}
            className="border border-gray-100 dark:border-gray-700/30 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/30"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  {review.trade.symbol} - {review.trade.type}
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      review.trade.type === "LONG"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {review.trade.type}
                  </span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  by{" "}
                  <Link
                    to={`/community/profile/${review.user.username}`}
                    className="text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 font-medium"
                  >
                    {review.user.username}
                  </Link>{" "}
                  • {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  review.trade.profitLoss.realized >= 0
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                } self-start sm:self-center`}
              >
                {formatCurrency(review.trade.profitLoss.realized)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-green-50/70 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/20">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  What Went Well
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {review.whatWentWell}
                </p>
              </div>
              <div className="bg-red-50/70 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1.5" />
                  What Went Wrong
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {review.whatWentWrong}
                </p>
              </div>
            </div>

            <div className="mb-5 bg-blue-50/70 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-1.5" />
                Lesson Learned
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {review.lessonLearned}
              </p>
            </div>

            <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 mb-1">
                    Entry Price
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${review.trade.entryPrice}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 mb-1">
                    Exit Price
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${review.trade.exitPrice}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 mb-1">
                    Shares/Contracts
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {review.trade.entryQuantity}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 mb-1">
                    Session
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
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
