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
  Share2,
  Tag,
  Users,
  Bookmark,
  CheckCircle,
} from "lucide-react";
import { getUserFriendlyTimezone } from "../../utils/timezones";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext"; // Added toast context

const GroupInfo = ({ currentGroup, formatDate, onSettingsNavigate }) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast(); // For copy link feedback

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

  // Function to copy link with toast notification
  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        showToast("Link copied to clipboard", "success");
      })
      .catch(() => {
        showToast("Failed to copy link", "error");
      });
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Info className="mr-2 h-5 w-5 text-primary dark:text-primary-light" />
          Group Information
        </h2>
      </div>

      <div className="p-5 space-y-6">
        {/* About section */}
        <div className="bg-white/70 dark:bg-gray-700/40 rounded-sm p-4 border border-gray-200/70 dark:border-gray-600/40">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
            <Bookmark className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            ABOUT
          </h3>
          <p className="text-gray-800 dark:text-gray-200 text-sm">
            {currentGroup.description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left column */}
          <div className="space-y-5">
            {/* Category */}
            {currentGroup.category && (
              <div className="bg-white/70 dark:bg-gray-700/40 rounded-sm p-4 border border-gray-200/70 dark:border-gray-600/40">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
                  <Tag className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  CATEGORY
                </h3>
                <span className="px-3 py-1.5 bg-accent/10 dark:bg-accent/20 text-accent-dark dark:text-accent-light rounded-full text-xs font-medium inline-flex items-center">
                  {currentGroup.category
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
            )}

            {/* Tags */}
            {currentGroup.tags && currentGroup.tags.length > 0 && (
              <div className="bg-white/70 dark:bg-gray-700/40 rounded-sm p-4 border border-gray-200/70 dark:border-gray-600/40">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
                  <Tag className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  TAGS
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {currentGroup.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light rounded-full text-xs font-medium inline-flex items-center"
                    >
                      <span className="mr-0.5">#</span>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy */}
            <div className="bg-white/70 dark:bg-gray-700/40 rounded-sm p-4 border border-gray-200/70 dark:border-gray-600/40">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
                <Users className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                PRIVACY
              </h3>
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                  currentGroup.isPrivate
                    ? "bg-gray-200/80 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300"
                    : "bg-green-100/80 dark:bg-green-800/30 text-green-700 dark:text-green-300"
                }`}
              >
                {currentGroup.isPrivate ? (
                  <>
                    <Lock size={12} className="mr-1.5" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe size={12} className="mr-1.5" />
                    Public
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {currentGroup.isPrivate
                  ? "Members join by invitation only"
                  : "Anyone can find and join this group"}
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Timezone */}
            <div className="bg-white/70 dark:bg-gray-700/40 rounded-sm p-4 border border-gray-200/70 dark:border-gray-600/40">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
                <GlobeIcon className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                YOUR TIMEZONE
              </h3>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                {getUserFriendlyTimezone(userTimezone)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                All session times are shown in this timezone. You can update
                your timezone in your{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter font-medium underline underline-offset-2"
                  onClick={() => goToSettings(authUser.username)}
                >
                  account settings
                </button>
              </p>
            </div>

            {/* Time-related information */}
            <div className="bg-white/70 dark:bg-gray-700/40 rounded-sm p-4 border border-gray-200/70 dark:border-gray-600/40">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
                <Clock className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                ACTIVITY
              </h3>

              <div className="space-y-3">
                {/* Last Activity */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Active:
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                    <Activity size={14} className="mr-1.5 text-gray-500" />
                    {getRelativeTime(
                      currentGroup.lastActive || currentGroup.updatedAt
                    )}
                  </span>
                </div>

                {/* Created */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {formatDate(currentGroup.createdAt)}
                  </span>
                </div>

                {/* Join Deadline */}
                {currentGroup.joinDeadline && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Join Deadline:
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                      <Calendar size={14} className="mr-1.5 text-gray-500" />
                      {formatDate(currentGroup.joinDeadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social sharing section */}
        {!currentGroup.isPrivate && (
          <div className="bg-white/70 dark:bg-gray-700/40 rounded-sm p-4 border border-gray-200/70 dark:border-gray-600/40">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
              <Share2 className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              SHARE GROUP
            </h3>
            <button
              onClick={copyLinkToClipboard}
              className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300 round-sm flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <CheckCircle size={14} className="mr-1.5" />
              Copy Link
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Share this link with others to invite them to this group
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInfo;
