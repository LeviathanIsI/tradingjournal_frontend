import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  CheckCircle,
  Search,
  Shield,
  Activity,
  UserMinus,
  Settings,
  ChevronDown,
  Clock,
  MessagesSquare,
  CalendarDays,
  Filter,
  X,
  Mail,
} from "lucide-react";

const GroupMembers = ({
  currentGroup,
  user,
  isCreator,
  isMember,
  setShowInviteForm,
  formatDate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberActions, setShowMemberActions] = useState({});
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [sortOption, setSortOption] = useState("joined");
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Function to format the member list from the currentGroup data
  useEffect(() => {
    if (!currentGroup.members) return;

    // Convert simple members array to rich format with roles
    const membersList = currentGroup.members.map((member) => {
      // Check if this is already using the rich format or needs conversion
      if (member.user) {
        return member;
      } else {
        // Create an enhanced member object with role and activity stats
        return {
          user: member,
          role: member._id === currentGroup.creator?._id ? "creator" : "member",
          joinedAt: currentGroup.createdAt,
          activityStats: {
            messagesCount: Math.floor(Math.random() * 20), // Placeholder data
            sessionsAttended: Math.floor(Math.random() * 5), // Placeholder data
            lastActive: new Date(Date.now() - Math.random() * 10000000000), // Random recent date
          },
        };
      }
    });

    setMembers(membersList);
    setFilteredMembers(membersList);
  }, [currentGroup]);

  // Handle search and filtering
  useEffect(() => {
    if (!members.length) return;

    const results = members.filter((member) => {
      const username = member.user?.username || "";
      return username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Apply sorting
    const sortedResults = [...results].sort((a, b) => {
      switch (sortOption) {
        case "activity":
          return (
            (b.activityStats?.lastActive?.getTime() || 0) -
            (a.activityStats?.lastActive?.getTime() || 0)
          );
        case "messages":
          return (
            (b.activityStats?.messagesCount || 0) -
            (a.activityStats?.messagesCount || 0)
          );
        case "role":
          const roleOrder = { creator: 0, moderator: 1, member: 2 };
          return roleOrder[a.role] - roleOrder[b.role];
        case "joined":
        default:
          return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
      }
    });

    setFilteredMembers(sortedResults);
  }, [searchTerm, members, sortOption]);

  // Close member action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (Object.keys(showMemberActions).some((id) => showMemberActions[id])) {
        if (!event.target.closest(".member-actions")) {
          setShowMemberActions({});
        }
      }

      if (showSortOptions) {
        if (!event.target.closest(".sort-dropdown")) {
          setShowSortOptions(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMemberActions, showSortOptions]);

  // Handle member role change
  const handleRoleChange = async (memberId, newRole) => {
    // Update local state to show the change immediately
    const updatedMembers = members.map((member) => {
      if (member.user._id === memberId) {
        return { ...member, role: newRole };
      }
      return member;
    });

    setMembers(updatedMembers);
    setShowMemberActions({ ...showMemberActions, [memberId]: false });
  };

  // Handle member removal
  const handleRemoveMember = async (memberId) => {
    if (
      !confirm("Are you sure you want to remove this member from the group?")
    ) {
      return;
    }

    // Update local state to remove the member immediately
    const updatedMembers = members.filter(
      (member) => member.user._id !== memberId
    );
    setMembers(updatedMembers);
  };

  // Format relative time for last active
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate
      ? formatDate(dateString)
      : new Date(dateString).toLocaleDateString();
  };

  // Get color based on role
  const getRoleColor = (role) => {
    switch (role) {
      case "creator":
        return "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light";
      case "moderator":
        return "bg-accent/10 dark:bg-accent/20 text-accent-dark dark:text-accent-light";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case "creator":
        return <CheckCircle size={12} className="mr-1" />;
      case "moderator":
        return <Shield size={12} className="mr-1" />;
      default:
        return null;
    }
  };

  // Get sort option label
  const getSortLabel = () => {
    switch (sortOption) {
      case "activity":
        return "Last Active";
      case "messages":
        return "Message Count";
      case "role":
        return "Role";
      case "joined":
        return "Joined Date";
      default:
        return "Joined Date";
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary dark:text-primary-light" />
            Members{" "}
            <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({filteredMembers?.length || 0})
            </span>
          </h2>
          {(isCreator || isMember) && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="px-3 py-2 bg-secondary hover:bg-secondary/90 dark:hover:bg-secondary-light text-white rounded-md flex items-center text-sm font-medium transition-colors shadow-sm"
            >
              <UserPlus size={16} className="mr-1.5" />
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/40 bg-white/70 dark:bg-gray-800/70">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members..."
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 dark:border-gray-600/70 rounded-md bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex-shrink-0 relative sort-dropdown">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 flex items-center space-x-1 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            >
              <Filter size={16} className="mr-1.5" />
              <span>{getSortLabel()}</span>
              <ChevronDown
                size={16}
                className={`ml-1 transition-transform ${
                  showSortOptions ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSortOptions && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600/80 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSortOption("joined");
                      setShowSortOptions(false);
                    }}
                    className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                      sortOption === "joined"
                        ? "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
                    }`}
                  >
                    <CalendarDays size={14} className="mr-2" />
                    Joined Date
                  </button>
                  <button
                    onClick={() => {
                      setSortOption("activity");
                      setShowSortOptions(false);
                    }}
                    className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                      sortOption === "activity"
                        ? "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
                    }`}
                  >
                    <Activity size={14} className="mr-2" />
                    Last Active
                  </button>
                  <button
                    onClick={() => {
                      setSortOption("messages");
                      setShowSortOptions(false);
                    }}
                    className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                      sortOption === "messages"
                        ? "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
                    }`}
                  >
                    <MessagesSquare size={14} className="mr-2" />
                    Message Count
                  </button>
                  <button
                    onClick={() => {
                      setSortOption("role");
                      setShowSortOptions(false);
                    }}
                    className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                      sortOption === "role"
                        ? "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70"
                    }`}
                  >
                    <Shield size={14} className="mr-2" />
                    Role
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredMembers?.length > 0 ? (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.user._id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600/70 rounded-lg bg-white/80 dark:bg-gray-700/40 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary flex items-center justify-center text-white font-bold mr-3 shadow-sm">
                    {member.user.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-1.5">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {member.user.username}
                        {member.user._id === user._id && (
                          <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                            (You)
                          </span>
                        )}
                      </p>
                      {member.role !== "member" && (
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full flex items-center ${getRoleColor(
                            member.role
                          )}`}
                        >
                          {getRoleIcon(member.role)}
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex-wrap gap-2">
                      <span className="flex items-center">
                        <Activity size={12} className="mr-1" />
                        {getRelativeTime(member.activityStats?.lastActive)}
                      </span>
                      <span className="flex items-center">
                        <MessagesSquare size={12} className="mr-1" />
                        {member.activityStats?.messagesCount || 0} messages
                      </span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Member actions - only shown to creator and not for themselves */}
                {isCreator && member.user._id !== user._id && (
                  <div className="relative member-actions">
                    <button
                      onClick={() =>
                        setShowMemberActions({
                          ...showMemberActions,
                          [member.user._id]:
                            !showMemberActions[member.user._id],
                        })
                      }
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600/70 rounded-full transition-colors"
                      aria-label="Member actions"
                    >
                      <Settings
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </button>

                    {showMemberActions[member.user._id] && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600/80 z-10 overflow-hidden">
                        <div className="py-1">
                          {member.role !== "moderator" && (
                            <button
                              onClick={() =>
                                handleRoleChange(member.user._id, "moderator")
                              }
                              className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70 w-full text-left flex items-center transition-colors"
                            >
                              <Shield
                                size={14}
                                className="mr-2 text-accent dark:text-accent-light"
                              />
                              Make Moderator
                            </button>
                          )}
                          {member.role === "moderator" && (
                            <button
                              onClick={() =>
                                handleRoleChange(member.user._id, "member")
                              }
                              className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70 w-full text-left flex items-center transition-colors"
                            >
                              <Shield
                                size={14}
                                className="mr-2 text-gray-500 dark:text-gray-400"
                              />
                              Remove Moderator
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left flex items-center transition-colors"
                          >
                            <UserMinus size={14} className="mr-2" />
                            Remove from Group
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg border border-gray-200/70 dark:border-gray-600/40">
            <div className="text-center">
              <Users
                size={40}
                className="mx-auto mb-3 text-gray-400 dark:text-gray-500"
              />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                {searchTerm ? "No members match your search" : "No members yet"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try a different search term"
                  : "Invite others to join this group"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pending invitations section */}
      {currentGroup.invitees?.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700/40 p-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Mail className="mr-2 h-4 w-4 text-amber-500 dark:text-amber-400" />
            Pending Invitations ({currentGroup.invitees.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {currentGroup.invitees.map((invite) => (
              <div
                key={invite.user._id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600/70 rounded-lg bg-white/80 dark:bg-gray-700/40"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-bold mr-3">
                    {invite.user.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 text-sm">
                    {invite.user.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-1 bg-amber-100/80 dark:bg-amber-800/30 text-amber-800 dark:text-amber-300 rounded-full">
                    {invite.status}
                  </span>
                  {isCreator && (
                    <button
                      onClick={() => handleRemoveMember(invite.user._id)}
                      className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600/70 rounded-full transition-colors"
                      aria-label="Remove invitation"
                    >
                      <X size={16} className="text-red-500 dark:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMembers;
