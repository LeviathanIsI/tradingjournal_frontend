import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudyGroups } from "../../context/StudyGroupContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  UserPlus,
  BookOpen,
  MessageSquare,
  Info,
  Lock,
  Globe,
  X,
} from "lucide-react";

import {
  GroupChat,
  GroupSessions,
  GroupMembers,
  GroupInfo,
  GroupSidebar,
  InvitationModal,
  SessionModal,
} from ".";

const StudyGroupDetail = () => {
  const { id } = useParams();
  const {
    currentGroup,
    setCurrentGroup,
    loading,
    error,
    fetchStudyGroup,
    updateStudyGroup,
  } = useStudyGroups();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
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
  const modalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Initial data loading
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

  // Handle invitation submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/study-groups/${id}/invite`,
        { email: inviteEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Invitation sent successfully", "success");
      setInviteEmail("");
      setShowInviteForm(false);
      fetchStudyGroup(id); // Refresh the group data to show updated invitees
    } catch (error) {
      console.error("Failed to send invitation:", error);
      showToast("Failed to send invitation", "error");
    }
  };

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
        {/* Only show these buttons to creator or members with appropriate permissions */}
        <div className="flex space-x-2">
          {isCreator && (
            <>
              <button
                onClick={() => setShowInviteForm(true)}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-md flex items-center text-sm transition-colors"
              >
                <UserPlus size={16} className="mr-1.5" />
                Invite Members
              </button>
              <button
                onClick={() => setShowSessionForm(true)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md flex items-center text-sm transition-colors"
              >
                <Calendar size={16} className="mr-1.5" />
                Schedule Session
              </button>
            </>
          )}
          {/* Allow members to see details but not edit */}
          {isMember && !isCreator && (
            <button
              onClick={() => navigate(`/study-groups/${currentGroup._id}`)}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md flex items-center text-sm transition-colors"
            >
              <Users size={16} className="mr-1.5" />
              View Group
            </button>
          )}
        </div>
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
                <a
                  href="/study-groups/create"
                  className="underline hover:text-yellow-600 dark:hover:text-yellow-200"
                >
                  create a new study event
                </a>{" "}
                or{" "}
                <a
                  href="/study-groups"
                  className="underline hover:text-yellow-600 dark:hover:text-yellow-200"
                >
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
            <GroupChat
              groupId={id}
              currentUser={user}
              initialMessages={currentGroup.messages || []}
            />
          )}

          {activeTab === "sessions" && (
            <GroupSessions
              currentGroup={currentGroup}
              user={user}
              getEventDetails={getEventDetails}
              showSessionForm={showSessionForm}
              setShowSessionForm={setShowSessionForm}
              formatDate={formatDate}
            />
          )}

          {activeTab === "members" && (
            <GroupMembers
              currentGroup={currentGroup}
              user={user}
              isCreator={isCreator}
              isMember={isMember}
              setShowInviteForm={setShowInviteForm}
            />
          )}

          {activeTab === "info" && (
            <GroupInfo currentGroup={currentGroup} formatDate={formatDate} />
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <GroupSidebar
            currentGroup={currentGroup}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      {/* Modals */}
      <InvitationModal
        showInviteForm={showInviteForm}
        setShowInviteForm={setShowInviteForm}
        groupId={id}
      />

      <SessionModal
        showSessionForm={showSessionForm}
        setShowSessionForm={setShowSessionForm}
        currentGroup={currentGroup}
        sessionForm={sessionForm}
        setSessionForm={setSessionForm}
        handleCreateSession={handleCreateSession}
        modalRef={modalRef}
      />
    </div>
  );
};

export default StudyGroupDetail;
