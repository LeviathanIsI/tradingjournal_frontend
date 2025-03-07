// context/TradingStatsContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
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

  // Ensure stats has all required fields even if API response is incomplete
  const normalizedStats = useMemo(() => {
    if (!stats) return null;

    return {
      totalTrades: stats.totalTrades || 0,
      profitableTrades: stats.profitableTrades || stats.winningTrades || 0,
      winningTrades: stats.winningTrades || stats.profitableTrades || 0,
      losingTrades: stats.losingTrades || 0,
      totalProfit: stats.totalProfit || 0,
      winRate:
        stats.winRate ||
        (stats.totalTrades > 0
          ? ((stats.profitableTrades || stats.winningTrades || 0) /
              stats.totalTrades) *
            100
          : 0),
      winLossRatio:
        stats.winLossRatio ||
        (stats.losingTrades > 0
          ? (stats.profitableTrades || stats.winningTrades || 0) /
            stats.losingTrades
          : stats.profitableTrades || stats.winningTrades || 0),
    };
  }, [stats]);

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

      // Update the user's stats if found in leaderboard data
      // BUT only if the leaderboard timeframe is "all" - otherwise we'd
      // be showing timeframe-limited stats in the main stats display
      if (timeFrame === "all") {
        const userData = result.data.find((trader) => trader._id === user._id);
        if (userData && userData.stats) {
          // Merge with existing stats to ensure all fields are present
          // but prioritize leaderboard data as it may be more current
          setStats((prevStats) => ({
            ...(prevStats || {}),
            ...userData.stats,
          }));
        }
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

  // Utility functions for formatting
  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null) return "$0.00";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatPercent = useCallback((value, decimals = 1) => {
    if (value === undefined || value === null) return "0.0%";
    return `${value.toFixed(decimals)}%`;
  }, []);

  const formatRatio = useCallback((value, decimals = 2) => {
    if (value === undefined || value === null) return "0.00";
    return value.toFixed(decimals);
  }, []);

  const value = {
    stats: normalizedStats,
    rawStats: stats,
    leaderboardData,
    loading,
    error,
    timeFrame,
    setTimeFrame,
    refreshData,
    formatters: {
      formatCurrency,
      formatPercent,
      formatRatio,
    },
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
