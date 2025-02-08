import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Target, LineChart } from "lucide-react";

const Leaderboard = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");
  const [sortBy, setSortBy] = useState("totalProfit");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/auth/leaderboard?timeFrame=${timeFrame}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch leaderboard");
        }

        setTraders(data.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFrame]);

  const sortedTraders = [...traders].sort((a, b) => {
    switch (sortBy) {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">Loading leaderboard...</div>
    );
  if (error)
    return (
      <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
    );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Trader Leaderboard</h2>
        <div className="flex gap-4">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="totalProfit">Total Profit</option>
            <option value="winRate">Win Rate</option>
            <option value="totalTrades">Number of Trades</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Top Profit</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {sortedTraders[0]?.stats.totalProfit
              ? formatCurrency(sortedTraders[0].stats.totalProfit)
              : "-"}
          </p>
          <p className="text-sm text-blue-600">
            {sortedTraders[0]?.username || "No traders yet"}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-900">Highest Win Rate</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {sortedTraders.sort((a, b) => b.stats.winRate - a.stats.winRate)[0]
              ?.stats.winRate
              ? `${
                  sortedTraders.sort(
                    (a, b) => b.stats.winRate - a.stats.winRate
                  )[0].stats.winRate
                }%`
              : "-"}
          </p>
          <p className="text-sm text-green-600">
            {sortedTraders.sort((a, b) => b.stats.winRate - a.stats.winRate)[0]
              ?.username || "No traders yet"}
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <LineChart className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-purple-900">Most Active</h3>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {sortedTraders.sort(
              (a, b) => b.stats.totalTrades - a.stats.totalTrades
            )[0]?.stats.totalTrades || "-"}
          </p>
          <p className="text-sm text-purple-600">
            {sortedTraders.sort(
              (a, b) => b.stats.totalTrades - a.stats.totalTrades
            )[0]?.username || "No traders yet"}
          </p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div
        className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trader
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Profit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trades
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTraders.map((trader, index) => (
              <tr
                key={trader._id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/community/profile/${trader.username}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                  >
                    {trader.username}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span
                    className={`font-medium ${
                      trader.stats.totalProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(trader.stats.totalProfit)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {trader.stats.winRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {trader.stats.totalTrades}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
