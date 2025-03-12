import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  UserX,
  TrendingUp,
  Users,
  ChevronDown,
  Filter,
  Award,
  BarChart2,
} from "lucide-react";

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
          `${import.meta.env.VITE_API_URL}/api/auth/network/${userId}`,
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

        // Make sure we have an array of connections
        if (data && data.data) {
          // If data.data is not an array itself, create an empty array
          const connections = Array.isArray(data.data) ? data.data : [];
          setNetworkData(connections);
        } else {
          setNetworkData([]);
        }
      } catch (err) {
        console.error("Network fetch error:", err);
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

  // Ensure networkData is an array and each item has the expected structure before filtering
  const filteredNetworkData = Array.isArray(networkData)
    ? networkData.filter((connection) => {
        // Check if relationship property exists and has the expected structure
        if (!connection || !connection.relationship) return false;

        if (filter === "followers") return connection.relationship.isFollower;
        if (filter === "following") return connection.relationship.isFollowing;
        return true;
      })
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>
          <div className="h-2.5 w-2.5 bg-primary/70 rounded-full"></div>
          <div className="h-2.5 w-2.5 bg-primary/40 rounded-full"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading network data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400 bg-red-50/90 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 rounded-full bg-red-100 dark:bg-red-800/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-600 dark:text-red-400"
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
          </div>
          <h3 className="font-medium">Error Loading Network</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!networkData || networkData.length === 0) {
    return (
      <div className="text-center p-8 bg-white/90 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm">
        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700/50 inline-flex mx-auto mb-4">
          <UserX className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Connections Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
          Follow other traders or get followers to build your network
        </p>
        <Link
          to="/community/traders"
          className="mt-4 inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md shadow text-sm transition-all"
        >
          Discover Traders
        </Link>
      </div>
    );
  }

  const isViewingOwnProfile = user?._id === userId;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <div className="h-5 w-1 bg-primary rounded-full mr-2"></div>
          {isViewingOwnProfile ? "Your Network" : "Network"}
        </h2>
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600/70 rounded-md 
              bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
              focus:ring-2 focus:ring-primary focus:border-primary text-sm appearance-none"
            >
              <option value="all">All Connections</option>
              <option value="followers">Followers</option>
              <option value="following">Following</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNetworkData.map((connection) => {
          // Safety check to ensure we have the expected structure
          if (!connection || !connection._id) {
            return null;
          }

          return (
            <div
              key={connection._id}
              className="bg-white/90 dark:bg-gray-800/60 p-5 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-4">
                <div>
                  <Link
                    to={`/community/profile/${connection.username}`}
                    className="text-lg font-semibold text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition-colors"
                  >
                    {connection.username || "Unknown User"}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {connection.tradingStyle || "Trader"}
                  </p>
                  {isViewingOwnProfile && connection.relationship && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {connection.relationship.isFollower && (
                        <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 px-2 py-1 rounded-md font-medium">
                          Follows you
                        </span>
                      )}
                      {connection.relationship.isFollowing && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md font-medium">
                          Following
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {connection.stats &&
                  typeof connection.stats.totalTrades === "number" &&
                  connection.stats.totalTrades > 0 && (
                    <div className="flex items-center text-sm px-2.5 py-1 rounded-full bg-gray-50/80 dark:bg-gray-700/30">
                      <TrendingUp
                        className={`h-4 w-4 mr-1 ${
                          connection.stats.totalProfit >= 0
                            ? "text-green-500 dark:text-green-400"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          connection.stats.totalProfit >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(connection.stats.totalProfit || 0)}
                      </span>
                    </div>
                  )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50/80 dark:bg-gray-700/30 p-3 rounded-md flex flex-col items-center">
                  <BarChart2 className="h-4 w-4 text-primary/70 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Trades
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {connection.stats?.totalTrades || 0}
                  </p>
                </div>
                <div className="bg-gray-50/80 dark:bg-gray-700/30 p-3 rounded-md flex flex-col items-center">
                  <TrendingUp className="h-4 w-4 text-accent/70 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Win Rate
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {connection.stats && connection.stats.totalTrades > 0
                      ? (
                          (connection.stats.winningTrades /
                            connection.stats.totalTrades) *
                            100 || 0
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
                <div className="bg-gray-50/80 dark:bg-gray-700/30 p-3 rounded-md flex flex-col items-center">
                  <Users className="h-4 w-4 text-secondary/70 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Followers
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {Array.isArray(connection.followers)
                      ? connection.followers.length
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Network;
