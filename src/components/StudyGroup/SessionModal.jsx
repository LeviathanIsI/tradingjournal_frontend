import React from "react";
import { X, Info } from "lucide-react";

const SessionModal = ({
  showSessionForm,
  setShowSessionForm,
  currentGroup,
  sessionForm,
  setSessionForm,
  handleCreateSession,
  modalRef,
}) => {
  if (!showSessionForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-700/60 rounded-sm p-4 sm:p-6 w-full max-w-md 
        border border-gray-200 dark:border-gray-600/50 shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {currentGroup.scheduledDate
              ? "Update Event Time"
              : "Set Event Details"}
          </h3>
          <button
            onClick={() => setShowSessionForm(false)}
            className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600/70 
            text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {currentGroup.scheduledDate && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
            <p className="flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              You can only update the time of this event. To change the date,
              you would need to create a new study group.
            </p>
          </div>
        )}

        <form onSubmit={handleCreateSession} className="space-y-4">
          {!currentGroup.scheduledDate && (
            <>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={sessionForm.topic}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      topic: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                  bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  placeholder="Main topic of discussion"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={sessionForm.description}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                  bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  placeholder="Describe what will be covered in this session"
                  rows="3"
                />
              </div>
            </>
          )}

          {!currentGroup.scheduledDate ? (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Date and Time
              </label>
              <input
                type="datetime-local"
                value={sessionForm.scheduledDate}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    scheduledDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={
                  sessionForm.timeOnly ||
                  new Date(currentGroup.scheduledDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                }
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    timeOnly: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Event date:{" "}
                {new Date(currentGroup.scheduledDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={sessionForm.duration}
              onChange={(e) =>
                setSessionForm({ ...sessionForm, duration: e.target.value })
              }
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
              min="15"
              max="240"
              required
            />
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setShowSessionForm(false)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
              bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 
              hover:bg-gray-50 dark:hover:bg-gray-600/70 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-sm 
              hover:bg-blue-700 dark:hover:bg-blue-500 text-sm sm:text-base flex items-center justify-center"
            >
              {currentGroup.scheduledDate ? "Update Time" : "Schedule Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
