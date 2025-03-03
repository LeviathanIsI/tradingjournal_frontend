// src/components/ReviewInteractions.jsx
import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ReviewInteractions = ({ review, onUpdate }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${review._id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdate && onUpdate(data.data);
      }
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${
          review._id
        }/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: comment }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdate && onUpdate(data.data);
        setComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${
          review._id
        }/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdate && onUpdate(data.data);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isLiked = review.likes?.includes(user?._id);

  return (
    <div className="mt-4 pt-4 border-t dark:border-gray-600/50">
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Heart
            className={`h-5 w-5 ${
              isLiked ? "fill-current text-red-500 dark:text-red-400" : ""
            }`}
          />
          <span className="text-sm sm:text-base">
            {review.likes?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm sm:text-base">
            {review.comments?.length || 0}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 
                rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 
                dark:bg-blue-500/90 dark:hover:bg-blue-500 text-sm font-medium w-full sm:w-auto"
              >
                Post
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {review.comments?.map((comment) => (
              <div
                key={comment._id}
                className="flex justify-between items-start bg-gray-50 dark:bg-gray-600/30 
                p-3 rounded-sm border border-gray-200 dark:border-gray-600/50"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {comment.user.username}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {comment.content}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {(comment.user._id === user?._id ||
                  review.user._id === user?._id) && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewInteractions;
