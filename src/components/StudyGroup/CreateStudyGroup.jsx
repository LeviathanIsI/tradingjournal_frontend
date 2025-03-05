import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyGroups } from "../../context/StudyGroupContext";
import {
  ArrowLeft,
  Tag,
  BookOpen,
  Lock,
  Globe,
  Clock,
  Info,
  Users,
  Calendar,
} from "lucide-react";

const CreateStudyGroup = () => {
  const { createStudyGroup, loading } = useStudyGroups();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: true,
    joinDeadline: "",
    scheduledDate: "",
    duration: 60,
    tags: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Event date and time is required";
    }

    if (formData.tags) {
      const tags = formData.tags.split(",");
      if (tags.length > 10) {
        newErrors.tags = "Maximum 10 tags allowed";
      }

      if (tags.some((tag) => tag.trim().length > 20)) {
        newErrors.tags = "Each tag must be less than 20 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Format tags as an array
      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      const newGroup = await createStudyGroup({
        ...formData,
        tags: tagsArray,
      });

      navigate(`/study-groups/${newGroup._id}`);
    } catch (error) {
      console.error("Error creating study group:", error);
      setErrors({
        submit: "Failed to create study group. Please try again.",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/study-groups")}
          className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-blue-500 dark:text-blue-400" />
          Create Study Group
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600/50">
          <div className="flex items-start mb-4">
            <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Study groups help traders learn together, share strategies, and
              improve their trading skills through focused discussions and
              scheduled sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-700/20 rounded-md p-4">
              <Users className="h-8 w-8 text-blue-500 dark:text-blue-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Collaborative Learning
              </h3>
              <p className="text-xs text-center text-gray-600 dark:text-gray-300">
                Share insights and learn from others
              </p>
            </div>

            <div className="flex flex-col items-center bg-purple-50 dark:bg-purple-700/20 rounded-md p-4">
              <Calendar className="h-8 w-8 text-purple-500 dark:text-purple-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Scheduled Sessions
              </h3>
              <p className="text-xs text-center text-gray-600 dark:text-gray-300">
                Plan study sessions with specific topics
              </p>
            </div>

            <div className="flex flex-col items-center bg-green-50 dark:bg-green-700/20 rounded-md p-4">
              <Tag className="h-8 w-8 text-green-500 dark:text-green-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Focused Topics
              </h3>
              <p className="text-xs text-center text-gray-600 dark:text-gray-300">
                Organize groups by trading strategies or assets
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-sm text-red-600 dark:text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="mb-6">
            <label
              className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="name"
            >
              Group Name*
            </label>
            <input
              className={`w-full px-3 py-2.5 sm:py-2 border ${
                errors.name
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600/70"
              } rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100`}
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="E.g., Options Trading Mastery"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className={`w-full px-3 py-2.5 sm:py-2 border ${
                errors.description
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600/70"
              } rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100`}
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="What will this group focus on? What kind of traders should join?"
            />
            {errors.description ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length}/500 characters
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="tags"
            >
              Tags (comma separated)
            </label>
            <input
              className={`w-full px-3 py-2.5 sm:py-2 border ${
                errors.tags
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600/70"
              } rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100`}
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="E.g., options, swing trading, day trading"
            />
            {errors.tags ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.tags}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add up to 10 tags to help others find your group
              </p>
            )}

            {/* Preview tags */}
            {formData.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.split(",").map(
                  (tag, index) =>
                    tag.trim() && (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 dark:bg-blue-700/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-sm"
                      >
                        {tag.trim()}
                      </span>
                    )
                )}
              </div>
            )}
          </div>
          <div className="mb-6">
            <label
              className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="scheduledDate"
            >
              Event Date and Time*
            </label>
            <input
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
              id="scheduledDate"
              name="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              When will this study event take place?
            </p>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="duration"
            >
              Event Duration (minutes)*
            </label>
            <input
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
              id="duration"
              name="duration"
              type="number"
              min="15"
              max="180"
              value={formData.duration || 60}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="joinDeadline"
            >
              Registration Deadline (optional)
            </label>
            <div className="flex items-start">
              <div className="flex-grow">
                <input
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  id="joinDeadline"
                  name="joinDeadline"
                  type="datetime-local"
                  value={formData.joinDeadline}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  After this date, users cannot register for this event
                </p>
              </div>
              <div className="ml-4 mt-2">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="flex items-start cursor-pointer">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 bg-white dark:bg-gray-600/50 rounded-sm border-gray-300 dark:border-gray-600/70 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {formData.isPrivate ? (
                    <Lock className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                  ) : (
                    <Globe className="h-4 w-4 mr-1.5 text-green-500 dark:text-green-400" />
                  )}
                  {formData.isPrivate ? "Private group" : "Public group"}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.isPrivate
                    ? "Members join by invitation only"
                    : "Anyone can find and join this group"}
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t dark:border-gray-600/50 pt-4">
            <button
              type="button"
              onClick={() => navigate("/study-groups")}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600/70 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 text-sm sm:text-base flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Study Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudyGroup;
