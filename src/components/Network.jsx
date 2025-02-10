import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { UserX, TrendingUp } from "lucide-react";

const Network = ({ userId }) => {
  const { user } = useAuth();
  const [networkData, setNetworkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/auth/network/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch network data");
        }

        const data = await response.json();
        setNetworkData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchNetworkData();
    }
  }, [userId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const filteredNetworkData = networkData.filter((connection) => {
    if (filter === "followers") return connection.relationship.isFollower;
    if (filter === "following") return connection.relationship.isFollowing;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center p-4">
        Error loading network data: {error}
      </div>
    );
  }

  if (!networkData.length) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <UserX className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Connections Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Follow other traders or get followers to build your network
        </p>
      </div>
    );
  }

  const isViewingOwnProfile = user?._id === userId;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {isViewingOwnProfile ? "Your Network" : "Network"}
        </h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Connections</option>
            <option value="followers">Followers</option>
            <option value="following">Following</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNetworkData.map((connection) => (
          <div
            key={connection._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <Link
                  to={`/community/profile/${connection.username}`}
                  className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {connection.username}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {connection.tradingStyle || "Trader"}
                </p>
                {isViewingOwnProfile && (
                  <div className="flex gap-2 mt-1">
                    {connection.relationship.isFollower && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                        Follows you
                      </span>
                    )}
                    {connection.relationship.isFollowing && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                        Following
                      </span>
                    )}
                  </div>
                )}
              </div>
              {connection.stats.totalTrades > 0 && (
                <div className="flex items-center text-sm">
                  <TrendingUp
                    className={`h-4 w-4 mr-1 ${
                      connection.stats.totalProfit >= 0
                        ? "text-green-500 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  />
                  <span
                    className={
                      connection.stats.totalProfit >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {formatCurrency(connection.stats.totalProfit)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trades
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {connection.stats.totalTrades}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Win Rate
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {(
                    (connection.stats.winningTrades /
                      connection.stats.totalTrades) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Followers
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {connection.followers?.length || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Network;
