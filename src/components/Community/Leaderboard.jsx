// src/components/Community/Leaderboard.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTradingStats } from "../../context/TradingStatsContext";
import {
  Trophy,
  LineChart,
  Target,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
} from "lucide-react";

// Updated LeaderboardStatsCard component
const LeaderboardStatsCard = ({ icon, label, value, valueColor, detail }) => (
  <div className="bg-white/90 dark:bg-gray-800/60 p-4 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm transition-all hover:shadow">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-full bg-primary/10 dark:bg-primary/20 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
          {label}
        </p>
        <p className={`text-lg font-bold ${valueColor}`}>{value}</p>
        {detail && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {detail}
          </p>
        )}
      </div>
    </div>
    <div className="h-1 w-16 bg-primary/10 rounded-full mt-2.5"></div>
  </div>
);

const Leaderboard = () => {
  const [sortField, setSortField] = useState("stats.totalProfit");
  const [sortOrder, setSortOrder] = useState("desc");
  const { user } = useAuth();
  const {
    leaderboardData,
    timeFrame,
    setTimeFrame,
    loading,
    error,
    formatters,
  } = useTradingStats();

  const { formatCurrency, formatPercent } = formatters;

  const handleSort = (field) => {
    const newOrder =
      field === sortField && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);

    // Sorting is now handled within this component
    // instead of modifying the original data in context
  };

  // Get sorted leaderboard data
  const getSortedLeaderboardData = () => {
    return [...leaderboardData].sort((a, b) => {
      let valueA, valueB;

      // Handle nested fields like stats.totalProfit
      if (sortField.includes(".")) {
        const [parentField, childField] = sortField.split(".");
        valueA = a[parentField] ? a[parentField][childField] : 0;
        valueB = b[parentField] ? b[parentField][childField] : 0;
      } else {
        valueA = a[sortField] || 0;
        valueB = b[sortField] || 0;
      }

      // For numeric values
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      // For string values
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  };

  // Get top performers
  const getTopPerformers = () => {
    // Filter traders with actual trades
    const activeTraders = leaderboardData.filter(
      (trader) => trader.stats && trader.stats.totalTrades > 0
    );

    if (activeTraders.length === 0) {
      return {
        topProfit: {
          value: "$0.00",
          color: "text-green-600 dark:text-green-400",
        },
        topWinRate: { value: "0.0%", color: "text-primary dark:text-primary" },
        bestWinLossRatio: {
          value: "0",
          color: "text-accent dark:text-accent",
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

    return {
      topProfit: {
        value: formatCurrency(topProfitTrader.stats?.totalProfit || 0),
        color:
          (topProfitTrader.stats?.totalProfit || 0) >= 0
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400",
        detail: topProfitTrader.username,
      },
      topWinRate: {
        value: formatPercent(topWinRateTrader.stats?.winRate || 0),
        color: "text-primary dark:text-primary",
        detail: `${topWinRateTrader.username} (${
          topWinRateTrader.stats?.winningTrades || 0
        } W / ${topWinRateTrader.stats?.losingTrades || 0} L)`,
      },
      bestWinLossRatio: {
        value: (bestRatioTrader.stats?.winLossRatio || 0).toFixed(2),
        color: "text-accent dark:text-accent",
        detail: `${bestRatioTrader.username} (${
          bestRatioTrader.stats?.winningTrades || 0
        } W / ${bestRatioTrader.stats?.losingTrades || 0} L)`,
      },
    };
  };

  const sortedData = getSortedLeaderboardData();
  const topPerformers = getTopPerformers();

  if (loading)
    return (
      <div className="flex items-center justify-center p-8 rounded-lg bg-white/90 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/40 shadow-sm">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>
          <div className="h-2.5 w-2.5 bg-primary/70 rounded-full"></div>
          <div className="h-2.5 w-2.5 bg-primary/40 rounded-full"></div>
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            Loading leaderboard data...
          </span>
        </div>
      </div>
    );

  if (error)
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
          <h3 className="font-medium">Error Loading Leaderboard</h3>
        </div>
        <p>{error}</p>
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
        <div className="h-6 w-1.5 bg-primary rounded-full mr-3"></div>
        Trader Leaderboard
      </h1>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <LeaderboardStatsCard
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          label="Top Trader Profit"
          value={topPerformers.topProfit.value}
          valueColor={topPerformers.topProfit.color}
          detail={topPerformers.topProfit.detail}
        />

        <LeaderboardStatsCard
          icon={<Target className="h-5 w-5 text-primary" />}
          label="Best Win Rate"
          value={topPerformers.topWinRate.value}
          valueColor={topPerformers.topWinRate.color}
          detail={topPerformers.topWinRate.detail}
        />

        <LeaderboardStatsCard
          icon={<LineChart className="h-5 w-5 text-accent" />}
          label="Best Win/Loss Ratio"
          value={topPerformers.bestWinLossRatio.value}
          valueColor={topPerformers.bestWinLossRatio.color}
          detail={topPerformers.bestWinLossRatio.detail}
        />
      </div>

      {/* Filter Controls */}
      <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200/70 dark:border-gray-600/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Period
          </label>
          <div className="relative">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600/70 rounded-md 
              bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
              focus:ring-2 focus:ring-primary focus:border-primary text-sm appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleSort("stats.totalProfit")}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md shadow 
          hover:shadow-md transition-all text-sm flex items-center gap-1.5"
        >
          <Filter className="h-4 w-4" />
          Sort by Profit
          {sortField === "stats.totalProfit" &&
            (sortOrder === "desc" ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            ))}
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto bg-white/90 dark:bg-gray-800/60 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-700/40 text-left text-xs uppercase">
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium">
                Rank
              </th>
              <th className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium">
                Trader
              </th>
              <th
                className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer font-medium"
                onClick={() => handleSort("stats.totalProfit")}
              >
                <div className="flex items-center gap-1">
                  Profit
                  {sortField === "stats.totalProfit" &&
                    (sortOrder === "desc" ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer font-medium"
                onClick={() => handleSort("stats.winRate")}
              >
                <div className="flex items-center gap-1">
                  Win Rate
                  {sortField === "stats.winRate" &&
                    (sortOrder === "desc" ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-gray-700 dark:text-gray-300 cursor-pointer font-medium"
                onClick={() => handleSort("stats.totalTrades")}
              >
                <div className="flex items-center gap-1">
                  Trades
                  {sortField === "stats.totalTrades" &&
                    (sortOrder === "desc" ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/40">
            {sortedData.map((trader, index) => (
              <tr
                key={trader._id}
                className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors ${
                  trader._id === user?._id
                    ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                    : ""
                }`}
              >
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-primary dark:text-primary font-medium">
                  {trader.username}
                  {trader._id === user?._id && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded">
                      You
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      (trader.stats?.totalProfit || 0) >= 0
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : "text-red-600 dark:text-red-400 font-medium"
                    }
                  >
                    {formatCurrency(Math.abs(trader.stats?.totalProfit || 0))}
                    {(trader.stats?.totalProfit || 0) < 0 && "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-primary dark:text-primary">
                  {formatPercent(trader.stats?.winRate || 0)}
                  {trader.stats?.winningTrades > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({trader.stats.winningTrades} W /{" "}
                      {trader.stats.losingTrades} L)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-accent dark:text-accent font-medium">
                  {trader.stats?.totalTrades || 0}
                </td>
              </tr>
            ))}

            {sortedData.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center">
                    <Trophy className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p>
                      No trading data available for the selected time period
                    </p>
                  </div>
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
