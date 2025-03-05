// src/context/StudyGroupContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const StudyGroupContext = createContext();

export const StudyGroupProvider = ({ children }) => {
  // Use useRef for stable references to state setters
  const stateRef = useRef({
    studyGroups: [],
    currentGroup: null,
    loading: false,
    error: null,
  });

  // Actual state (UI will re-render when these change)
  const [studyGroups, setStudyGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update refs when state changes
  stateRef.current = {
    studyGroups,
    currentGroup,
    loading,
    error,
  };

  const { user } = useAuth();
  const { showToast } = useToast();

  // Keep a stable reference to API_URL
  const API_URL = useRef(import.meta.env.VITE_API_URL).current;

  // Helper function to handle errors consistently
  const handleError = (err, message) => {
    console.error(`${message}:`, err);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Status:", err.response.status);
    }
    setError(err.response?.data?.error || message);
    showToast(message, "error");
    setLoading(false);
  };

  const fetchStudyGroups = useCallback(
    async (includePublic = false) => {
      if (stateRef.current.loading) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/api/study-groups?includePublic=${includePublic}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data.data || [];
        setStudyGroups(data);
        setLoading(false);
        return data;
      } catch (err) {
        handleError(err, "Failed to fetch study groups");
        return [];
      }
    },
    [API_URL, showToast]
  );

  // Fetch a single study group by ID
  const fetchStudyGroup = useCallback(
    async (id) => {
      if (stateRef.current.loading) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/api/study-groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentGroup(res.data.data);
        setLoading(false);
        return res.data.data;
      } catch (err) {
        handleError(err, "Failed to fetch study group");
        return null;
      }
    },
    [API_URL, showToast]
  );

  const updateStudyGroup = useCallback(
    async (id, updateData) => {
      if (stateRef.current.loading) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.patch(
          `${API_URL}/api/study-groups/${id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedGroup = res.data.data;

        // Update the groups list if it exists there
        setStudyGroups((prev) =>
          prev.map((group) => (group._id === id ? updatedGroup : group))
        );

        // Update current group if it's the one being edited
        if (stateRef.current.currentGroup?._id === id) {
          setCurrentGroup(updatedGroup);
        }

        setLoading(false);
        return updatedGroup;
      } catch (err) {
        console.error("Error updating study group:", err);
        setError(err.response?.data?.error || "Failed to update study group");
        showToast("Failed to update study group", "error");
        setLoading(false);
        throw err;
      }
    },
    [API_URL, showToast]
  );

  const createStudyGroup = useCallback(
    async (groupData) => {
      if (stateRef.current.loading) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.post(`${API_URL}/api/study-groups`, groupData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const newGroup = res.data.data;
        setStudyGroups((prev) => [newGroup, ...prev]);
        showToast("Study group created successfully", "success");
        setLoading(false);
        return newGroup;
      } catch (err) {
        console.error("Error creating study group:", err);
        setError(err.response?.data?.error || "Failed to create study group");
        showToast("Failed to create study group", "error");
        setLoading(false);
        throw err;
      }
    },
    [API_URL, showToast]
  );

  // Create a stable context value that only changes when the deps change
  const contextValue = useMemo(
    () => ({
      studyGroups,
      currentGroup,
      loading,
      error,
      fetchStudyGroups,
      fetchStudyGroup,
      createStudyGroup,
      updateStudyGroup,
    }),
    [
      studyGroups,
      currentGroup,
      loading,
      error,
      fetchStudyGroups,
      fetchStudyGroup,
      createStudyGroup,
      updateStudyGroup,
    ]
  );

  // Log only once per render
  if (process.env.NODE_ENV === "development") {
  }

  return (
    <StudyGroupContext.Provider value={contextValue}>
      {children}
    </StudyGroupContext.Provider>
  );
};

export const useStudyGroups = () => {
  const context = useContext(StudyGroupContext);
  if (!context) {
    throw new Error("useStudyGroups must be used within a StudyGroupProvider");
  }
  return context;
};
