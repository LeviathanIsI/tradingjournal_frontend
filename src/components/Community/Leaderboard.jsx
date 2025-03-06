// Update to the Leaderboard component
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Trophy, LineChart, Target } from "lucide-react";

// Include the LeaderboardStatsCard component directly in this file
const LeaderboardStatsCard = ({ icon, label, value, valueColor, detail }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-gray-700/60 p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
    <div className="p-2 rounded-sm bg-blue-50 dark:bg-blue-900/30">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-base font-semibold ${valueColor}`}>{value}</p>
      {detail && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{detail}</p>
      )}
    </div>
  </div>
);

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("stats.totalProfit");
  const [sortOrder, setSortOrder] = useState("desc");
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFrame]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("Fetching leaderboard data for timeFrame:", timeFrame);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/auth/leaderboard?timeFrame=${timeFrame}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(
          `Server returned ${response.status}: ${
            errorText || "No error details"
          }`
        );
      }

      const result = await response.json();
      console.log("Leaderboard response:", result);

      if (!result.success || !result.data) {
        throw new Error("Invalid response format from server");
      }

      // Sort the data
      const sortedData = sortLeaderboardData(result.data, sortField, sortOrder);
      setLeaderboardData(sortedData);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortLeaderboardData = (data, field, order) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;

      // Handle nested fields like stats.totalProfit
      if (field.includes(".")) {
        const [parentField, childField] = field.split(".");
        valueA = a[parentField] ? a[parentField][childField] : 0;
        valueB = b[parentField] ? b[parentField][childField] : 0;
      } else {
        valueA = a[field] || 0;
        valueB = b[field] || 0;
      }

      // For numeric values
      if (typeof valueA === "number" && typeof valueB === "number") {
        return order === "asc" ? valueA - valueB : valueB - valueA;
      }

      // For string values
      return order === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  };

  const handleSort = (field) => {
    const newOrder =
      field === sortField && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);

    const sortedData = sortLeaderboardData(leaderboardData, field, newOrder);
    setLeaderboardData(sortedData);
  };

  // Get top performers
  const getTopPerformers = () => {
    // Filter traders with actual trades
    const activeTraders = leaderboardData.filter(
      (trader) => trader.stats && trader.stats.totalTrades > 0
    );

    if (activeTraders.length === 0) {
      return {
        topProfit: { value: "$0.00", color: "text-green-500" },
        topWinRate: { value: "0.0%", color: "text-blue-500" },
        bestWinLossRatio: {
          value: "0",
          color: "text-purple-500",
          detail: "0 W / 0 L",
        },
      };
    }

    // Find trader with highest profit
    const topProfitTrader = [...activeTraders].sort(
      (a, b) => (b.stats?.totalProfit || 0) - (a.stats?.totalProfit || 0)
    )[0];

    // Find trader with highest win rate (with minimum trades)
    const topWinRateTrader =
      [...activeTraders]
        .filter((trader) => trader.stats?.totalTrades >= 3) // Minimum 3 trades to qualify
        .sort((a, b) => (b.stats?.winRate || 0) - (a.stats?.winRate || 0))[0] ||
      activeTraders[0];

    // Find trader with best win/loss ratio (minimum 5 total trades)
    const bestRatioTrader =
      [...activeTraders]
        .filter((trader) => trader.stats?.totalTrades >= 5) // Minimum 5 trades to qualify
        .sort(
          (a, b) => (b.stats?.winLossRatio || 0) - (a.stats?.winLossRatio || 0)
        )[0] || activeTraders[0];

    const profitValue = topProfitTrader.stats?.totalProfit || 0;
    const formattedProfit = `$${Math.abs(profitValue).toFixed(2)}`;

    return {
      topProfit: {
        value: profitValue >= 0 ? formattedProfit : `-${formattedProfit}`,
        color: profitValue >= 0 ? "text-green-500" : "text-red-500",
        detail: topProfitTrader.username,
      },
      topWinRate: {
        value: `${(topWinRateTrader.stats?.winRate || 0).toFixed(1)}%`,
        color: "text-blue-500",
        detail: `(${topWinRateTrader.stats?.winningTrades || 0} W / ${
          topWinRateTrader.stats?.losingTrades || 0
        } L)`,
      },
      bestWinLossRatio: {
        value: `${(bestRatioTrader.stats?.winLossRatio || 0).toFixed(2)}`,
        color: "text-purple-500",
        detail: `(${bestRatioTrader.stats?.winningTrades || 0} W / ${
          bestRatioTrader.stats?.losingTrades || 0
        } L)`,
      },
    };
  };

  const topPerformers = getTopPerformers();

  if (loading)
    return (
      <div className="p-4 text-gray-700 dark:text-gray-300">
        Loading leaderboard data...
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-600 dark:text-red-400">Error: {error}</div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Trader Leaderboard
      </h1>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <LeaderboardStatsCard
          icon={
            <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          }
          label="Top Trader Profit"
          value={topPerformers.topProfit.value}
          valueColor={topPerformers.topProfit.color}
          detail={topPerformers.topProfit.detail}
        />

        <LeaderboardStatsCard
          icon={<Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          label="Best Win Rate"
          value={topPerformers.topWinRate.value}
          valueColor={topPerformers.topWinRate.color}
          detail={topPerformers.topWinRate.detail}
        />

        <LeaderboardStatsCard
          icon={
            <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          }
          label="Best Win/Loss Ratio"
          value={topPerformers.bestWinLossRatio.value}
          valueColor={topPerformers.bestWinLossRatio.color}
          detail={topPerformers.bestWinLossRatio.detail}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="text-gray-700 dark:text-gray-300 mr-2">
            Time Period
          </label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border border-gray-300 dark:border-gray-600/70 rounded-sm shadow-sm px-3 py-2 
            bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <button
          onClick={() => handleSort("stats.totalProfit")}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-sm 
          hover:bg-blue-700 dark:hover:bg-blue-600 text-sm"
        >
          Sort by Profit{" "}
          {sortField === "stats.totalProfit" &&
            (sortOrder === "desc" ? "▼" : "▲")}
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-700/60 rounded-sm shadow-sm border border-gray-200 dark:border-gray-600/50">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-600/50 text-left text-xs uppercase">
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300">
                Rank
              </th>
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300">
                Trader
              </th>
              <th
                className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort("stats.totalProfit")}
              >
                Profit{" "}
                {sortField === "stats.totalProfit" &&
                  (sortOrder === "desc" ? "▼" : "▲")}
              </th>
              <th
                className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort("stats.winRate")}
              >
                Win Rate{" "}
                {sortField === "stats.winRate" &&
                  (sortOrder === "desc" ? "▼" : "▲")}
              </th>
              <th
                className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer"
                onClick={() => handleSort("stats.totalTrades")}
              >
                Trades{" "}
                {sortField === "stats.totalTrades" &&
                  (sortOrder === "desc" ? "▼" : "▲")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600/50">
            {leaderboardData.map((trader, index) => (
              <tr
                key={trader._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-600/30 ${
                  trader._id === user?._id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
              >
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-blue-600 dark:text-blue-400">
                  {trader.username}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      (trader.stats?.totalProfit || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    ${Math.abs(trader.stats?.totalProfit || 0).toFixed(2)}
                    {(trader.stats?.totalProfit || 0) < 0 && "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-blue-600 dark:text-blue-400">
                  {(trader.stats?.winRate || 0).toFixed(1)}%
                  {trader.stats?.winningTrades > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({trader.stats.winningTrades} W /{" "}
                      {trader.stats.losingTrades} L)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-purple-500 dark:text-purple-400">
                  {trader.stats?.totalTrades || 0}
                </td>
              </tr>
            ))}

            {leaderboardData.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No trading data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
