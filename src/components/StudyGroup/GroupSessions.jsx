import React from "react";
import { Calendar, Clock, Users } from "lucide-react";

const GroupSessions = ({
  currentGroup,
  user,
  getEventDetails,
  showSessionForm,
  setShowSessionForm,
  formatDate,
}) => {
  const isCreator = currentGroup.creator?._id === user?._id;

  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
          Event Details
        </h2>
        {isCreator && !getEventDetails() && (
          <button
            onClick={() => setShowSessionForm(true)}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-sm flex items-center text-sm transition-colors"
          >
            <Calendar size={16} className="mr-1.5" />
            Set Event Details
          </button>
        )}
        {isCreator && getEventDetails() && (
          <button
            onClick={() => setShowSessionForm(true)}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-sm flex items-center text-sm transition-colors"
          >
            <Clock size={16} className="mr-1.5" />
            Update Event Time
          </button>
        )}
      </div>

      {getEventDetails() ? (
        <div className="border border-gray-200 dark:border-gray-600 rounded-sm p-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {currentGroup.name} Study Event
            </h3>
            <span
              className={`px-2 py-1 rounded-sm text-xs font-medium ${
                new Date(getEventDetails().scheduledDate) < new Date()
                  ? "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  : "bg-green-100 dark:bg-green-700/30 text-green-600 dark:text-green-300"
              }`}
            >
              {new Date(getEventDetails().scheduledDate) < new Date()
                ? "Past Event"
                : "Upcoming"}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={14} className="mr-1.5" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">
                {new Date(getEventDetails().scheduledDate).toLocaleDateString(
                  [],
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock size={14} className="mr-1.5" />
              <span className="font-medium">Time:</span>
              <span className="ml-2">
                {new Date(getEventDetails().scheduledDate).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
                {getEventDetails().duration &&
                  ` - ${new Date(
                    new Date(getEventDetails().scheduledDate).getTime() +
                      getEventDetails().duration * 60000
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`}
              </span>
            </div>

            {getEventDetails().description && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-1 font-medium">Description:</p>
                <p>{getEventDetails().description}</p>
              </div>
            )}

            <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Users size={14} className="mr-1.5" />
              <span>
                {currentGroup.members?.length || 0} attendees registered
              </span>
            </div>
          </div>

          {isCreator &&
            new Date(getEventDetails().scheduledDate) > new Date() && (
              <div className="mt-4 border-t dark:border-gray-600/50 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
                  As the event creator, you can adjust the time (but not the
                  date) of this event if needed.
                </p>
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  <Clock size={14} className="mr-1.5" />
                  Update event time
                </button>
              </div>
            )}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-md">
          <Calendar size={40} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            Event details not yet finalized.
          </p>
          {isCreator && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                As the creator, you need to specify when this study event will
                take place.
              </p>
              <button
                onClick={() => setShowSessionForm(true)}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm rounded-sm"
              >
                Set Event Details
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupSessions;
