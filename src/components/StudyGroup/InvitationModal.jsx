import React, { useState, useEffect, useRef } from "react";
import { X, Search, UserPlus } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useStudyGroups } from "../../context/StudyGroupContext";

const InvitationModal = ({
  showInviteForm,
  setShowInviteForm,
  inviteEmail,
  setInviteEmail,
  handleInviteSubmit,
  groupId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const modalRef = useRef(null);
  const { showToast } = useToast();

  // Get study group context
  const {
    loading: isLoading,
    currentGroup,
    fetchStudyGroup,
  } = useStudyGroups();

  // Use groupId from props if available, otherwise from currentGroup
  const currentGroupId = groupId || currentGroup?._id;

  // Handle clicking outside to close the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowInviteForm(false);
      }
    };

    if (showInviteForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInviteForm, setShowInviteForm]);

  // Fetch available users directly from API
  useEffect(() => {
    // Only fetch if the modal is visible
    if (!showInviteForm || !currentGroupId) return;

    const fetchAvailableUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL;

        console.log("Fetching available users for group:", currentGroupId);

        const response = await fetch(
          `${API_URL}/api/study-groups/${currentGroupId}/available-users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success) {
          setAvailableUsers(data.data);
          setFilteredUsers(data.data);
          console.log(`Found ${data.data.length} available users`);
        } else {
          console.error("API returned success: false");
          showToast("Failed to load users", "error");
        }
      } catch (error) {
        console.error("Error fetching available users:", error);
        showToast("Failed to load users", "error");
      }
    };

    fetchAvailableUsers();
  }, [showInviteForm, currentGroupId, showToast]);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(availableUsers);
    } else {
      const filtered = availableUsers.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, availableUsers]);

  // Handle selecting a user
  const handleSelectUser = (user) => {
    if (!selectedUsers.some((selected) => selected._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);

      // If using the old modal style with single email input
      if (setInviteEmail) {
        setInviteEmail(user.email);
      }
    }
  };

  // Handle removing a selected user
  const handleRemoveSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  // Send invitation to selected users
  const handleSendInvitations = async () => {
    if (handleInviteSubmit) {
      // Use the parent component's handler if provided
      const mockEvent = { preventDefault: () => {} };
      await handleInviteSubmit(mockEvent);
      return;
    }

    if (!selectedUsers.length) {
      showToast("Please select at least one user", "warning");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;

      // Send invitations one by one
      for (const user of selectedUsers) {
        try {
          await fetch(`${API_URL}/api/study-groups/${currentGroupId}/invite`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email }),
          });
          successCount++;
        } catch (error) {
          console.error(`Error inviting ${user.email}:`, error);
          failCount++;
        }
      }

      if (successCount) {
        showToast(`${successCount} invitation(s) sent successfully`, "success");
        setSelectedUsers([]);
        setShowInviteForm(false);

        // Refresh the group data to show updated invitees
        if (fetchStudyGroup && currentGroupId) {
          fetchStudyGroup(currentGroupId);
        }
      }

      if (failCount) {
        showToast(`Failed to send ${failCount} invitation(s)`, "error");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      showToast("Failed to send invitations", "error");
    }
  };

  if (!showInviteForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-700/60 rounded-sm p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] 
        overflow-y-auto border border-gray-200 dark:border-gray-600/50 shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invite Members
          </h2>
          <button
            onClick={() => setShowInviteForm(false)}
            className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600/70 
            text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Search Users
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by username or email"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Type to search by username or email
          </p>
        </div>

        {/* User list */}
        <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600/50 rounded-sm">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Loading users...
              </span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-600/50">
              {filteredUsers
                .filter(
                  (user) =>
                    !selectedUsers.some((selected) => selected._id === user._id)
                )
                .map((user) => (
                  <li key={user._id}>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center justify-between text-left px-4 py-3 
                      hover:bg-gray-50 dark:hover:bg-gray-600/40 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                          {user.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <UserPlus size={18} className="text-blue-500" />
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No users found matching your search"
                : availableUsers.length === 0 && !isLoading
                ? "No users available to invite"
                : ""}
            </div>
          )}
        </div>

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Users ({selectedUsers.length})
            </h4>
            <div
              className="flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-600/50 rounded-sm 
            bg-gray-50 dark:bg-gray-600/30"
            >
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center bg-white dark:bg-gray-600/50 text-gray-800 dark:text-gray-200 
                  px-2 py-1 rounded-sm border border-gray-200 dark:border-gray-600/70"
                >
                  <span className="text-sm">{user.username}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedUser(user._id)}
                    className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div
          className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 
        border-t dark:border-gray-600/50 pt-4"
        >
          <button
            type="button"
            onClick={() => setShowInviteForm(false)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
            bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 
            hover:bg-gray-50 dark:hover:bg-gray-600/70 text-sm sm:text-base"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendInvitations}
            disabled={selectedUsers.length === 0 || isLoading}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-sm 
            hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 text-sm sm:text-base 
            flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <UserPlus size={18} className="mr-2" />
                Send {selectedUsers.length} Invitation
                {selectedUsers.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;
