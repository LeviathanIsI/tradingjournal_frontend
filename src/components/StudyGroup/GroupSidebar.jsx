import React from "react";
import { CheckCircle } from "lucide-react";

const GroupSidebar = ({ currentGroup, setActiveTab }) => {
  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-600/50 bg-gray-50 dark:bg-gray-600/40">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Group Details
        </h3>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Members ({currentGroup.members?.length || 0})
          </h4>
          {currentGroup.members?.length > 0 ? (
            <div className="max-h-40 overflow-y-auto">
              {currentGroup.members.slice(0, 5).map((member) => (
                <div key={member._id} className="flex items-center py-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
                    {member.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {member.username}
                  </span>
                  {member._id === currentGroup.creator?._id && (
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-700/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Creator
                    </span>
                  )}
                </div>
              ))}
              {currentGroup.members.length > 5 && (
                <button
                  onClick={() => setActiveTab("members")}
                  className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
                >
                  View all members
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No members yet
            </p>
          )}
        </div>

        {currentGroup.tags && currentGroup.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentGroup.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 dark:bg-blue-700/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSidebar;
