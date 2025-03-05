import React from "react";
import { Link } from "react-router-dom";
import { UserCheck, UserPlus, TrendingUp, Award } from "lucide-react";

const TraderCard = ({ trader, currentUserId, onFollowToggle }) => {
  const isFollowing = trader.followers.includes(currentUserId);

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-600/50 bg-gray-50 dark:bg-gray-600/40">
        <Link
          to={`/community/profile/${trader.username}`}
          className="flex items-center"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-500 dark:bg-blue-500/80 text-white font-bold mr-2">
            {trader.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-300">
            {trader.username}
          </h3>
        </Link>

        {currentUserId !== trader._id && (
          <button
            onClick={() => onFollowToggle(trader._id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              isFollowing
                ? "bg-gray-100 dark:bg-gray-600/70 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "bg-blue-500/10 dark:bg-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 dark:hover:bg-blue-500/40"
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
      <div className="p-4">
        {trader.tradingStyle && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
            <TrendingUp className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
            <span className="font-medium">{trader.tradingStyle}</span>
          </div>
        )}

        {trader.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
            {trader.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-100 dark:border-gray-600/50">
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 dark:bg-blue-700/20 w-full rounded-sm py-2 flex justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-300 mr-1" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {trader.stats?.totalTrades || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-300">Trades</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-purple-50 dark:bg-purple-700/20 w-full rounded-sm py-2 flex justify-center mb-1">
              <UserCheck className="h-4 w-4 text-purple-500 dark:text-purple-300 mr-1" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {trader.followers?.length || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-300">
              Followers
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-full rounded-sm py-2 flex justify-center mb-1 ${
                (trader.stats?.winRate || 0) >= 50
                  ? "bg-green-50 dark:bg-green-700/20"
                  : "bg-red-50 dark:bg-red-700/20"
              }`}
            >
              <Award
                className={`h-4 w-4 mr-1 ${
                  (trader.stats?.winRate || 0) >= 50
                    ? "text-green-500 dark:text-green-300"
                    : "text-red-500 dark:text-red-300"
                }`}
              />
              <span
                className={`font-semibold ${
                  (trader.stats?.winRate || 0) >= 50
                    ? "text-green-600 dark:text-green-300"
                    : "text-red-600 dark:text-red-300"
                }`}
              >
                {trader.stats?.winRate ? `${trader.stats.winRate}%` : "0%"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-300">Win Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderCard;
