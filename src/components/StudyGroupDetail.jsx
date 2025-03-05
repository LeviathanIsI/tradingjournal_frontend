import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudyGroups } from "../context/StudyGroupContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Tag,
  Send,
  UserPlus,
  BookOpen,
  MessageSquare,
  Info,
  Lock,
  Globe,
  Plus,
  CheckCircle,
  X,
} from "lucide-react";

const StudyGroupDetail = () => {
  const { id } = useParams();
  const { currentGroup, loading, error, fetchStudyGroup, updateStudyGroup } =
    useStudyGroups();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    topic: "",
    description: "",
    scheduledDate: "",
    timeOnly: "",
    duration: 60,
  });
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Add this useEffect hook near the top of your component
  useEffect(() => {
    if (id) {
      fetchStudyGroup(id);
    }
  }, [id, fetchStudyGroup]);

  const getEventDetails = () => {
    // Ensure currentGroup exists
    if (!currentGroup) return null;

    // If data is at top level, use that
    if (currentGroup.scheduledDate) {
      return {
        scheduledDate: currentGroup.scheduledDate,
        duration: currentGroup.duration,
        topic: currentGroup.topic || currentGroup.name,
        description: currentGroup.description,
      };
    }

    // Otherwise, check if it's in the sessions array
    if (currentGroup.sessions && currentGroup.sessions.length > 0) {
      const mainSession = currentGroup.sessions[0];
      return {
        scheduledDate: mainSession.scheduledDate,
        duration: mainSession.duration,
        topic: mainSession.topic || currentGroup.name,
        description: mainSession.description || currentGroup.description,
      };
    }

    // If no event details found, return null
    return null;
  };

  // When loading an existing event time
  useEffect(() => {
    if (getEventDetails()) {
      const date = new Date(getEventDetails().scheduledDate);

      // Format date properly for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

      setSessionForm((prev) => ({
        ...prev,
        topic: getEventDetails().topic || currentGroup.name,
        description: getEventDetails().description || currentGroup.description,
        scheduledDate: formattedDate, // Use formatted date string
        duration: getEventDetails().duration || 60,
        timeOnly: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      }));
    }
  }, [currentGroup]);

  // Scroll to bottom of messages when they update
  useEffect(() => {
    if (
      currentGroup?.messages?.length &&
      messagesEndRef.current &&
      activeTab === "chat"
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentGroup?.messages, activeTab]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/study-groups/${id}/messages`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the study group data to get the updated messages
      await fetchStudyGroup(id);

      // Clear the input field
      setNewMessage("");

      // Focus back on the input after sending
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Add this to your component
  useEffect(() => {
    if (currentGroup?.messages?.length) {
      console.log("Messages with senders:", currentGroup.messages);
      // Check if sender data is populated correctly
      currentGroup.messages.forEach((msg, i) => {
        console.log(`Message ${i}:`, {
          content: msg.content,
          sender: msg.sender,
          senderUsername: msg.sender?.username,
        });
      });
    }
  }, [currentGroup?.messages]);

  const handleCreateSession = async (e) => {
    e.preventDefault();

    try {
      let updatedData = {};

      if (currentGroup.scheduledDate) {
        // If editing an existing event, only update the time
        const currentDate = new Date(currentGroup.scheduledDate);
        const [hours, minutes] = sessionForm.timeOnly.split(":");

        currentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

        updatedData = {
          scheduledDate: currentDate.toISOString(),
          duration: parseInt(sessionForm.duration, 10),
        };
      } else {
        // Setting event details for the first time
        updatedData = {
          topic: sessionForm.topic,
          description: sessionForm.description,
          scheduledDate: new Date(sessionForm.scheduledDate).toISOString(),
          duration: parseInt(sessionForm.duration, 10),
        };
      }

      // Call API to update the group
      await updateStudyGroup(currentGroup._id, updatedData);

      showToast(
        currentGroup.scheduledDate ? "Event time updated" : "Event details set",
        "success"
      );
      setShowSessionForm(false);
      fetchStudyGroup(id); // Refresh the data
    } catch (error) {
      console.error("Failed to update event details:", error);
      showToast("Failed to update event details", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-blue-500 dark:bg-blue-400 rounded-md animate-spin mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">
            Loading study group...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-10 bg-red-50 dark:bg-red-800/10 rounded-md border border-red-200 dark:border-red-800/30">
          <div className="mb-4">
            <X className="h-12 w-12 mx-auto text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
            Error: {error}
          </h3>
          <button
            onClick={() => navigate("/study-groups")}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md"
          >
            Back to Study Groups
          </button>
        </div>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-600">
          <div className="mb-4">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Study group not found
          </h3>
          <button
            onClick={() => navigate("/study-groups")}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md"
          >
            Back to Study Groups
          </button>
        </div>
      </div>
    );
  }

  const isCreator = currentGroup.creator?._id === user?._id;
  const isMember = currentGroup.members?.some(
    (member) => member._id === user?._id
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/study-groups")}
            className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-2">
                {currentGroup.name}
              </h1>
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  currentGroup.isPrivate
                    ? "bg-gray-100 dark:bg-gray-600/70 text-gray-600 dark:text-gray-300 flex items-center"
                    : "bg-green-100 dark:bg-green-700/30 text-green-600 dark:text-green-300 flex items-center"
                }`}
              >
                {currentGroup.isPrivate ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </>
                )}
              </span>
            </div>
            {currentGroup.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                {currentGroup.description}
              </p>
            )}
          </div>
        </div>
        {(isCreator || isMember) && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInviteForm(true)}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-md flex items-center text-sm transition-colors"
            >
              <UserPlus size={16} className="mr-1.5" />
              Invite Members
            </button>
            {isCreator && (
              <button
                onClick={() => setShowSessionForm(true)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md flex items-center text-sm transition-colors"
              >
                <Calendar size={16} className="mr-1.5" />
                Schedule Session
              </button>
            )}
          </div>
        )}
      </div>

      {getEventDetails() &&
        new Date(getEventDetails().scheduledDate) < new Date() && (
          <div
            className="mb-6 px-4 py-3 rounded-sm bg-yellow-50 dark:bg-yellow-900/20 
                border border-yellow-200 dark:border-yellow-800/30 
                text-yellow-800 dark:text-yellow-300 flex items-center"
          >
            <Clock className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">This event has already passed</p>
              <p className="text-sm mt-1">
                Would you like to{" "}
                <a href="/study-groups/create" className="underline">
                  create a new study event
                </a>
                or{" "}
                <a href="/study-groups" className="underline">
                  browse upcoming events
                </a>
                ?
              </p>
            </div>
          </div>
        )}

      {/* Navigation tabs */}
      <div className="border-b border-gray-200 dark:border-gray-600/50 mb-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-2 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === "chat"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <MessageSquare size={16} className="mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-2 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === "sessions"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Calendar size={16} className="mr-2" />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`py-2 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === "members"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Users size={16} className="mr-2" />
            Members
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === "info"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Info size={16} className="mr-2" />
            Info
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="md:col-span-2">
          {activeTab === "chat" && (
            <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b dark:border-gray-600/50 bg-gray-50 dark:bg-gray-600/40">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <MessageSquare
                    size={18}
                    className="mr-2 text-blue-500 dark:text-blue-400"
                  />
                  Group Chat
                </h2>
              </div>

              {/* Messages area with scrolling */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/30">
                {currentGroup.messages?.length > 0 ? (
                  currentGroup.messages.map((message, index) => {
                    const isCurrentUser =
                      String(message.sender?._id) === String(user?._id);
                    return (
                      <div
                        key={index}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            isCurrentUser
                              ? "bg-blue-500 text-white"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="font-medium text-sm mb-1 flex items-center">
                              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs mr-2">
                                {message.sender?.username
                                  ?.charAt(0)
                                  .toUpperCase() || "?"}
                              </div>
                              {message.sender?.username || "Unknown User"}
                            </div>
                          )}
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-75 mt-1 text-right">
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MessageSquare
                        size={40}
                        className="mx-auto mb-2 text-gray-400 dark:text-gray-500"
                      />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t dark:border-gray-600/50 bg-white dark:bg-gray-700">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 dark:bg-gray-600/50 rounded-l-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !newMessage.trim()}
                    className="px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-r-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    {isSendingMessage ? (
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
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
                        {new Date(
                          getEventDetails().scheduledDate
                        ).toLocaleDateString([], {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock size={14} className="mr-1.5" />
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">
                        {new Date(
                          getEventDetails().scheduledDate
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {getEventDetails().duration &&
                          ` - ${new Date(
                            new Date(
                              getEventDetails().scheduledDate
                            ).getTime() +
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
                          As the event creator, you can adjust the time (but not
                          the date) of this event if needed.
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
                        As the creator, you need to specify when this study
                        event will take place.
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
          )}

          {activeTab === "members" && (
            <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
                  Members ({currentGroup.members?.length || 0})
                </h2>
                {(isCreator || isMember) && (
                  <button
                    onClick={() => setShowInviteForm(true)}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-md flex items-center text-sm transition-colors"
                  >
                    <UserPlus size={16} className="mr-1.5" />
                    Invite
                  </button>
                )}
              </div>

              {currentGroup.members?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentGroup.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/30"
                    >
                      <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                        {member.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {member.username}
                        </p>
                        {member._id === currentGroup.creator?._id && (
                          <p className="text-xs text-blue-500 dark:text-blue-400 flex items-center">
                            <CheckCircle size={12} className="mr-1" />
                            Group Creator
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-md">
                  <Users size={40} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No members yet.
                  </p>
                </div>
              )}

              {currentGroup.invitees?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Pending Invitations
                  </h3>
                  <div className="space-y-2">
                    {currentGroup.invitees.map((invite) => (
                      <div
                        key={invite.user._id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/30"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-md bg-gray-400 flex items-center justify-center text-white font-bold mr-3">
                            {invite.user.username?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <span className="text-gray-900 dark:text-gray-100">
                            {invite.user.email}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-700/30 text-yellow-800 dark:text-yellow-300 rounded-md">
                          {invite.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "info" && (
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
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          {/* Group details sidebar */}
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
        </div>
      </div>

      {/* Invitation Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-gray-700/60 rounded-sm p-4 sm:p-6 w-full max-w-md 
      border border-gray-200 dark:border-gray-600/50 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Invite Member
              </h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600/70 
          text-gray-500 dark:text-gray-400"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
            bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
            bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 
            hover:bg-gray-50 dark:hover:bg-gray-600/70 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-sm 
            hover:bg-blue-700 dark:hover:bg-blue-500 text-sm sm:text-base"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Creation/Edit Modal */}
      {showSessionForm && (
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
                  You can only update the time of this event. To change the
                  date, you would need to create a new study group.
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
                      new Date(currentGroup.scheduledDate).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit", hour12: false }
                      )
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
                  {currentGroup.scheduledDate
                    ? "Update Time"
                    : "Schedule Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetail;
