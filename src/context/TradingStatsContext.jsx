// context/TradingStatsContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const TradingStatsContext = createContext(null);

export const TradingStatsProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch trading stats
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trades/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trading stats");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch stats");
      }

      setStats(result.data);
    } catch (err) {
      console.error("Error fetching trading stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchLeaderboard = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/auth/leaderboard?timeFrame=${timeFrame}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error("Invalid response format from server");
      }

      setLeaderboardData(result.data);

      // Also update the user's stats if found in leaderboard data
      const userData = result.data.find((trader) => trader._id === user._id);
      if (userData && userData.stats) {
        setStats((prevStats) => ({
          ...prevStats,
          ...userData.stats,
        }));
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, timeFrame]);

  const refreshData = useCallback(() => {
    fetchStats();
    fetchLeaderboard();
  }, [fetchStats, fetchLeaderboard]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Re-fetch leaderboard when timeFrame changes
  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [timeFrame, fetchLeaderboard]);

  const value = {
    stats,
    leaderboardData,
    loading,
    error,
    timeFrame,
    setTimeFrame,
    refreshData,
  };

  return (
    <TradingStatsContext.Provider value={value}>
      {children}
    </TradingStatsContext.Provider>
  );
};

export const useTradingStats = () => {
  const context = useContext(TradingStatsContext);
  if (!context) {
    throw new Error(
      "useTradingStats must be used within a TradingStatsProvider"
    );
  }
  return context;
};

export default TradingStatsContext;
