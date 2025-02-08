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
        const response = await fetch("http://localhost:5000/api/auth/traders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        `http://localhost:5000/api/auth/follow/${traderId}`,
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

      // Update the traders list to reflect the new follow state
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
    return <div className="flex justify-center p-8">Loading traders...</div>;
  if (error)
    return (
      <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
    );

  return (
    <div className="space-y-6 p-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search traders by name or trading style..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Traders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTraders.map((trader) => (
          <div
            key={trader._id}
            className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <Link to={`/community/profile/${trader.username}`}>
                <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                  {trader.username}
                </h3>
              </Link>
              {user._id !== trader._id && (
                <button
                  onClick={() => handleFollow(trader._id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    trader.followers.includes(user._id)
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {trader.followers.includes(user._id) ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {trader.tradingStyle && (
                <p className="text-sm text-gray-600">
                  Trading Style: {trader.tradingStyle}
                </p>
              )}
              {trader.bio && (
                <p className="text-sm text-gray-600">{trader.bio}</p>
              )}
            </div>

            <div
              className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {trader.stats?.totalTrades || 0}
                </p>
                <p className="text-xs text-gray-500">Trades</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {trader.followers?.length || 0}
                </p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {trader.stats?.winRate ? `${trader.stats.winRate}%` : "0%"}
                </p>
                <p className="text-xs text-gray-500">Win Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Traders;
