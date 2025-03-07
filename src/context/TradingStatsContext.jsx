// Updated TradingStatsContext.js
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

  // Enhanced stats normalization to ensure consistency
  const normalizedStats = useMemo(() => {
    if (!stats) return null;

    // Calculate derived values to ensure consistency
    const totalTrades = stats.totalTrades || 0;
    const winningTrades = stats.winningTrades || stats.profitableTrades || 0;
    const losingTrades = stats.losingTrades || totalTrades - winningTrades || 0;

    // Explicitly calculate win rate
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Explicitly calculate win/loss ratio
    const winLossRatio =
      losingTrades > 0 ? winningTrades / losingTrades : winningTrades;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      totalProfit: stats.totalProfit || 0,
      winRate,
      winLossRatio,
      // Store raw values for debugging
      rawStats: { ...stats },
    };
  }, [stats]);

  // Normalize trader stats to ensure consistency across components
  const normalizeTraderStats = useCallback((trader) => {
    if (!trader || !trader.stats) return trader;

    const traderStats = trader.stats;
    const totalTrades = traderStats.totalTrades || 0;
    const winningTrades =
      traderStats.winningTrades || traderStats.profitableTrades || 0;
    const losingTrades =
      traderStats.losingTrades || totalTrades - winningTrades || 0;

    // Calculate win rate explicitly
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return {
      ...trader,
      stats: {
        ...traderStats,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
      },
    };
  }, []);

  // Normalize leaderboard data
  const normalizedLeaderboardData = useMemo(() => {
    return leaderboardData.map(normalizeTraderStats);
  }, [leaderboardData, normalizeTraderStats]);

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

      // Normalize the leaderboard data before saving it
      setLeaderboardData(result.data);

      // Update the user's stats if found in leaderboard data
      // BUT only if the leaderboard timeframe is "all"
      if (timeFrame === "all") {
        const userData = result.data.find((trader) => trader._id === user._id);
        if (userData && userData.stats) {
          // Normalize the user stats before merging with existing stats
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
    // Convert to number and check if it's a valid number
    const numValue = Number(value);
    if (value === undefined || value === null || isNaN(numValue)) return "0.0%";
    return `${numValue.toFixed(decimals)}%`;
  }, []);

  const formatRatio = useCallback((value, decimals = 2) => {
    if (value === undefined || value === null) return "0.00";
    return value.toFixed(decimals);
  }, []);

  // New helper function to get standardized win rate for display
  const getWinRate = useCallback((trader) => {
    if (!trader || !trader.stats) return 0;

    const stats = trader.stats;
    const totalTrades = stats.totalTrades || 0;
    const winningTrades = stats.winningTrades || stats.profitableTrades || 0;

    // Calculate win rate explicitly
    return totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  }, []);

  const value = {
    stats: normalizedStats,
    rawStats: stats,
    leaderboardData: normalizedLeaderboardData,
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
    getWinRate, // New helper function
    normalizeTraderStats, // Expose this for components to use
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
