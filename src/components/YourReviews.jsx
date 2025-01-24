import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Edit, MessageCircle, Heart } from "lucide-react";
import ReviewModal from "./ReviewModal";

const YourReviews = ({ userId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwnProfile = user?._id === userId;

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/trade-reviews/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reviews");
      }

      // If viewing someone else's profile, only show public reviews
      const filteredReviews = isOwnProfile
        ? data.data
        : data.data.filter((review) => review.isPublic);

      setReviews(filteredReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async (review) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/trade-reviews/${review._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPublic: !review.isPublic }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setReviews(reviews.map((r) => (r._id === review._id ? data.data : r)));
      }
    } catch (error) {
      console.error("Error updating review visibility:", error);
    }
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/trade-reviews/${selectedReview._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setReviews(
          reviews.map((r) => (r._id === selectedReview._id ? data.data : r))
        );
        setIsEditModalOpen(false);
        setSelectedReview(null);
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading)
    return <div className="flex justify-center p-8">Loading reviews...</div>;
  if (error)
    return (
      <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
    );
  if (!reviews.length)
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-lg text-gray-600">No reviews yet</p>
        <p className="text-sm text-gray-500">
          {isOwnProfile
            ? "Start reviewing your trades to track your progress!"
            : "This trader hasn't published any reviews yet."}
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {review.trade.symbol} - {review.trade.type}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              {isOwnProfile && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVisibilityToggle(review)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={review.isPublic ? "Make Private" : "Make Public"}
                  >
                    {review.isPublic ? (
                      <Eye className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit Review"
                  >
                    <Edit className="h-5 w-5 text-blue-600" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
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
              {review.futureAdjustments && (
                <div className="col-span-2">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Future Adjustments
                  </h4>
                  <p className="text-gray-600">{review.futureAdjustments}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{review.likes?.length || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{review.comments?.length || 0} comments</span>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  review.trade.profitLoss.realized >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {formatCurrency(review.trade.profitLoss.realized)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReview && (
        <ReviewModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReview(null);
          }}
          trade={selectedReview.trade}
          review={selectedReview}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default YourReviews;
