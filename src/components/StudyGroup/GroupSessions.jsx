import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, GlobeIcon, CalendarClock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatInTimeZone } from "date-fns-tz";
import { differenceInSeconds, addMinutes } from "date-fns";
import { getUserFriendlyTimezone } from "../../utils/timezones";

const GroupSessions = ({
  currentGroup,
  user,
  getEventDetails,
  showSessionForm,
  setShowSessionForm,
  formatDate,
}) => {
  const isCreator = currentGroup.creator?._id === user?._id;
  const { user: authUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");
  const [userTimezone, setUserTimezone] = useState("America/New_York");
  const [userRsvpStatus, setUserRsvpStatus] = useState(null);

  // Set up user's timezone
  useEffect(() => {
    if (authUser?.preferences?.timeZone) {
      setUserTimezone(authUser.preferences.timeZone);
    } else if (currentGroup.timezone) {
      setUserTimezone(currentGroup.timezone);
    }
  }, [authUser, currentGroup]);

  // Initialize RSVP status
  useEffect(() => {
    if (getEventDetails()) {
      const initialStatus = getUserRsvpStatus();
      setUserRsvpStatus(initialStatus);
    }
  }, [getEventDetails, currentGroup]);

  // Format date with user's timezone
  const formatDateWithTimezone = (date, format = "MM/dd/yyyy hh:mm a") => {
    if (!date) return "";
    return formatInTimeZone(new Date(date), userTimezone, format);
  };

  // Countdown timer for the next session
  useEffect(() => {
    if (
      !getEventDetails() ||
      new Date(getEventDetails().scheduledDate) < new Date()
    ) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const eventDate = new Date(getEventDetails().scheduledDate);
      const diff = differenceInSeconds(eventDate, now);

      if (diff <= 0) {
        setTimeLeft("Event has started!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = diff % 60;

      let timeString = "";
      if (days > 0) timeString += `${days}d `;
      if (hours > 0) timeString += `${hours}h `;
      if (minutes > 0) timeString += `${minutes}m `;
      timeString += `${seconds}s`;

      setTimeLeft(timeString);
    }, 1000);

    return () => clearInterval(interval);
  }, [getEventDetails]);

  // Function to handle RSVP status
  const handleRsvp = async (status) => {
    // Update local state immediately for responsive UI
    setUserRsvpStatus(status);

    try {
      // Make API call to update RSVP status
      const response = await fetch(
        `http://localhost:5000/api/study-groups/${currentGroup._id}/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      // Handle non-OK responses
      if (!response.ok) {
        // Try to parse error message if available
        let errorMessage = "Failed to update RSVP status";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = await response.json();

      // Update the local state with the confirmed status from the server
      // This ensures UI is in sync with the database
      if (data.success && data.data) {
        // Find the user's updated RSVP in the returned data
        const updatedAttendee = data.data.find((attendee) => {
          const attendeeId =
            typeof attendee.user === "object"
              ? attendee.user._id
              : attendee.user;
          const userId = typeof user === "object" ? user._id : user;
          return attendeeId.toString() === userId.toString();
        });

        if (updatedAttendee) {
          setUserRsvpStatus(updatedAttendee.status);
        }
      }
    } catch (error) {
      // If API call fails, revert to previous status
      console.error("Failed to update RSVP status:", error);
      // Revert state to the previous value if the API call fails
      setUserRsvpStatus(getUserRsvpStatus());
    }
  };

  // Get user's current RSVP status
  const getUserRsvpStatus = () => {
    // If no event details, return null
    if (!getEventDetails()) return null;

    // Get the session
    const session = getEventDetails();

    // If no attendees in the session, return null
    if (
      !session.attendees ||
      !Array.isArray(session.attendees) ||
      session.attendees.length === 0
    ) {
      return null;
    }

    // Find the user in the attendees
    const userRsvp = session.attendees.find((attendee) => {
      // Get attendee ID - handle both string IDs and object references
      const attendeeId =
        typeof attendee.user === "object" ? attendee.user._id : attendee.user;

      // Get user ID - handle both string IDs and object references
      const userId = typeof user === "object" ? user._id : user;

      // Compare as strings to avoid reference comparison issues
      return attendeeId.toString() === userId.toString();
    });
    
    return userRsvp ? userRsvp.status : null;
  };

  // Get event times in user's timezone
  const getEventTimes = () => {
    if (!getEventDetails()) return { start: "", end: "" };

    const startDate = new Date(getEventDetails().scheduledDate);
    const endDate = addMinutes(startDate, getEventDetails().duration || 60);

    return {
      start: formatDateWithTimezone(startDate, "h:mm a"),
      end: formatDateWithTimezone(endDate, "h:mm a"),
      date: formatDateWithTimezone(startDate, "EEEE, MMMM d, yyyy"),
    };
  };

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

          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
            <GlobeIcon size={12} className="mr-1" />
            All times shown in {getUserFriendlyTimezone(userTimezone)}
          </div>

          {/* Countdown timer for upcoming events */}
          {new Date(getEventDetails().scheduledDate) > new Date() && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center text-blue-700 dark:text-blue-300 font-medium">
                <CalendarClock size={16} className="mr-2" />
                Starting in: {timeLeft}
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={14} className="mr-1.5" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{getEventTimes().date}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock size={14} className="mr-1.5" />
              <span className="font-medium">Time:</span>
              <span className="ml-2">
                {getEventTimes().start} - {getEventTimes().end}
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

          {/* RSVP section for upcoming events */}
          {new Date(getEventDetails().scheduledDate) > new Date() && (
            <div className="mt-4 pt-4 border-t dark:border-gray-600/50">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Will you attend this event?
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRsvp("attending")}
                  className={`px-3 py-1.5 text-sm rounded-sm flex items-center transition-colors ${
                    userRsvpStatus === "attending"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleRsvp("maybe")}
                  className={`px-3 py-1.5 text-sm rounded-sm flex items-center transition-colors ${
                    userRsvpStatus === "maybe"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Maybe
                </button>
                <button
                  onClick={() => handleRsvp("not_attending")}
                  className={`px-3 py-1.5 text-sm rounded-sm flex items-center transition-colors ${
                    userRsvpStatus === "not_attending"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Calendar integration */}
          {new Date(getEventDetails().scheduledDate) > new Date() && (
            <div className="mt-4 pt-4 border-t dark:border-gray-600/50">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Add to Calendar
              </h4>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    // This would generate a Google Calendar link with event details
                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      currentGroup.name
                    )}&details=${encodeURIComponent(
                      getEventDetails().description || ""
                    )}&dates=${new Date(getEventDetails().scheduledDate)
                      .toISOString()
                      .replace(/-|:|\.\d+/g, "")}/${addMinutes(
                      new Date(getEventDetails().scheduledDate),
                      getEventDetails().duration
                    )
                      .toISOString()
                      .replace(/-|:|\.\d+/g, "")}`;
                    window.open(googleCalendarUrl, "_blank");
                  }}
                >
                  Google Calendar
                </button>
                <button
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    // Generate iCal format and trigger download
                    alert("iCal export would be implemented here");
                  }}
                >
                  iCal/Outlook
                </button>
              </div>
            </div>
          )}

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
