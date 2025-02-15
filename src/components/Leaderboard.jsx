import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Target, LineChart } from "lucide-react";

const Leaderboard = () => {
  const [allTimeTraders, setAllTimeTraders] = useState([]);
  const [filteredTraders, setFilteredTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");
  const [sortBy, setSortBy] = useState("totalProfit");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch all-time data for stat cards
        const allTimeResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/leaderboard?timeFrame=all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allTimeData = await allTimeResponse.json();

        if (!allTimeResponse.ok) {
          throw new Error(allTimeData.error || "Failed to fetch leaderboard");
        }

        setAllTimeTraders(allTimeData.data);

        // Fetch filtered data for table if timeframe is not 'all'
        if (timeFrame !== "all") {
          const filteredResponse = await fetch(
            `${
              import.meta.env.VITE_API_URL
            }/api/auth/leaderboard?timeFrame=${timeFrame}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const filteredData = await filteredResponse.json();

          if (!filteredResponse.ok) {
            throw new Error(
              filteredData.error || "Failed to fetch filtered data"
            );
          }

          setFilteredTraders(filteredData.data);
        } else {
          setFilteredTraders(allTimeData.data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  const getSortedTraders = (tradersList, sortField) => {
    return [...tradersList].sort((a, b) => {
      switch (sortField) {
        case "totalProfit":
          return b.stats.totalProfit - a.stats.totalProfit;
        case "winRate":
          return b.stats.winRate - a.stats.winRate;
        case "totalTrades":
          return b.stats.totalTrades - a.stats.totalTrades;
        default:
          return 0;
      }
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading)
    return (
      <div className="flex justify-center p-4 sm:p-8 text-gray-900 dark:text-gray-100">
        Loading leaderboard...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center p-4 sm:p-8 text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    );

  // Always get top performers from all-time data for stat cards
  const topProfitTrader =
    allTimeTraders.length > 0
      ? [...allTimeTraders].sort(
          (a, b) => b.stats.totalProfit - a.stats.totalProfit
        )[0]
      : null;
  const topWinRateTrader =
    allTimeTraders.length > 0
      ? [...allTimeTraders].sort((a, b) => b.stats.winRate - a.stats.winRate)[0]
      : null;
  const mostActiveTrader =
    allTimeTraders.length > 0
      ? [...allTimeTraders].sort(
          (a, b) => b.stats.totalTrades - a.stats.totalTrades
        )[0]
      : null;

  // Get filtered and sorted traders for the table
  const sortedTraders = getSortedTraders(filteredTraders, sortBy);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Trader Leaderboard
        </h2>
      </div>

      {/* Stats Cards - Always showing all-time top performers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              All-Time Top Profit
            </h3>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
            {topProfitTrader?.stats.totalProfit
              ? formatCurrency(topProfitTrader.stats.totalProfit)
              : "-"}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {topProfitTrader?.username || "No traders yet"}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-medium text-green-900 dark:text-green-100">
              All-Time Highest Win Rate
            </h3>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">
            {topWinRateTrader?.stats.winRate
              ? `${topWinRateTrader.stats.winRate}%`
              : "-"}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            {topWinRateTrader?.username || "No traders yet"}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-purple-900 dark:text-purple-100">
              All-Time Most Active
            </h3>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
            {mostActiveTrader?.stats.totalTrades || "-"}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {mostActiveTrader?.username || "No traders yet"}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:ml-auto">
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="totalProfit">Total Profit</option>
          <option value="winRate">Win Rate</option>
          <option value="totalTrades">Number of Trades</option>
        </select>
      </div>
      {/* Leaderboard Table/Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trader
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trades
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTraders.map((trader, index) => (
                <tr
                  key={trader._id}
                  className={`${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-700/50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/community/profile/${trader.username}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      {trader.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span
                      className={`font-medium ${
                        trader.stats.totalProfit >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(trader.stats.totalProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                    {trader.stats.winRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                    {trader.stats.totalTrades}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {sortedTraders.map((trader, index) => (
            <div key={trader._id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <Link
                    to={`/community/profile/${trader.username}`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    {trader.username}
                  </Link>
                </div>
                <span
                  className={`text-sm font-medium ${
                    trader.stats.totalProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(trader.stats.totalProfit)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Win Rate:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {trader.stats.winRate}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Trades:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {trader.stats.totalTrades}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
