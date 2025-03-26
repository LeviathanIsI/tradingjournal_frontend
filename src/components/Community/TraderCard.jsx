import React from "react";
import { Link } from "react-router-dom";
import { UserCheck, UserPlus, LineChart, Award, User } from "lucide-react";
import { useTradingStats } from "../../context/TradingStatsContext";

const TraderCard = ({ trader, currentUserId, onFollowToggle }) => {
  const isFollowing = trader.followers.includes(currentUserId);
  const { formatters } = useTradingStats();
  const { formatPercent } = formatters;

  // IMPORTANT: Calculate win rate directly and consistently here
  // This ensures the same calculation is used everywhere
  const totalTrades = trader.stats?.totalTrades || 0;
  const winningTrades =
    trader.stats?.winningTrades || trader.stats?.profitableTrades || 0;
  const winRate =
    totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 1000) / 10 : 0;

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/30">
        <Link
          to={`/community/profile/${trader.username}`}
          className="flex items-center group"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary dark:bg-primary text-white font-bold mr-3 shadow-sm">
            {trader.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
            {trader.username}
          </h3>
        </Link>

        {currentUserId !== trader._id && (
          <button
            onClick={() => onFollowToggle(trader._id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 round-sm text-xs font-medium transition-colors ${
              isFollowing
                ? "bg-gray-100 dark:bg-gray-600/70 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Trader details */}
      <div className="p-5">
        {trader.tradingStyle && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
            <LineChart className="h-4 w-4 mr-1.5 text-primary dark:text-primary-light opacity-70" />
            <span className="font-medium">{trader.tradingStyle}</span>
          </div>
        )}

        {trader.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-5">
            {trader.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700/40">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 dark:bg-primary/20 w-full round-sm py-2.5 flex items-center justify-center mb-1.5">
              <LineChart className="h-4 w-4 text-primary dark:text-primary-light mr-1.5" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {trader.stats?.totalTrades || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Trades</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-accent/10 dark:bg-accent/20 w-full round-sm py-2.5 flex items-center justify-center mb-1.5">
              <User className="h-4 w-4 text-accent dark:text-accent-light mr-1.5" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {trader.followers?.length || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Followers
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-full round-sm py-2.5 flex items-center justify-center mb-1.5 ${
                winRate >= 50
                  ? "bg-green-100/90 dark:bg-green-800/30"
                  : "bg-red-100/90 dark:bg-red-800/30"
              }`}
            >
              <Award
                className={`h-4 w-4 mr-1.5 ${
                  winRate >= 50
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
              <span
                className={`font-semibold ${
                  winRate >= 50
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {`${winRate.toFixed(1)}%`}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;
