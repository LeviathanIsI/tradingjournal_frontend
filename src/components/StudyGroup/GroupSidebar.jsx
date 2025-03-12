import React from "react";
import { CheckCircle, Users, Tag, ChevronRight, Crown } from "lucide-react";

const GroupSidebar = ({ currentGroup, setActiveTab }) => {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/50">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          Group Details
        </h3>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Users className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            MEMBERS
            <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
              ({currentGroup.members?.length || 0})
            </span>
          </h4>

          {currentGroup.members?.length > 0 ? (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {currentGroup.members.slice(0, 5).map((member) => (
                <div
                  key={member._id}
                  className="flex items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-light dark:bg-primary flex items-center justify-center text-white text-xs mr-2.5 shadow-sm">
                    {member.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-sm text-gray-800 dark:text-gray-200 flex-grow truncate">
                    {member.username}
                  </span>
                  {member._id === currentGroup.creator?._id && (
                    <span className="flex items-center text-xs bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light px-2 py-0.5 rounded-full">
                      <Crown size={12} className="mr-1" />
                      Creator
                    </span>
                  )}
                </div>
              ))}
              {currentGroup.members.length > 5 && (
                <button
                  onClick={() => setActiveTab("members")}
                  className="flex items-center w-full text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter mt-1 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors justify-between"
                >
                  <span>View all members</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200/70 dark:border-gray-600/40 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No members yet
              </p>
            </div>
          )}
        </div>

        {currentGroup.tags && currentGroup.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Tag className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              TAGS
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentGroup.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light px-2.5 py-1 rounded-full flex items-center"
                >
                  <span className="mr-0.5">#</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick navigation section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700/40">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            QUICK NAVIGATION
          </h4>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("info")}
              className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors flex items-center"
            >
              <CheckCircle
                size={16}
                className="mr-2 text-gray-500 dark:text-gray-400"
              />
              Group Info
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors flex items-center"
            >
              <CheckCircle
                size={16}
                className="mr-2 text-gray-500 dark:text-gray-400"
              />
              Event Details
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors flex items-center"
            >
              <CheckCircle
                size={16}
                className="mr-2 text-gray-500 dark:text-gray-400"
              />
              Group Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSidebar;
