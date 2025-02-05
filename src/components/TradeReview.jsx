// src/components/TradeReview.jsx
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
        ? `http://localhost:5000/api/trade-reviews/${review._id}`
        : "http://localhost:5000/api/trade-reviews";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          What I Learned
        </label>
        <textarea
          value={formData.lessonLearned}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, lessonLearned: e.target.value }))
          }
          className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          What Went Well
        </label>
        <textarea
          value={formData.whatWentWell}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, whatWentWell: e.target.value }))
          }
          className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          What Went Wrong
        </label>
        <textarea
          value={formData.whatWentWrong}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, whatWentWrong: e.target.value }))
          }
          className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
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
          className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows="3"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
          }
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
          Make this review public
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Review
        </button>
      </div>
    </form>
  );
};

export default TradeReview;
