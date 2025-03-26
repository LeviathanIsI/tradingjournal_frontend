import { useState } from "react";
import { Heart, MessageCircle, Trash2, Send, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { makeApiRequest } from "../../utils/communityUtils";

const ReviewInteractions = ({ review, onUpdate }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const updatedReview = await makeApiRequest(
        `/api/trade-reviews/${review._id}/like`,
        {
          method: "POST",
        }
      );
      onUpdate && onUpdate(updatedReview);
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const updatedReview = await makeApiRequest(
        `/api/trade-reviews/${review._id}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ content: comment }),
        }
      );
      onUpdate && onUpdate(updatedReview);
      setComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedReview = await makeApiRequest(
        `/api/trade-reviews/${review._id}/comments/${commentId}`,
        { method: "DELETE" }
      );
      onUpdate && onUpdate(updatedReview);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isLiked = review.likes?.includes(user?._id);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700/40 pt-4">
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              isLiked
                ? "fill-current text-red-500 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
          <span className="text-sm font-medium">
            {review.likes?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
        >
          <MessageCircle
            className={`h-5 w-5 ${
              showComments
                ? "text-primary dark:text-primary-light"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
          <span className="text-sm font-medium">
            {review.comments?.length || 0}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="mt-5 space-y-4">
          <form onSubmit={handleComment}>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600/70 round-sm bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary pr-10"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-primary dark:text-primary-light hover:text-primary/80 dark:hover:text-primary-light/80"
                  disabled={!comment.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!comment.trim()}
                className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white round-sm shadow transition-colors font-medium hidden sm:block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {review.comments?.length === 0 ? (
              <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 round-sm text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-5 w-5 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              review.comments?.map((cmt) => (
                <div
                  key={cmt._id}
                  className="flex justify-between items-start p-4 round-sm bg-gray-50/80 dark:bg-gray-700/30 border border-gray-200/70 dark:border-gray-600/40"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary dark:text-primary-light" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {cmt.user.username}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(cmt.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {cmt.content}
                      </p>
                    </div>
                  </div>
                  {(cmt.user._id === user?._id ||
                    review.user._id === user?._id) && (
                    <button
                      onClick={() => handleDeleteComment(cmt._id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewInteractions;
