import { useState, useEffect } from "react";
import { Eye, Check } from "lucide-react";

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
    <div className="p-5 bg-white/90 dark:bg-gray-800/80 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-5">
        Trade Review
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
            className="w-full border border-gray-300 dark:border-gray-600/70 round-sm 
            px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
            rows="3"
            placeholder="What key lessons did you learn from this trade?"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <div className="h-4 w-1 bg-green-500 rounded-full mr-2"></div>
              What Went Well
            </label>
            <textarea
              value={formData.whatWentWell}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  whatWentWell: e.target.value,
                }))
              }
              className="w-full border border-gray-300 dark:border-gray-600/70 round-sm 
              px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              rows="3"
              placeholder="What aspects of this trade were successful?"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <div className="h-4 w-1 bg-red-500 rounded-full mr-2"></div>
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
              className="w-full border border-gray-300 dark:border-gray-600/70 round-sm 
              px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              rows="3"
              placeholder="What mistakes or issues occurred?"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
            <div className="h-4 w-1 bg-blue-500 rounded-full mr-2"></div>
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
            className="w-full border border-gray-300 dark:border-gray-600/70 round-sm 
            px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
            rows="3"
            placeholder="What will you do differently next time?"
          />
        </div>

        <div className="flex items-center p-2.5 bg-gray-50/80 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 round-sm border border-gray-200/70 dark:border-gray-600/30 transition-colors">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
            }
            className="h-4 w-4 text-primary border-gray-300 dark:border-gray-600/70 rounded focus:ring-primary/30"
          />
          <label
            htmlFor="isPublic"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center"
          >
            <Eye className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
            Make this review public
          </label>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-3 pt-5 border-t border-gray-200 dark:border-gray-700/40">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600/70 
            round-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 
            text-sm font-medium order-2 sm:order-1 bg-white dark:bg-gray-700/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white 
            round-sm shadow hover:shadow-md text-sm font-medium order-1 sm:order-2 transition-all
            dark:hover:bg-primary/80 flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Save Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeReview;
