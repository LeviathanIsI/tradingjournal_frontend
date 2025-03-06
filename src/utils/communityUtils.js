/**
 * Shared utility functions for the Community section
 */

/**
 * Format a number as USD currency
 * @param {number} value - The value to format
 * @param {number} minimumFractionDigits - Decimal places to show (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, minimumFractionDigits = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
  }).format(value);
};

/**
 * Calculate win rate percentage
 * @param {number} winningTrades - Number of winning trades
 * @param {number} totalTrades - Total number of trades
 * @returns {string} Formatted win rate percentage with one decimal place
 */
export const calculateWinRate = (winningTrades, totalTrades) => {
  if (!totalTrades) return "0.0";
  return ((winningTrades / totalTrades) * 100).toFixed(1);
};

/**
 * Make an API request with proper error handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Request options
 * @returns {Promise<any>} - Response data
 */
export const makeApiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  try {
    const defaultOptions = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.body && { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      defaultOptions
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Filter and sort community data (reviews, traders, etc.)
 * @param {Array} data - Array of items to filter and sort
 * @param {Object} filters - Filter criteria
 * @param {string} sortBy - Sort method
 * @param {string} searchQuery - Search query text
 * @returns {Array} Filtered and sorted data
 */
export const filterAndSortData = (
  data,
  filters = {},
  sortBy = "newest",
  searchQuery = ""
) => {
  if (!Array.isArray(data) || !data.length) return [];

  let filtered = [...data];

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((item) => {
      const username = item.user?.username || item.username || "";
      const tradingStyle = item.user?.tradingStyle || item.tradingStyle || "";
      return (
        username.toLowerCase().includes(query) ||
        tradingStyle.toLowerCase().includes(query)
      );
    });
  }

  // Apply profit type filter
  if (filters.profitType && filters.profitType !== "all") {
    filtered = filtered.filter((item) => {
      const profit =
        item.trade?.profitLoss?.realized || item.stats?.totalProfit || 0;
      if (filters.profitType === "winning") return profit > 0;
      if (filters.profitType === "losing") return profit < 0;
      return true;
    });
  }

  // Apply time frame filter
  if (filters.timeFrame && filters.timeFrame !== "all") {
    const now = new Date();
    let startDate;

    switch (filters.timeFrame) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) >= startDate
      );
    }
  }

  // Apply sorting
  switch (sortBy) {
    case "newest":
      return filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case "oldest":
      return filtered.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    case "mostLiked":
      return filtered.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    case "mostComments":
      return filtered.sort(
        (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
      );
    case "highestProfit":
      return filtered.sort((a, b) => {
        const profitA =
          a.trade?.profitLoss?.realized || a.stats?.totalProfit || 0;
        const profitB =
          b.trade?.profitLoss?.realized || b.stats?.totalProfit || 0;
        return profitB - profitA;
      });
    case "winRate":
      return filtered.sort(
        (a, b) => (b.stats?.winRate || 0) - (a.stats?.winRate || 0)
      );
    case "totalTrades":
      return filtered.sort(
        (a, b) => (b.stats?.totalTrades || 0) - (a.stats?.totalTrades || 0)
      );
    case "username":
      return filtered.sort((a, b) => {
        const usernameA = a.user?.username || a.username || "";
        const usernameB = b.user?.username || b.username || "";
        return usernameA.toLowerCase().localeCompare(usernameB.toLowerCase());
      });
    default:
      return filtered;
  }
};

/**
 * Get common sort options for community components
 * @returns {Array} Array of sort option objects
 */
export const getSortOptions = () => [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "mostLiked", label: "Most Liked" },
  { value: "mostComments", label: "Most Comments" },
  { value: "highestProfit", label: "Highest Profit" },
  { value: "username", label: "Username" },
];
