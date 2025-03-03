import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Edit, MessageCircle, Heart, Trash2 } from "lucide-react";
import ReviewModal from "./ReviewModal";

const YourReviews = ({ userId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwnProfile = user?._id === userId;
  const [editData, setEditData] = useState({
    lessonLearned: "",
    whatWentWell: "",
    whatWentWrong: "",
    futureAdjustments: "",
    isPublic: false,
  });

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/user/${userId}`,
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

      const filteredReviews = data.data.filter((review) =>
        isOwnProfile
          ? review.user._id === userId
          : review.isPublic && review.user._id === userId
      );

      setReviews(filteredReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (review) => {
    setEditData({
      lessonLearned: review.lessonLearned || "",
      whatWentWell: review.whatWentWell || "",
      whatWentWrong: review.whatWentWrong || "",
      futureAdjustments: review.futureAdjustments || "",
      isPublic: review.isPublic || false,
    });
    setIsEditModalOpen(true);
    setSelectedReview(review);
  };

  // Add this function in YourReviews component
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      // Remove the review from state
      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleVisibilityToggle = async (review) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${review._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            isPublic: !review.isPublic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review visibility");
      }

      const data = await response.json();
      setReviews(reviews.map((r) => (r._id === review._id ? data.data : r)));
    } catch (error) {
      console.error("Error updating review visibility:", error);
    }
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${
          selectedReview._id
        }`,
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
    return (
      <div className="flex justify-center p-4 sm:p-8 text-base sm:text-lg text-gray-900 dark:text-gray-100">
        Loading reviews...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center p-4 sm:p-8 text-base sm:text-lg text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    );

  if (!reviews.length)
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center space-y-3 sm:space-y-4">
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          No reviews yet
        </p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 px-4">
          {isOwnProfile
            ? "Start reviewing your trades to track your progress!"
            : "This trader hasn't published any reviews yet."}
        </p>
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-600/50"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  {review.trade.symbol} - {review.trade.type}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              {isOwnProfile && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handleVisibilityToggle(review)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600/30 rounded-sm"
                    title={review.isPublic ? "Make Private" : "Make Public"}
                  >
                    {review.isPublic ? (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditClick(review)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600/30 rounded-sm"
                    title="Edit Review"
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600/30 rounded-sm"
                    title="Delete Review"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What Went Well
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {review.whatWentWell}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What Went Wrong
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {review.whatWentWrong}
                </p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lessons Learned
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {review.lessonLearned}
                </p>
              </div>
              {review.futureAdjustments && (
                <div className="col-span-1 sm:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Future Adjustments
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {review.futureAdjustments}
                  </p>
                </div>
              )}
            </div>

            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 
              pt-4 border-t dark:border-gray-600/50"
            >
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-300 text-xs sm:text-sm">
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
                className={`px-3 py-1 rounded-sm text-xs sm:text-sm w-fit ${
                  review.trade.profitLoss.realized >= 0
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
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
