import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyGroups } from "../context/StudyGroupContext";
import {
  Search,
  Users,
  Plus,
  Tag,
  Calendar,
  MessageSquare,
  BookOpen,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const StudyGroups = () => {
  const { loading, studyGroups, fetchStudyGroups } = useStudyGroups();
  const [showPublic, setShowPublic] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dataFetchedRef = useRef(false);
  const { user } = useAuth();
  const [eventFilter, setEventFilter] = useState("upcoming");

  // Helper function to get event date consistently
  const getEventDate = (group) => {
    return group.scheduledDate
      ? group.scheduledDate
      : group.sessions && group.sessions.length > 0
      ? group.sessions[0].scheduledDate
      : null;
  };

  useEffect(() => {
    if (!dataFetchedRef.current) {
      dataFetchedRef.current = true;
      fetchStudyGroups(showPublic);
    }
  }, [fetchStudyGroups]);

  useEffect(() => {
    fetchStudyGroups(showPublic);
  }, [showPublic, fetchStudyGroups]);

  const handleCreateClick = () => {
    navigate("/study-groups/create");
  };

  // Update the filteredGroups logic
  const filteredGroups =
    studyGroups?.filter((group) => {
      // First apply the search term filter
      const matchesSearch =
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.tags &&
          group.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      // Then apply the event filter
      if (!matchesSearch) return false;

      const eventDate = getEventDate(group)
        ? new Date(getEventDate(group))
        : null;
      const now = new Date();

      if (eventFilter === "upcoming" && eventDate && eventDate < now)
        return false;
      if (eventFilter === "past" && (!eventDate || eventDate >= now))
        return false;
      if (
        eventFilter === "my" &&
        !group.members?.some((member) => member._id === user?._id)
      )
        return false;

      return true;
    }) || [];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-blue-500 dark:text-blue-400" />
            Study Groups
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Collaborate and learn with other traders
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2.5 sm:py-2 rounded-sm flex items-center transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Create Study Group
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 
              focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
              placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
          />
        </div>
        <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-600/50">
          <button
            onClick={() => setEventFilter("upcoming")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              eventFilter === "upcoming"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setEventFilter("past")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              eventFilter === "past"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Past Events
          </button>
          <button
            onClick={() => setEventFilter("my")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              eventFilter === "my"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            My Events
          </button>
        </div>
        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 bg-white dark:bg-gray-600/50 rounded-sm border-gray-300 dark:border-gray-600/70 focus:ring-blue-500 dark:focus:ring-blue-400"
              checked={showPublic}
              onChange={() => setShowPublic(!showPublic)}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Show public groups
            </span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-blue-500 dark:bg-blue-400 rounded-sm animate-spin mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">
              Loading study groups...
            </p>
          </div>
        </div>
      ) : (
        <>
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <div
                  key={group._id}
                  className="relative overflow-hidden bg-white dark:bg-gray-700/60 rounded-sm border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/study-groups/${group._id}`)}
                >
                  {/* Header with group name */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-600/50 bg-gray-50 dark:bg-gray-600/40">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-500 dark:bg-blue-500/80 text-white font-bold mr-2">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-300 truncate max-w-[250px]">
                        {group.name}
                      </h3>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-sm text-xs font-medium ${
                          group.isPrivate
                            ? "bg-gray-100 dark:bg-gray-600/70 text-gray-600 dark:text-gray-200"
                            : "bg-green-100 dark:bg-green-700/30 text-green-600 dark:text-green-300"
                        }`}
                      >
                        {group.isPrivate ? "Private" : "Public"}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-sm text-xs font-medium ${
                          getEventDate(group) &&
                          new Date(getEventDate(group)) < new Date()
                            ? "bg-gray-100 dark:bg-gray-600/70 text-gray-600 dark:text-gray-300"
                            : "bg-green-100 dark:bg-green-700/30 text-green-600 dark:text-green-300"
                        }`}
                      >
                        {getEventDate(group) &&
                        new Date(getEventDate(group)) < new Date()
                          ? "Past Event"
                          : "Upcoming"}
                      </span>
                    </div>
                  </div>

                  {/* Group body */}
                  <div className="p-4">
                    {/* Add event date/time info */}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <Calendar className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                      <span>
                        {getEventDate(group)
                          ? `${new Date(
                              getEventDate(group)
                            ).toLocaleDateString()} at ${new Date(
                              getEventDate(group)
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "Date not specified"}
                      </span>
                    </div>

                    {/* Creator info */}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <Clock className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                      <span className="font-medium">
                        Created by: {group.creator?.username || "Unknown"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                      {group.description || "No description provided"}
                    </p>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-100 dark:border-gray-600/50">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-50 dark:bg-blue-700/20 w-full rounded-sm py-2 flex justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-500 dark:text-blue-300 mr-1" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {group.members?.length || 0}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          Members
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="bg-purple-50 dark:bg-purple-700/20 w-full rounded-sm py-2 flex justify-center mb-1">
                          <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-300 mr-1" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {group.sessions?.length || 0}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          Sessions
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="bg-green-50 dark:bg-green-700/20 w-full rounded-sm py-2 flex justify-center mb-1">
                          <MessageSquare className="h-4 w-4 text-green-500 dark:text-green-300 mr-1" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {group.messages?.length || 0}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          Messages
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {group.tags && group.tags.length > 0 && (
                      <div className="mt-3 flex items-start">
                        <Tag className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {group.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 dark:bg-blue-700/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-sm border border-gray-200 dark:border-gray-600">
              <div className="mb-4">
                <BookOpen size={40} className="mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No study groups found
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create a new group to get started with collaborative learning"}
                .
              </p>
              <button
                onClick={handleCreateClick}
                className="mt-4 px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-sm flex items-center mx-auto"
              >
                <Plus size={18} className="mr-2" />
                Create Study Group
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudyGroups;
