import { useState, useEffect } from "react";

const TradeReview = ({ trade, review, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    lessonLearned: "",
    whatWentWell: "",
    whatWentWrong: "",
    futureAdjustments: "",
    isPublic: false,
    trade: trade._id,
  });

  useEffect(() => {
    if (review) {
      setFormData({
        lessonLearned: review.lessonLearned || "",
        whatWentWell: review.whatWentWell || "",
        whatWentWrong: review.whatWentWrong || "",
        futureAdjustments: review.futureAdjustments || "",
        isPublic: review.isPublic || false,
        trade: trade._id,
      });
    }
  }, [review, trade._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = review
        ? `${import.meta.env.VITE_API_URL}/api/trade-reviews/${review._id}`
        : `${import.meta.env.VITE_API_URL}/api/trade-reviews`;

      const response = await fetch(url, {
        method: review ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        onSubmit && onSubmit(data.data);
        onClose && onClose();
      }
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-700/60 rounded-sm shadow-sm border border-gray-200 dark:border-gray-600/50">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Trade Review
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What I Learned
          </label>
          <textarea
            value={formData.lessonLearned}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                lessonLearned: e.target.value,
              }))
            }
            className="w-full border border-gray-300 dark:border-gray-600/70 rounded-sm shadow-sm 
            px-3 py-2.5 sm:py-2 bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What Went Well
          </label>
          <textarea
            value={formData.whatWentWell}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, whatWentWell: e.target.value }))
            }
            className="w-full border border-gray-300 dark:border-gray-600/70 rounded-sm shadow-sm 
            px-3 py-2.5 sm:py-2 bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What Went Wrong
          </label>
          <textarea
            value={formData.whatWentWrong}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                whatWentWrong: e.target.value,
              }))
            }
            className="w-full border border-gray-300 dark:border-gray-600/70 rounded-sm shadow-sm 
            px-3 py-2.5 sm:py-2 bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Future Adjustments
          </label>
          <textarea
            value={formData.futureAdjustments}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                futureAdjustments: e.target.value,
              }))
            }
            className="w-full border border-gray-300 dark:border-gray-600/70 rounded-sm shadow-sm 
            px-3 py-2.5 sm:py-2 bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
            rows="3"
          />
        </div>

        <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-600/30 rounded-sm">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
            }
            className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600/70 rounded-sm"
          />
          <label
            htmlFor="isPublic"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Make this review public
          </label>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4 border-t dark:border-gray-600/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 
            rounded-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600/70 
            text-sm order-2 sm:order-1 bg-white dark:bg-gray-600/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 dark:bg-blue-500 text-white 
            rounded-sm hover:bg-blue-700 dark:hover:bg-blue-600 text-sm order-1 sm:order-2"
          >
            Save Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeReview;
