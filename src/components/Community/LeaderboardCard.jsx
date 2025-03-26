import { Link } from "react-router-dom";
import { Award, TrendingUp, BarChart2 } from "lucide-react";
import { useTradingStats } from "../../context/TradingStatsContext";

/**
 * Enhanced LeaderboardCard component that uses TradingStatsContext for consistent data
 * @param {Object} props
 * @param {Object} props.trader - Trader data
 * @param {number} props.rank - Trader's rank
 * @param {string} props.variant - Display variant ('mobile', 'detailed', 'default')
 * @param {boolean} props.isCurrentUser - Whether this card represents the current user
 */
const LeaderboardCard = ({
  trader,
  rank,
  variant = "default",
  isCurrentUser = false,
}) => {
  const { formatters } = useTradingStats();
  const { formatCurrency } = formatters;

  if (!trader) return null;

  // Determine container styling based on variant
  const getContainerClass = () => {
    const baseClass = "space-y-4";

    switch (variant) {
      case "mobile":
        return `${baseClass} p-3 bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm`;
      case "detailed":
        return `${baseClass} p-4 border-b border-gray-200 dark:border-gray-700/40 ${
          isCurrentUser ? "bg-primary/5 dark:bg-primary/10" : ""
        }`;
      default:
        return `${baseClass} p-4 bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow`;
    }
  };

  // Return medal icon for top 3 positions
  const getMedalIcon = () => {
    if (rank > 3) return null;

    return (
      <Award
        className={`h-4 w-4 ml-1 ${
          rank === 1
            ? "text-yellow-500"
            : rank === 2
            ? "text-gray-400"
            : "text-amber-600"
        }`}
      />
    );
  };

  // Ensure we're displaying consistent stats
  const totalProfit = trader.stats?.totalProfit || 0;
  const winRate = trader.stats?.winRate || 0;
  const totalTrades = trader.stats?.totalTrades || 0;

  return (
    <div className={getContainerClass()}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center ${
              variant === "detailed"
                ? ""
                : "h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20"
            }`}
          >
            <span
              className={`text-sm font-medium ${
                variant === "detailed"
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-primary dark:text-primary/90"
              }`}
            >
              {rank}
            </span>
          </div>
          <div className="flex items-center">
            <Link
              to={`/community/profile/${trader.username}`}
              className="text-sm font-medium text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition-colors"
            >
              {trader.username}
            </Link>
            {getMedalIcon()}
            {isCurrentUser && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded">
                You
              </span>
            )}
          </div>
        </div>
        <span
          className={`text-sm font-bold ${
            variant !== "mobile" ? "px-2.5 py-1 rounded-full" : ""
          } ${
            totalProfit >= 0
              ? "bg-green-100/80 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(totalProfit)}
        </span>
      </div>

      <div
        className={`grid grid-cols-2 gap-4 text-sm ${
          variant === "detailed"
            ? ""
            : "bg-gray-50/80 dark:bg-gray-700/30 p-3 round-sm"
        }`}
      >
        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 text-primary/70 mr-2" />
          <span className="text-gray-500 dark:text-gray-400">Win Rate:</span>
          <span className="ml-1.5 text-gray-900 dark:text-gray-100 font-medium">
            {winRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center">
          <BarChart2 className="h-4 w-4 text-accent/70 mr-2" />
          <span className="text-gray-500 dark:text-gray-400">Trades:</span>
          <span className="ml-1.5 text-gray-900 dark:text-gray-100 font-medium">
            {totalTrades}
          </span>
        </div>
      </div>

      {variant === "default" && (
        <div className="h-1 w-16 bg-primary/10 rounded-full"></div>
      )}
    </div>
  );
};

export default LeaderboardCard;
