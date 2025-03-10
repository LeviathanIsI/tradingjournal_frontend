import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "./ToastContext";

const StudyGroupContext = createContext();

export const useStudyGroups = () => useContext(StudyGroupContext);

export const StudyGroupProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studyGroups, setStudyGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all study groups
  const fetchStudyGroups = useCallback(
    async (includePublic = true) => {
      try {
        setLoading(true);
        setError(null);

        // Clear the current group when fetching all groups
        setCurrentGroup(null);

        const token = localStorage.getItem("token");
        const url = `${API_URL}/api/study-groups?includePublic=${includePublic}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStudyGroups(response.data.data || []);
      } catch (err) {
        console.error("Error fetching study groups:", err);
        setError("Failed to load study groups");
        showToast("Failed to load study groups", "error");
      } finally {
        setLoading(false);
      }
    },
    [API_URL, showToast]
  );

  // Fetch a specific study group by ID
  const fetchStudyGroup = useCallback(
    async (groupId) => {
      // Only proceed if we have a valid group ID
      if (!groupId) {
        setCurrentGroup(null);
        setError("No study group ID provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/study-groups/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCurrentGroup(response.data.data);
      } catch (err) {
        console.error(`Error fetching study group ${groupId}:`, err);
        setError("Failed to load study group");
        showToast("Failed to load study group details", "error");
        setCurrentGroup(null);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, showToast]
  );

  // Get available users to invite to a study group
  const getAvailableUsers = useCallback(
    async (groupId) => {
      if (!groupId) {
        setError("No study group ID provided");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/study-groups/${groupId}/available-users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data.data || [];
      } catch (err) {
        console.error(
          `Error fetching available users for group ${groupId}:`,
          err
        );
        setError("Failed to load available users");
        showToast("Failed to load available users", "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [API_URL, showToast]
  );

  // Invite a user to a study group
  const inviteToGroup = useCallback(
    async (groupId, email) => {
      if (!groupId) {
        setError("No study group ID provided");
        throw new Error("No study group ID provided");
      }

      if (!email) {
        setError("Email is required");
        throw new Error("Email is required");
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${API_URL}/api/study-groups/${groupId}/invite`,
          { email },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If we have the current group loaded and it's the same one we're inviting to,
        // update its invitees list
        if (currentGroup && currentGroup._id === groupId) {
          setCurrentGroup({
            ...currentGroup,
            invitees: response.data.data || currentGroup.invitees,
          });
        }

        return response.data.data;
      } catch (err) {
        console.error(`Error inviting user to group ${groupId}:`, err);
        setError(err.response?.data?.error || "Failed to send invitation");
        showToast(
          err.response?.data?.error || "Failed to send invitation",
          "error"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL, currentGroup, showToast]
  );

  const getUserProfileInfo = useCallback((userId, username) => {
    return { userId, username };
  }, []);

  // Create a new study group
  const createStudyGroup = useCallback(
    async (groupData) => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${API_URL}/api/study-groups`,
          groupData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update the study groups list
        setStudyGroups((prevGroups) => [...prevGroups, response.data.data]);

        showToast("Study group created successfully", "success");
        return response.data.data;
      } catch (err) {
        console.error("Error creating study group:", err);
        setError("Failed to create study group");
        showToast("Failed to create study group", "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL, showToast]
  );

  // Update a study group
  const updateStudyGroup = useCallback(
    async (groupId, updateData) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.patch(
          `${API_URL}/api/study-groups/${groupId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update the current group if it's the one being edited
        if (currentGroup && currentGroup._id === groupId) {
          setCurrentGroup(response.data.data);
        }

        // Update the group in the study groups list
        setStudyGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === groupId ? response.data.data : group
          )
        );

        showToast("Study group updated successfully", "success");
        return response.data.data;
      } catch (err) {
        console.error(`Error updating study group ${groupId}:`, err);
        showToast("Failed to update study group", "error");
        throw err;
      }
    },
    [API_URL, currentGroup, showToast]
  );

  // Delete a study group
  const deleteStudyGroup = useCallback(
    async (groupId) => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/study-groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove from state
        setStudyGroups((prevGroups) =>
          prevGroups.filter((group) => group._id !== groupId)
        );

        // Clear current group if it's the one being deleted
        if (currentGroup && currentGroup._id === groupId) {
          setCurrentGroup(null);
        }

        showToast("Study group deleted successfully", "success");
      } catch (err) {
        console.error(`Error deleting study group ${groupId}:`, err);
        showToast("Failed to delete study group", "error");
        throw err;
      }
    },
    [API_URL, currentGroup, showToast]
  );

  const contextValue = {
    loading,
    error,
    studyGroups,
    currentGroup,
    setCurrentGroup,
    fetchStudyGroups,
    fetchStudyGroup,
    createStudyGroup,
    updateStudyGroup,
    deleteStudyGroup,
    getUserProfileInfo,
    getAvailableUsers,
    inviteToGroup,
  };

  return (
    <StudyGroupContext.Provider value={contextValue}>
      {children}
    </StudyGroupContext.Provider>
  );
};
