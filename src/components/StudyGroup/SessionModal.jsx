import React from "react";
import {
  X,
  Info,
  Clock,
  Calendar,
  AlertCircle,
  CalendarCheck,
  Timer,
} from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
      <div
        ref={modalRef}
        className="bg-white/95 dark:bg-gray-800/95 rounded-lg p-5 w-full max-w-md 
        border border-gray-200 dark:border-gray-700/60 shadow-lg animate-[scaleIn_0.2s_ease-out] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            {currentGroup.scheduledDate ? (
              <>
                <Clock className="mr-2 h-5 w-5 text-primary dark:text-primary-light" />
                Update Event Time
              </>
            ) : (
              <>
                <CalendarCheck className="mr-2 h-5 w-5 text-primary dark:text-primary-light" />
                Set Event Details
              </>
            )}
          </h3>
          <button
            onClick={() => setShowSessionForm(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/70 
            text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info alert for update mode */}
        {currentGroup.scheduledDate && (
          <div className="mb-5 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg text-sm text-primary-dark dark:text-primary-light border border-primary/10 dark:border-primary/20">
            <p className="flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                You can only update the time of this event. To change the date,
                you would need to create a new study group.
              </span>
            </p>
          </div>
        )}

        <form onSubmit={handleCreateSession} className="space-y-5">
          {!currentGroup.scheduledDate && (
            <>
              {/* Topic field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Topic
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={sessionForm.topic}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        topic: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md 
                    bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent
                    transition-colors"
                    placeholder="Main topic of discussion"
                    required
                  />
                </div>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md 
                  bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent
                  transition-colors"
                  placeholder="Describe what will be covered in this session"
                  rows="3"
                />
              </div>
            </>
          )}

          {!currentGroup.scheduledDate ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date and Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="datetime-local"
                  value={sessionForm.scheduledDate}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      scheduledDate: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md 
                  bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent
                  transition-colors"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="time"
                  value={
                    sessionForm.timeOnly ||
                    new Date(currentGroup.scheduledDate).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )
                  }
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      timeOnly: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md 
                  bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent
                  transition-colors"
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Event date:{" "}
                {new Date(currentGroup.scheduledDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Duration field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Duration (minutes)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Timer className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="number"
                value={sessionForm.duration}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, duration: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent
                transition-colors"
                min="15"
                max="240"
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Recommended: 30-90 minutes
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/40 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowSessionForm(false)}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md 
              bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 
              hover:bg-gray-50 dark:hover:bg-gray-600/70 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-md
              shadow-sm transition-colors text-sm font-medium flex items-center justify-center"
            >
              {currentGroup.scheduledDate ? (
                <>
                  <Clock className="mr-1.5 h-4 w-4" />
                  Update Time
                </>
              ) : (
                <>
                  <CalendarCheck className="mr-1.5 h-4 w-4" />
                  Schedule Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
