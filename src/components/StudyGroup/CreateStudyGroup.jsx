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
  Loader,
  CheckCircle,
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
          className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="sr-only">Back to Study Groups</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-primary dark:text-primary-light" />
          Create Study Group
        </h1>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {/* Info Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700/40">
          <div className="flex items-start space-x-3 mb-5">
            <Info className="h-5 w-5 text-primary dark:text-primary-light mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Study groups help traders learn together, share strategies, and
              improve their trading skills through focused discussions and
              scheduled sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center bg-primary/5 dark:bg-primary/10 rounded-sm p-4 transform transition-transform hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary dark:text-primary-light" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-center">
                Collaborative Learning
              </h3>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                Share insights and learn from others
              </p>
            </div>

            <div className="flex flex-col items-center bg-accent/5 dark:bg-accent/10 rounded-sm p-4 transform transition-transform hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-accent dark:text-accent-light" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-center">
                Scheduled Sessions
              </h3>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                Plan study sessions with specific topics
              </p>
            </div>

            <div className="flex flex-col items-center bg-secondary/5 dark:bg-secondary/10 rounded-sm p-4 transform transition-transform hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center mb-3">
                <Tag className="h-6 w-6 text-secondary dark:text-secondary-light" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-center">
                Focused Topics
              </h3>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                Organize groups by trading strategies or assets
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 round-sm text-red-600 dark:text-red-400 text-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p>{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Group Name Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                htmlFor="name"
              >
                Group Name<span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full px-3 py-2.5 border ${
                  errors.name
                    ? "border-red-500 dark:border-red-400 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-primary/50"
                } round-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g., Options Trading Mastery"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className={`w-full px-3 py-2.5 border ${
                  errors.description
                    ? "border-red-500 dark:border-red-400 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-primary/50"
                } round-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="What will this group focus on? What kind of traders should join?"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  What will this group focus on? What kind of traders should
                  join?
                </p>
                <p
                  className={`text-xs ${
                    formData.description.length > 490
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formData.description.length}/500
                </p>
              </div>
            </div>

            {/* Tags Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                htmlFor="tags"
              >
                Tags (comma separated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className={`w-full pl-10 pr-3 py-2.5 border ${
                    errors.tags
                      ? "border-red-500 dark:border-red-400 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary/50"
                  } round-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="E.g., options, swing trading, day trading"
                />
              </div>
              {errors.tags ? (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.tags}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Add up to 10 tags to help others find your group
                </p>
              )}

              {/* Preview tags */}
              {formData.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {formData.tags.split(",").map(
                    (tag, index) =>
                      tag.trim() && (
                        <span
                          key={index}
                          className="text-xs bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light px-2.5 py-1 rounded-full flex items-center"
                        >
                          <span className="mr-1">#</span>
                          {tag.trim()}
                        </span>
                      )
                  )}
                </div>
              )}
            </div>

            {/* Date and Time Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Date Field */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  htmlFor="scheduledDate"
                >
                  Event Date and Time<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    className={`w-full pl-10 pr-3 py-2.5 border ${
                      errors.scheduledDate
                        ? "border-red-500 dark:border-red-400 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-primary/50"
                    } round-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
                    id="scheduledDate"
                    name="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.scheduledDate ? (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.scheduledDate}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    When will this study event take place?
                  </p>
                )}
              </div>

              {/* Duration Field */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  htmlFor="duration"
                >
                  Event Duration (minutes)
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 round-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
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
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: 30-90 minutes
                </p>
              </div>
            </div>

            {/* Registration Deadline Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                htmlFor="joinDeadline"
              >
                Registration Deadline (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 round-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  id="joinDeadline"
                  name="joinDeadline"
                  type="datetime-local"
                  value={formData.joinDeadline}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                After this date, users cannot register for this event
              </p>
            </div>

            {/* Privacy Toggle */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-sm p-4">
              <label className="flex items-start cursor-pointer">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary bg-white dark:bg-gray-700 rounded border-gray-300 dark:border-gray-600 focus:ring-primary/50"
                  />
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    {formData.isPrivate ? (
                      <Lock className="h-4 w-4 mr-1.5 text-primary dark:text-primary-light" />
                    ) : (
                      <Globe className="h-4 w-4 mr-1.5 text-secondary dark:text-secondary-light" />
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
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t dark:border-gray-700/40 pt-6 mt-8">
            <button
              type="button"
              onClick={() => navigate("/study-groups")}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 dark:border-gray-600 round-sm bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary/90 text-white round-sm shadow transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Create Study Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudyGroup;
