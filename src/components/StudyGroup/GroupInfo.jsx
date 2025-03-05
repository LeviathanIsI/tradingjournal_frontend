import React from "react";
import { Info, Lock, Globe, Clock, Calendar } from "lucide-react";

const GroupInfo = ({ currentGroup, formatDate }) => {
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
      </div>
    </div>
  );
};

export default GroupInfo;
