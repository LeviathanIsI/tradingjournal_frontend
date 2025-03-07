// utils/fetchStats.js
import { normalizeStats } from "./statsFormatters";

/**
 * Fetch stats from the server
 * @param {string} type - Type of stats to fetch (e.g., 'trades', 'auth')
 * @param {Object} options - Additional options
 * @param {string} options.timeFrame - Time frame for stats (all, today, week, month, year)
 * @param {string} options.endpoint - Override endpoint
 * @returns {Promise<Object>} Fetched stats
 */
export const fetchStats = async (type, options = {}) => {
  if (!type) {
    console.error("❌ fetchStats() missing required 'type' argument");
    return null;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No authentication token found!");
      return null;
    }

    // Default endpoint based on type
    let endpoint = `${import.meta.env.VITE_API_URL}/api/${type}/stats`;

    // For leaderboard, use auth endpoint with timeFrame
    if (type === "leaderboard") {
      const timeFrame = options.timeFrame || "all";
      endpoint = `${
        import.meta.env.VITE_API_URL
      }/api/auth/leaderboard?timeFrame=${timeFrame}`;
    } else if (options.endpoint) {
      // Use custom endpoint if provided
      endpoint = options.endpoint;
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch ${type} stats (${response.status})`
      );
    }

    const result = await response.json();

    // Handle different response structures
    let data = result.data;

    // If this is stats data, normalize it
    if (
      type === "trades" ||
      (data && (data.totalTrades !== undefined || data.stats))
    ) {
      return normalizeStats(data.stats || data);
    }

    return data;
  } catch (err) {
    console.error(`❌ Error fetching ${type} stats:`, err);
    return null;
  }
};

/**
 * Ensure the user's stats is updated with the most current data from multiple sources
 * @param {Object} userData - User data with stats property
 * @param {Array} leaderboardData - Leaderboard data array
 * @returns {Object} Updated user stats
 */
export const getMergedUserStats = (userData, leaderboardData) => {
  if (!userData || !userData._id) return null;

  // Find user in leaderboard
  const leaderboardUserData = Array.isArray(leaderboardData)
    ? leaderboardData.find((item) => item._id === userData._id)
    : null;

  // Merge stats giving priority to leaderboard stats as they might be more current
  const mergedStats = {
    ...(userData.stats || {}),
    ...(leaderboardUserData?.stats || {}),
  };

  return normalizeStats(mergedStats);
};
