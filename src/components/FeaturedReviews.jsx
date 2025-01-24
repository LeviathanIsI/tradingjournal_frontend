// src/components/FeaturedReviews.jsx
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
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

  if (loading) return <div>Loading featured reviews...</div>;
  if (error) return null; // Don't show any error if featured reviews fail to load
  if (!featuredReviews.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-yellow-400 fill-current" />
        <h2 className="text-lg font-semibold text-gray-900">
          Featured Reviews
        </h2>
      </div>

      <div className="grid gap-6">
        {featuredReviews.map((review) => (
          <div
            key={review._id}
            className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {review.trade.symbol} - {review.trade.type}
                </h3>
                <p className="text-sm text-gray-500">
                  by {review.user.username} •{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  review.trade.profitLoss.realized >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                ${review.trade.profitLoss.realized.toFixed(2)}
              </div>
            </div>

            <div className="text-gray-600">{review.lessonLearned}</div>

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
