// utils/statsFormatters.js

/**
 * Format a currency value with $ sign and 2 decimal places
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a percentage value with specified decimal places
 * @param {number} value - Percentage value (e.g. 65.43)
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted percentage
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === undefined || value === null) return "0.0%";
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a ratio value with specified decimal places
 * @param {number} value - Ratio value (e.g. 2.54)
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted ratio
 */
export const formatRatio = (value, decimals = 2) => {
  if (value === undefined || value === null) return "0.00";
  return value.toFixed(decimals);
};

/**
 * Format profit/loss value with color indication
 * @param {number} amount - Amount to format
 * @param {boolean} includeSign - Whether to include +/- sign
 * @returns {Object} Object with value and color
 */
export const formatProfitLoss = (amount, includeSign = false) => {
  if (amount === undefined || amount === null) {
    return {
      value: "$0.00",
      color: "text-gray-900 dark:text-gray-100",
    };
  }

  const formatted = formatCurrency(Math.abs(amount));
  const value =
    amount < 0
      ? `-${formatted}`
      : includeSign && amount > 0
      ? `+${formatted}`
      : formatted;

  const color =
    amount < 0
      ? "text-red-600 dark:text-red-400"
      : amount > 0
      ? "text-green-600 dark:text-green-400"
      : "text-gray-900 dark:text-gray-100";

  return { value, color };
};

/**
 * Normalize stats object to ensure all required fields are present
 * @param {Object} stats - Stats object from API
 * @returns {Object} Normalized stats object
 */
export const normalizeStats = (stats) => {
  if (!stats) return null;

  // Extract base values with fallbacks
  const totalTrades = stats.totalTrades || 0;
  const winningTrades = stats.winningTrades || stats.profitableTrades || 0;
  const losingTrades = stats.losingTrades || totalTrades - winningTrades || 0;

  // ALWAYS calculate winRate directly, ignoring any pre-calculated values
  // This is the key to consistency - same formula everywhere
  const winRate =
    totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 1000) / 10 : 0;

  // Calculate winLossRatio directly too
  const winLossRatio =
    losingTrades > 0
      ? winningTrades / losingTrades
      : winningTrades > 0
      ? winningTrades
      : 0;

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    totalProfit: stats.totalProfit || 0,
    // Use our directly calculated values
    winRate,
    winLossRatio,
    // Store original stats for reference if needed
    _original: { ...stats },
  };
};
