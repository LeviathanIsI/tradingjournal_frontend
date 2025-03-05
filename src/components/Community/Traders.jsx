import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserCheck,
  UserPlus,
  TrendingUp,
  BarChart2,
  Award,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Traders = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Fetch traders (keeping existing code)
  useEffect(() => {
    const fetchTraders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/traders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch traders");
        }

        setTraders(data.data);
      } catch (error) {
        console.error("Error fetching traders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTraders();
  }, []);

  // Handle follow (keeping existing code)
  const handleFollow = async (traderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/follow/${traderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to follow trader");
      }

      setTraders(
        traders.map((trader) => {
          if (trader._id === traderId) {
            const isNowFollowing = !trader.followers.includes(user._id);
            return {
              ...trader,
              followers: isNowFollowing
                ? [...trader.followers, user._id]
                : trader.followers.filter((id) => id !== user._id),
            };
          }
          return trader;
        })
      );
    } catch (error) {
      console.error("Error following trader:", error);
    }
  };

  const filteredTraders = traders.filter(
    (trader) =>
      trader.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trader.tradingStyle &&
        trader.tradingStyle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Loading and error states with updated styling
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-blue-500 dark:bg-blue-400 rounded-sm animate-spin mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading traders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64 p-6 bg-red-50 dark:bg-red-800/10 rounded-md">
        <div className="text-red-600 dark:text-red-400 flex flex-col items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="font-medium">Error: {error}</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6">
      {/* Search Bar - Updated with subtle rounded design and softer dark mode */}
      <div className="mb-6">
        <div className="relative w-full max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search traders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-500 rounded-md
            bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-200 
            focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
            placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* No traders found message */}
      {filteredTraders.length === 0 && (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-md">
          <p className="text-gray-500 dark:text-gray-300">
            No traders found matching your search
          </p>
        </div>
      )}

      {/* Traders Grid - Updated with softer dark mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTraders.map((trader) => (
          <div
            key={trader._id}
            className="relative overflow-hidden bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header with username and follow button */}
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

              {user._id !== trader._id && (
                <button
                  onClick={() => handleFollow(trader._id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    trader.followers.includes(user._id)
                      ? "bg-gray-100 dark:bg-gray-600/70 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      : "bg-blue-500/10 dark:bg-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 dark:hover:bg-blue-500/40"
                  }`}
                >
                  {trader.followers.includes(user._id) ? (
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

            {/* Body with trader info */}
            <div className="p-4">
              {/* Trading style with icon */}
              {trader.tradingStyle && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <Clock className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                  <span className="font-medium">{trader.tradingStyle}</span>
                </div>
              )}

              {/* Bio */}
              {trader.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                  {trader.bio}
                </p>
              )}

              {/* Stats with visual indicators */}
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-100 dark:border-gray-600/50">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-50 dark:bg-blue-700/20 w-full rounded-sm py-2 flex justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-300 mr-1" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {trader.stats?.totalTrades || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Trades
                  </p>
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
                      {trader.stats?.winRate
                        ? `${trader.stats.winRate}%`
                        : "0%"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Win Rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Traders;
