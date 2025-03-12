import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  GlobeIcon,
  CalendarClock,
  CheckCircle,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  Edit,
  ExternalLink,
  Calendar as CalendarIcon,
  Check,
} from "lucide-react";
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

  // Get event status
  const getEventStatus = () => {
    if (!getEventDetails()) return null;

    const eventDate = new Date(getEventDetails().scheduledDate);
    const now = new Date();

    if (eventDate < now) {
      return "past";
    } else {
      // Check if event is starting soon (within 1 hour)
      const diffInSeconds = differenceInSeconds(eventDate, now);
      if (diffInSeconds < 3600) {
        // less than 1 hour
        return "imminent";
      } else {
        return "upcoming";
      }
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = () => {
    const status = getEventStatus();
    switch (status) {
      case "past":
        return "bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300";
      case "imminent":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
      case "upcoming":
      default:
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    }
  };

  // Get status badge text
  const getStatusBadgeText = () => {
    const status = getEventStatus();
    switch (status) {
      case "past":
        return "Past Event";
      case "imminent":
        return "Starting Soon";
      case "upcoming":
      default:
        return "Upcoming";
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary dark:text-primary-light" />
            Event Details
          </h2>
          {isCreator && !getEventDetails() && (
            <button
              onClick={() => setShowSessionForm(true)}
              className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center text-sm transition-colors font-medium shadow-sm"
            >
              <CalendarPlus size={16} className="mr-1.5" />
              Set Event Details
            </button>
          )}
          {isCreator && getEventDetails() && (
            <button
              onClick={() => setShowSessionForm(true)}
              className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center text-sm transition-colors font-medium shadow-sm"
            >
              <Edit size={16} className="mr-1.5" />
              Update Event
            </button>
          )}
        </div>
      </div>

      {getEventDetails() ? (
        <div className="p-5">
          <div className="bg-white dark:bg-gray-700/40 rounded-lg border border-gray-200/70 dark:border-gray-600/40 p-5">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                {currentGroup.name} Study Event
              </h3>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle()}`}
              >
                {getStatusBadgeText()}
              </span>
            </div>

            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
              <GlobeIcon size={12} className="mr-1" />
              All times shown in {getUserFriendlyTimezone(userTimezone)}
            </div>

            {/* Countdown timer for upcoming events */}
            {getEventStatus() !== "past" && (
              <div className="mb-5 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10 dark:border-primary/20">
                <div className="flex items-center text-primary-dark dark:text-primary-light font-medium">
                  <CalendarClock size={18} className="mr-2 flex-shrink-0" />
                  <span className="mr-2">Starting in:</span>
                  <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-md font-mono text-primary">
                    {timeLeft}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <Calendar
                    size={16}
                    className="text-primary dark:text-primary-light"
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Date
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {getEventTimes().date}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <Clock
                    size={16}
                    className="text-primary dark:text-primary-light"
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Time
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {getEventTimes().start} - {getEventTimes().end}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <Users
                    size={16}
                    className="text-primary dark:text-primary-light"
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Attendees
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentGroup.members?.length || 0} registered
                  </p>
                </div>
              </div>
            </div>

            {getEventDetails().description && (
              <div className="mt-5 p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg border border-gray-200/70 dark:border-gray-600/40">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getEventDetails().description}
                </p>
              </div>
            )}

            {/* RSVP section for upcoming events */}
            {getEventStatus() !== "past" && (
              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700/40">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <CheckCircle
                    size={16}
                    className="mr-2 text-gray-500 dark:text-gray-400"
                  />
                  WILL YOU ATTEND THIS EVENT?
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRsvp("attending")}
                    className={`px-4 py-2 text-sm rounded-md flex items-center transition-colors ${
                      userRsvpStatus === "attending"
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <CalendarCheck size={16} className="mr-1.5" />
                    Yes, I'll attend
                  </button>
                  <button
                    onClick={() => handleRsvp("maybe")}
                    className={`px-4 py-2 text-sm rounded-md flex items-center transition-colors ${
                      userRsvpStatus === "maybe"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Calendar size={16} className="mr-1.5" />
                    Maybe
                  </button>
                  <button
                    onClick={() => handleRsvp("not_attending")}
                    className={`px-4 py-2 text-sm rounded-md flex items-center transition-colors ${
                      userRsvpStatus === "not_attending"
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <CalendarX size={16} className="mr-1.5" />
                    No, I can't make it
                  </button>
                </div>
              </div>
            )}

            {/* Calendar integration */}
            {getEventStatus() !== "past" && (
              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700/40">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <CalendarIcon
                    size={16}
                    className="mr-2 text-gray-500 dark:text-gray-400"
                  />
                  ADD TO YOUR CALENDAR
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 text-sm bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600/70 transition-colors flex items-center"
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
                    <ExternalLink size={16} className="mr-1.5" />
                    Google Calendar
                  </button>
                  <button
                    className="px-4 py-2 text-sm bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600/70 transition-colors flex items-center"
                    onClick={() => {
                      // Generate iCal format and trigger download
                      alert("iCal export would be implemented here");
                    }}
                  >
                    <ExternalLink size={16} className="mr-1.5" />
                    iCal/Outlook
                  </button>
                </div>
              </div>
            )}

            {isCreator && getEventStatus() !== "past" && (
              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700/40">
                <div className="bg-amber-50/60 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-100 dark:border-amber-900/20 text-amber-800 dark:text-amber-300">
                  <p className="text-xs italic flex items-start">
                    <Info size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                    <span>
                      As the event creator, you can adjust the details of this
                      event if needed.
                    </span>
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => setShowSessionForm(true)}
                    className="text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter flex items-center"
                  >
                    <Edit size={14} className="mr-1.5" />
                    Update event details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="bg-white dark:bg-gray-700/40 rounded-lg border border-gray-200/70 dark:border-gray-600/40 p-5 py-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/70 flex items-center justify-center mb-4">
              <Calendar
                size={32}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Event Scheduled
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              Event details have not been finalized yet.
            </p>

            {isCreator && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  As the creator, you can set when this study event will take
                  place.
                </p>
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-md shadow-sm flex items-center mx-auto"
                >
                  <CalendarPlus size={16} className="mr-1.5" />
                  Set Event Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSessions;
