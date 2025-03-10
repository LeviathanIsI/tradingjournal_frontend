import React, { useState, useEffect } from "react";
import { Users, UserPlus, CheckCircle, Search, Shield, Activity, UserMinus, Settings, ChevronDown } from "lucide-react";

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

  // Function to format the member list from the currentGroup data
  // In the future, this would come directly from your updated API
  useEffect(() => {
    if (!currentGroup.members) return;
    
    // Convert simple members array to rich format with roles
    const membersList = currentGroup.members.map(member => {
      // Check if this is already using the rich format or needs conversion
      if (member.user) {
        return member;
      } else {
        // Create an enhanced member object with role and activity stats
        return {
          user: member,
          role: member._id === currentGroup.creator?._id ? 'creator' : 'member',
          joinedAt: currentGroup.createdAt,
          activityStats: {
            messagesCount: Math.floor(Math.random() * 20), // Placeholder data
            sessionsAttended: Math.floor(Math.random() * 5), // Placeholder data
            lastActive: new Date(Date.now() - Math.random() * 10000000000) // Random recent date
          }
        };
      }
    });
    
    setMembers(membersList);
    setFilteredMembers(membersList);
  }, [currentGroup]);

  // Handle search and filtering
  useEffect(() => {
    if (!members.length) return;
    
    const results = members.filter(member => {
      const username = member.user?.username || "";
      return username.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Apply sorting
    const sortedResults = [...results].sort((a, b) => {
      switch (sortOption) {
        case "activity":
          return (b.activityStats?.lastActive?.getTime() || 0) - (a.activityStats?.lastActive?.getTime() || 0);
        case "messages":
          return (b.activityStats?.messagesCount || 0) - (a.activityStats?.messagesCount || 0);
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

  // Handle member role change
  const handleRoleChange = async (memberId, newRole) => {
    
    // Update local state to show the change immediately
    const updatedMembers = members.map(member => {
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
    if (!confirm("Are you sure you want to remove this member from the group?")) {
      return;
    }
    
    // Update local state to remove the member immediately
    const updatedMembers = members.filter(member => member.user._id !== memberId);
    setMembers(updatedMembers);
  };

  // Format relative time for last active
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate ? formatDate(dateString) : new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
          Members ({filteredMembers?.length || 0})
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

      {/* Search and filter bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600/70 rounded-md bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <div className="flex-shrink-0">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600/70 rounded-md bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
          >
            <option value="joined">Sort by: Joined Date</option>
            <option value="activity">Sort by: Last Active</option>
            <option value="messages">Sort by: Message Count</option>
            <option value="role">Sort by: Role</option>
          </select>
        </div>
      </div>

      {filteredMembers?.length > 0 ? (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div
              key={member.user._id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                  {member.user.username?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {member.user.username}
                    </p>
                    {member.role === "creator" && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-700/30 text-blue-800 dark:text-blue-300 rounded-full flex items-center">
                        <CheckCircle size={12} className="mr-1" />
                        Creator
                      </span>
                    )}
                    {member.role === "moderator" && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-700/30 text-purple-800 dark:text-purple-300 rounded-full flex items-center">
                        <Shield size={12} className="mr-1" />
                        Moderator
                      </span>
                    )}
                  </div>
                  <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                    <span className="flex items-center">
                      <Activity size={12} className="mr-1" />
                      {getRelativeTime(member.activityStats?.lastActive)}
                    </span>
                    <span>•</span>
                    <span>{member.activityStats?.messagesCount || 0} messages</span>
                    <span>•</span>
                    <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Member actions - only shown to creator and not for themselves */}
              {isCreator && member.user._id !== user._id && (
                <div className="relative">
                  <button
                    onClick={() => setShowMemberActions({
                      ...showMemberActions,
                      [member.user._id]: !showMemberActions[member.user._id]
                    })}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Settings size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  
                  {showMemberActions[member.user._id] && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                      <div className="py-1">
                        {member.role !== "moderator" && (
                          <button
                            onClick={() => handleRoleChange(member.user._id, "moderator")}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center"
                          >
                            <Shield size={14} className="mr-2" />
                            Make Moderator
                          </button>
                        )}
                        {member.role === "moderator" && (
                          <button
                            onClick={() => handleRoleChange(member.user._id, "member")}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center"
                          >
                            <Shield size={14} className="mr-2" />
                            Remove Moderator
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.user._id)}
                          className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center"
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
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-md">
          <Users size={40} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? "No members match your search." : "No members yet."}
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
                    {invite.user.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-gray-900 dark:text-gray-100">
                    {invite.user.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-700/30 text-yellow-800 dark:text-yellow-300 rounded-md">
                    {invite.status}
                  </span>
                  {isCreator && (
                    <button
                      onClick={() => handleRemoveMember(invite.user._id)}
                      className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <UserMinus size={16} className="text-red-500 dark:text-red-400" />
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