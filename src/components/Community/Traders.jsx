import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserCheck,
  UserPlus,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTradingStats } from "../../context/TradingStatsContext";
import TraderCard from "./TraderCard";

const Traders = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { formatters, getWinRate, normalizeTraderStats } = useTradingStats();
  const { formatPercent } = formatters;

  // Fetch traders
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

        // Normalize trader stats before setting state
        const normalizedTraders = data.data.map(normalizeTraderStats);
        setTraders(normalizedTraders);
      } catch (error) {
        console.error("Error fetching traders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTraders();
  }, [normalizeTraderStats]);

  // Handle follow
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
            return normalizeTraderStats({
              ...trader,
              followers: isNowFollowing
                ? [...trader.followers, user._id]
                : trader.followers.filter((id) => id !== user._id),
            });
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

      {/* Traders Grid - Using TraderCard for consistent display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTraders.map((trader) => (
          <TraderCard
            key={trader._id}
            trader={trader}
            currentUserId={user._id}
            onFollowToggle={handleFollow}
          />
        ))}
      </div>
    </div>
  );
};

export default Traders;
