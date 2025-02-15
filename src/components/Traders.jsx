import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, UserCheck, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Traders = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

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

  if (loading)
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-gray-100">
        Loading traders...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center p-8 text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Search Bar - Adjusted padding and touch target */}
      <div className="relative w-full sm:max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Search traders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Traders Grid - Single column on mobile, multiple on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filteredTraders.map((trader) => (
          <div
            key={trader._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <Link to={`/community/profile/${trader.username}`}>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                  {trader.username}
                </h3>
              </Link>
              {user._id !== trader._id && (
                <button
                  onClick={() => handleFollow(trader._id)}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                    trader.followers.includes(user._id)
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  }`}
                >
                  {trader.followers.includes(user._id) ? (
                    <>
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {trader.tradingStyle && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Trading Style: {trader.tradingStyle}
                </p>
              )}
              {trader.bio && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {trader.bio}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {trader.stats?.totalTrades || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Trades
                </p>
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {trader.followers?.length || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Followers
                </p>
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {trader.stats?.winRate ? `${trader.stats.winRate}%` : "0%"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Win Rate
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Traders;
