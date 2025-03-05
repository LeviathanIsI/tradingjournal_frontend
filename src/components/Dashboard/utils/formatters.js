// components/Dashboard/utils/formatters.js
import { formatInTimeZone } from "date-fns-tz";

/**
 * Formats a number as currency with intelligent decimal handling
 * @param {number} value - The monetary value to format
 * @param {number} maxDecimals - Maximum number of decimal places to show
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, maxDecimals = 2) => {
  if (!value && value !== 0) return "-";

  // Convert to string and remove any existing formatting
  const numStr = Math.abs(value).toString();

  // Find the number of actual decimal places
  const decimalPlaces = numStr.includes(".")
    ? numStr.split(".")[1].replace(/0+$/, "").length // Remove trailing zeros
    : 0;

  // Use the smaller of actual decimal places or maxDecimals
  const decimals = Math.min(decimalPlaces, maxDecimals);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formats a date string according to user's timezone
 * @param {string|Date} dateString - ISO date string or Date object to format
 * @param {string} userTimeZone - User's timezone (e.g., "America/New_York")
 * @param {string} format - Date format string (default: "MM/dd/yyyy hh:mm a")
 * @returns {string} Formatted date string
 */
export const formatDate = (
  dateString,
  userTimeZone,
  format = "MM/dd/yyyy hh:mm a"
) => {
  if (!dateString) return "-";

  return formatInTimeZone(new Date(dateString), userTimeZone || "UTC", format);
};

/**
 * Formats a percentage value
 * @param {number} value - The percentage value to format
 * @param {number} decimals - Number of decimal places to include
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === undefined || value === null) return "-";

  return `${value.toFixed(decimals)}%`;
};

/**
 * Formats a number with thousand separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places to include
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === undefined || value === null) return "-";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
