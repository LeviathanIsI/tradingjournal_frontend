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
    <div className="p-4 sm:p-6 bg-gray-50/80 dark:bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white/90 dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-primary dark:text-primary-light" />
                Study Groups
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Collaborate and learn with other traders
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary text-white round-sm flex items-center shadow transition-colors font-medium"
            >
              <Plus size={18} className="mr-2" />
              Create Study Group
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Featured Groups Section */}
          {featuredGroups.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-amber-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Featured Groups
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredGroups.map((group) => (
                  <div
                    key={group._id}
                    className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-sm border border-primary/20 dark:border-primary/30 shadow-sm hover:shadow transition-shadow cursor-pointer"
                    onClick={() => navigate(`/study-groups/${group._id}`)}
                  >
                    <div className="absolute top-0 right-0">
                      <div className="bg-amber-500 text-xs text-white px-2 py-0.5 transform rotate-45 translate-x-2 -translate-y-1 shadow-sm">
                        Featured
                      </div>
                    </div>
                    <div className="p-4 border-b border-primary/10 dark:border-primary/20">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 flex items-center justify-center round-sm bg-gradient-to-br from-primary to-accent text-white font-bold mr-2 shadow-sm">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light truncate max-w-[250px]">
                          {group.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {group.featuredReason ||
                          group.description ||
                          "Recommended study group"}
                      </p>
                    </div>
                    <div className="p-2 bg-primary/10 dark:bg-primary/15 text-xs text-gray-700 dark:text-gray-300 flex justify-between">
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
          <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/40 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm backdrop-blur-sm">
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
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600/70 round-sm
                    bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 focus:border-transparent
                    placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 flex items-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600/60 transition-colors"
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
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 flex items-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600/60 transition-colors"
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
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 flex items-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600/60 transition-colors"
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
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 round-sm shadow-lg border border-gray-200 dark:border-gray-600/70 z-20">
                      <div className="py-1">
                        <button
                          onClick={() => handleSortChange("date")}
                          className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                            sortBy === "date"
                              ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
                          }`}
                        >
                          <Calendar size={14} className="mr-2" />
                          Date
                        </button>
                        <button
                          onClick={() => handleSortChange("name")}
                          className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                            sortBy === "name"
                              ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
                          }`}
                        >
                          <BookOpenIcon size={14} className="mr-2" />
                          Name
                        </button>
                        <button
                          onClick={() => handleSortChange("members")}
                          className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                            sortBy === "members"
                              ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
                          }`}
                        >
                          <Users size={14} className="mr-2" />
                          Members
                        </button>
                        <button
                          onClick={() => handleSortChange("activity")}
                          className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                            sortBy === "activity"
                              ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEventFilter("all")}
                        className={`px-3 py-1.5 text-sm round-sm ${
                          eventFilter === "all"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-600/70"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setEventFilter("upcoming")}
                        className={`px-3 py-1.5 text-sm round-sm ${
                          eventFilter === "upcoming"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-600/70"
                        }`}
                      >
                        Upcoming
                      </button>
                      <button
                        onClick={() => setEventFilter("past")}
                        className={`px-3 py-1.5 text-sm round-sm ${
                          eventFilter === "past"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-600/70"
                        }`}
                      >
                        Past
                      </button>
                      <button
                        onClick={() => setEventFilter("my")}
                        className={`px-3 py-1.5 text-sm round-sm ${
                          eventFilter === "my"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-600/70"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 focus:border-transparent"
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
                        className={`px-3 py-1.5 text-sm round-sm ${
                          !showPublic
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-600/70"
                        }`}
                      >
                        My Access
                      </button>
                      <button
                        onClick={() => setShowPublic(true)}
                        className={`px-3 py-1.5 text-sm round-sm ${
                          showPublic
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50 dark:hover:bg-gray-600/70"
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
            <div className="flex items-center justify-center min-h-64">
              <div className="bg-white/90 dark:bg-gray-800/80 p-5 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm backdrop-blur-sm">
                <div className="animate-pulse flex flex-col items-center space-y-3">
                  <div className="h-8 w-8 bg-primary/40 dark:bg-primary/30 rounded-full"></div>
                  <div className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    Loading study groups...
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {filteredAndSortedGroups().length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedGroups().map((group) => (
                    <div
                      key={group._id}
                      className="relative overflow-hidden bg-white/95 dark:bg-gray-800/90 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow transition-shadow cursor-pointer group"
                      onClick={() => navigate(`/study-groups/${group._id}`)}
                    >
                      {/* Header with group name */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/30">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 flex items-center justify-center round-sm bg-primary dark:bg-primary/80 text-white font-bold mr-2 shadow-sm">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light truncate max-w-[250px]">
                            {group.name}
                          </h3>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center flex-wrap gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              group.isPrivate
                                ? "bg-gray-100 dark:bg-gray-600/70 text-gray-600 dark:text-gray-200"
                                : "bg-green-100 dark:bg-green-700/30 text-green-600 dark:text-green-300"
                            }`}
                          >
                            {group.isPrivate ? "Private" : "Public"}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 dark:bg-accent/20 text-accent-dark dark:text-accent-light">
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
                          <Calendar className="h-4 w-4 mr-1.5 text-primary dark:text-primary-light flex-shrink-0" />
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
                          <Clock className="h-4 w-4 mr-1.5 text-primary dark:text-primary-light flex-shrink-0" />
                          <span className="font-medium">
                            Created by: {group.creator?.username || "Unknown"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                          {group.description || "No description provided"}
                        </p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-600/50">
                          <div className="flex flex-col items-center">
                            <div className="bg-primary/10 dark:bg-primary/15 w-full round-sm py-2 flex justify-center mb-1">
                              <Users className="h-4 w-4 text-primary dark:text-primary-light mr-1" />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {group.members?.length || 0}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Members
                            </p>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="bg-accent/10 dark:bg-accent/15 w-full round-sm py-2 flex justify-center mb-1">
                              <Calendar className="h-4 w-4 text-accent dark:text-accent-light mr-1" />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {group.sessions?.length || 0}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Sessions
                            </p>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="bg-secondary/10 dark:bg-secondary/15 w-full round-sm py-2 flex justify-center mb-1">
                              <MessageSquare className="h-4 w-4 text-secondary dark:text-secondary-light mr-1" />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {group.messages?.length || 0}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
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
                                  className="text-xs bg-primary/10 dark:bg-primary/15 text-primary-dark dark:text-primary-light px-2 py-0.5 rounded-full"
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
                <div className="text-center py-10 bg-gray-50/80 dark:bg-gray-800/40 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm backdrop-blur-sm">
                  <div className="mb-4">
                    <BookOpen
                      size={48}
                      className="mx-auto text-gray-400 dark:text-gray-500"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    No study groups found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {searchTerm ||
                    selectedCategory !== "all" ||
                    eventFilter !== "all"
                      ? "Try adjusting your filters to find more study groups."
                      : "Create a new group to get started with collaborative learning."}
                  </p>
                  <button
                    onClick={handleCreateClick}
                    className="mt-6 px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary text-white round-sm flex items-center shadow transition-colors font-medium mx-auto"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Study Group
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;
