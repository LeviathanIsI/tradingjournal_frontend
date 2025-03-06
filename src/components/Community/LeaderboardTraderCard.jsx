import { Link } from "react-router-dom";

/**
 * Enhanced LeaderboardCard component that supports multiple display variants
 * @param {Object} props
 * @param {Object} props.trader - Trader data
 * @param {number} props.rank - Trader's rank
 * @param {Function} props.formatCurrency - Function to format currency values
 * @param {string} props.variant - Display variant ('mobile', 'detailed', 'default')
 */
const LeaderboardCard = ({
  trader,
  rank,
  formatCurrency,
  variant = "default",
}) => {
  if (!trader) return null;

  // Add border bottom for detailed variant
  const containerClass =
    variant === "detailed"
      ? "p-4 space-y-3 border-b border-gray-200 dark:border-gray-700"
      : "p-4 space-y-3";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            #{rank}
          </span>
          <Link
            to={`/community/profile/${trader.username}`}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {trader.username}
          </Link>
        </div>
        <span
          className={`text-sm font-medium ${
            trader.stats.totalProfit >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(trader.stats.totalProfit)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Win Rate:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">
            {trader.stats.winRate}%
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Trades:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">
            {trader.stats.totalTrades}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;
