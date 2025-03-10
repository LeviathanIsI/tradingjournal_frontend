import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Info,
  Lock,
  Globe,
  Clock,
  Calendar,
  Activity,
  GlobeIcon,
} from "lucide-react";
import { getUserFriendlyTimezone } from "../../utils/timezones";
import { useAuth } from "../../context/AuthContext";

const GroupInfo = ({ currentGroup, formatDate, onSettingsNavigate }) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // Get the appropriate timezone - prioritize user preferences, fall back to group timezone or UTC
  const userTimezone =
    authUser?.preferences?.timeZone || currentGroup.timezone || "UTC";

  // Function to navigate to settings
  const goToSettings = (username) => {
    navigate(`/profile/${username}`);
    if (onSettingsNavigate) {
      onSettingsNavigate("account");
    }
  };

  // Function to format relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateString);
  };

  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-6">
        <Info className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
        Group Information
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            About
          </h3>
          <p className="text-gray-900 dark:text-gray-100">
            {currentGroup.description || "No description provided."}
          </p>
        </div>

        {currentGroup.category && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Category
            </h3>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-700/30 text-purple-800 dark:text-purple-300 rounded-md text-sm">
              {currentGroup.category
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        )}

        {currentGroup.tags && currentGroup.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentGroup.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-700/30 text-blue-800 dark:text-blue-300 rounded-md text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Privacy
          </h3>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
              currentGroup.isPrivate
                ? "bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300"
                : "bg-green-100 dark:bg-green-700/30 text-green-700 dark:text-green-300"
            }`}
          >
            {currentGroup.isPrivate ? (
              <>
                <Lock size={14} className="mr-1.5" />
                Private - Members join by invitation only
              </>
            ) : (
              <>
                <Globe size={14} className="mr-1.5" />
                Public - Anyone can find and join this group
              </>
            )}
          </div>
        </div>

        {/* Updated timezone information to use user's timezone with settings navigation */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Your Timezone
          </h3>
          <p className="text-gray-900 dark:text-gray-100 flex items-center">
            <GlobeIcon size={14} className="mr-1.5 text-gray-500" />
            {getUserFriendlyTimezone(userTimezone)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            All session times are shown in this timezone
          </p>
          <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
            You can update your timezone in your{" "}
            <button
              type="button"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => goToSettings(authUser.username)}
            >
              account settings
            </button>
          </p>
        </div>

        {/* Add last active information */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Last Activity
          </h3>
          <p className="text-gray-900 dark:text-gray-100 flex items-center">
            <Activity size={14} className="mr-1.5 text-gray-500" />
            {getRelativeTime(currentGroup.lastActive || currentGroup.updatedAt)}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Created
          </h3>
          <p className="text-gray-900 dark:text-gray-100 flex items-center">
            <Clock size={14} className="mr-1.5 text-gray-500" />
            {formatDate(currentGroup.createdAt)}
          </p>
        </div>

        {currentGroup.joinDeadline && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Join Deadline
            </h3>
            <p className="text-gray-900 dark:text-gray-100 flex items-center">
              <Calendar size={14} className="mr-1.5 text-gray-500" />
              {formatDate(currentGroup.joinDeadline)}
            </p>
          </div>
        )}

        {/* Social sharing section */}
        {!currentGroup.isPrivate && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Share Group
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300 rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInfo;
