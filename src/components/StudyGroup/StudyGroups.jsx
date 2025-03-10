import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyGroups } from "../../context/StudyGroupContext";
import {
  Search,
  Users,
  Plus,
  Tag,
  Calendar,
  MessageSquare,
  BookOpen,
  Clock,
  Star,
  Filter,
  ChevronDown,
  SortAsc,
  SortDesc,
  BookOpen as BookOpenIcon,
  BarChart2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "stocks", label: "Stocks" },
  { value: "options", label: "Options" },
  { value: "futures", label: "Futures" },
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
  { value: "technical_analysis", label: "Technical Analysis" },
  { value: "fundamental_analysis", label: "Fundamental Analysis" },
  { value: "risk_management", label: "Risk Management" },
  { value: "psychology", label: "Trading Psychology" },
  { value: "general", label: "General Trading" },
  { value: "other", label: "Other" },
];

const StudyGroups = () => {
  const { loading, studyGroups, fetchStudyGroups } = useStudyGroups();
  const [showPublic, setShowPublic] = useState(true); // Default to showing public groups
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [eventFilter, setEventFilter] = useState("all"); // Default to showing all events

  const navigate = useNavigate();
  const dataFetchedRef = useRef(false);
  const { user } = useAuth();
  const sortMenuRef = useRef(null);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      fetchStudyGroups(true); // Always include public groups on initial load
    }
  }, [fetchStudyGroups]);

  useEffect(() => {
    fetchStudyGroups(showPublic);
  }, [showPublic, fetchStudyGroups]);

  const handleCreateClick = () => {
    navigate("/study-groups/create");
  };

  const toggleSortMenu = () => {
    setShowSortMenu(!showSortMenu);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setShowSortMenu(false);
  };

  // Filter and sort the study groups
  const filteredAndSortedGroups = () => {
    if (!studyGroups) return [];

    // Filter by search term, category, and event type
    let filtered = studyGroups.filter((group) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.tags &&
          group.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory !== "all" && group.category !== selectedCategory) {
        return false;
      }

      // Event filter
      const eventDate = getEventDate(group)
        ? new Date(getEventDate(group))
        : null;
      const now = new Date();

      // Skip date filtering if "all" is selected
      if (eventFilter === "all") {
        // No date filtering
      } else if (eventFilter === "upcoming" && eventDate && eventDate < now) {
        return false;
      } else if (eventFilter === "past" && (!eventDate || eventDate >= now)) {
        return false;
      } else if (
        eventFilter === "my" &&
        !group.members?.some(
          (member) =>
            member._id === user?._id ||
            member.user?._id === user?._id ||
            (member.user &&
              member.user.toString &&
              member.user.toString() === user?._id)
        )
      ) {
        return false;
      }

      return true;
    });

    // Sort the filtered groups
    return filtered.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "members":
          return (
            direction * ((a.members?.length || 0) - (b.members?.length || 0))
          );
        case "activity":
          const aActivity = a.lastActive || a.updatedAt || a.createdAt;
          const bActivity = b.lastActive || b.updatedAt || b.createdAt;
          return direction * (new Date(aActivity) - new Date(bActivity));
        case "date":
        default:
          const aDate = getEventDate(a) || a.createdAt;
          const bDate = getEventDate(b) || b.createdAt;
          return direction * (new Date(aDate) - new Date(bDate));
      }
    });
  };

  // Get featured groups
  const featuredGroups = studyGroups?.filter((group) => group.isFeatured) || [];

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

      {/* Featured Groups Section */}
      {featuredGroups.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Featured Groups
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredGroups.map((group) => (
              <div
                key={group._id}
                className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-sm border border-blue-200 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/study-groups/${group._id}`)}
              >
                <div className="absolute top-0 right-0">
                  <div className="bg-yellow-400 text-xs text-white px-2 py-1 transform rotate-45 translate-x-2 -translate-y-1 shadow-sm">
                    Featured
                  </div>
                </div>
                <div className="p-4 border-b border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold mr-2">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-base font-semibold text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[250px]">
                      {group.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {group.featuredReason ||
                      group.description ||
                      "Recommended study group"}
                  </p>
                </div>
                <div className="p-2 bg-blue-100/50 dark:bg-blue-800/20 text-xs text-blue-800 dark:text-blue-300 flex justify-between">
                  <span className="flex items-center">
                    <Users size={12} className="mr-1" />
                    {group.members?.length || 0} members
                  </span>
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {getEventDate(group)
                      ? new Date(getEventDate(group)).toLocaleDateString()
                      : "No date set"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center shadow-sm"
            >
              <Filter size={16} className="mr-1.5" />
              Filters
              <ChevronDown
                size={16}
                className={`ml-1 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Sort direction button - separate from sort menu */}
            <button
              onClick={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center shadow-sm"
            >
              {sortDirection === "asc" ? (
                <SortAsc size={16} />
              ) : (
                <SortDesc size={16} />
              )}
            </button>

            {/* Sort type button with dropdown menu */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={toggleSortMenu}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center shadow-sm"
              >
                Sort:{" "}
                {sortBy === "date"
                  ? "Date"
                  : sortBy === "name"
                  ? "Name"
                  : sortBy === "members"
                  ? "Members"
                  : "Activity"}
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${
                    showSortMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => handleSortChange("date")}
                      className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                        sortBy === "date"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Calendar size={14} className="mr-2" />
                      Date
                    </button>
                    <button
                      onClick={() => handleSortChange("name")}
                      className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                        sortBy === "name"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <BookOpenIcon size={14} className="mr-2" />
                      Name
                    </button>
                    <button
                      onClick={() => handleSortChange("members")}
                      className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                        sortBy === "members"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Users size={14} className="mr-2" />
                      Members
                    </button>
                    <button
                      onClick={() => handleSortChange("activity")}
                      className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                        sortBy === "activity"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <MessageSquare size={14} className="mr-2" />
                      Activity
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEventFilter("all")}
                    className={`px-3 py-1.5 text-sm rounded ${
                      eventFilter === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setEventFilter("upcoming")}
                    className={`px-3 py-1.5 text-sm rounded ${
                      eventFilter === "upcoming"
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setEventFilter("past")}
                    className={`px-3 py-1.5 text-sm rounded ${
                      eventFilter === "past"
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    Past
                  </button>
                  <button
                    onClick={() => setEventFilter("my")}
                    className={`px-3 py-1.5 text-sm rounded ${
                      eventFilter === "my"
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    My Groups
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibility
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPublic(false)}
                    className={`px-3 py-1.5 text-sm rounded ${
                      !showPublic
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    My Access
                  </button>
                  <button
                    onClick={() => setShowPublic(true)}
                    className={`px-3 py-1.5 text-sm rounded ${
                      showPublic
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    Public
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-blue-500 dark:bg-blue-400 rounded-md animate-spin mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">
              Loading study groups...
            </p>
          </div>
        </div>
      ) : (
        <>
          {filteredAndSortedGroups().length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedGroups().map((group) => (
                <div
                  key={group._id}
                  className="relative overflow-hidden bg-white dark:bg-gray-700/60 rounded-sm border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
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

                      {group.category &&
                        group.category !== "general" &&
                        group.category !== "other" && (
                          <span className="px-2 py-1 rounded-sm text-xs font-medium bg-purple-100 dark:bg-purple-700/30 text-purple-600 dark:text-purple-300">
                            {group.category
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        )}
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
                {searchTerm ||
                selectedCategory !== "all" ||
                eventFilter !== "all"
                  ? "Try adjusting your filters"
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
