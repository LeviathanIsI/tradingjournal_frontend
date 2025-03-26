import { Link } from "react-router-dom";
import { Award, TrendingUp, BarChart2 } from "lucide-react";
import { useTradingStats } from "../../context/TradingStatsContext";

/**
 * Mobile-optimized leaderboard card that uses TradingStatsContext for consistent formatting
 * @param {Object} props
 * @param {Object} props.trader - Trader data
 * @param {number} props.rank - Trader's rank
 * @param {boolean} props.isCurrentUser - Whether this card represents the current user
 */
const LeaderboardMobileCard = ({ trader, rank, isCurrentUser = false }) => {
  const { formatters } = useTradingStats();
  const { formatCurrency } = formatters;

  if (!trader) return null;

  // Ensure we're displaying consistent stats
  const totalProfit = trader.stats?.totalProfit || 0;
  const winRate = trader.stats?.winRate || 0;
  const totalTrades = trader.stats?.totalTrades || 0;

  return (
    <div
      className={`bg-white/90 dark:bg-gray-800/60 rounded-sm border ${
        isCurrentUser
          ? "border-primary/30 dark:border-primary/40"
          : "border-gray-200 dark:border-gray-700/40"
      } shadow-sm p-4 space-y-3 backdrop-blur-sm mb-3`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 dark:bg-primary/20">
            <span className="text-xs font-medium text-primary dark:text-primary/90">
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
            {rank <= 3 && (
              <Award
                className={`h-3.5 w-3.5 ml-1 ${
                  rank === 1
                    ? "text-yellow-500"
                    : rank === 2
                    ? "text-gray-400"
                    : "text-amber-600"
                }`}
              />
            )}
            {isCurrentUser && (
              <span className="ml-1.5 px-1 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded text-xs">
                You
              </span>
            )}
          </div>
        </div>
        <span
          className={`text-sm font-bold px-2 py-0.5 rounded-full ${
            totalProfit >= 0
              ? "bg-green-100/80 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(totalProfit)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50/80 dark:bg-gray-700/30 p-2.5 rounded">
        <div className="flex items-center">
          <TrendingUp className="h-3.5 w-3.5 text-primary/70 mr-1.5" />
          <span className="text-gray-500 dark:text-gray-400">Win Rate:</span>
          <span className="ml-1 text-gray-900 dark:text-gray-100 font-medium">
            {winRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center">
          <BarChart2 className="h-3.5 w-3.5 text-accent/70 mr-1.5" />
          <span className="text-gray-500 dark:text-gray-400">Trades:</span>
          <span className="ml-1 text-gray-900 dark:text-gray-100 font-medium">
            {totalTrades}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardMobileCard;
