import { useState, useEffect, useMemo } from "react";
import { Trophy, Target, LineChart } from "lucide-react";
import LeaderboardStatsCard from "./LeaderboardStatsCard";
import LeaderboardTableRow from "./LeaderboardTableRow";
import LeaderboardCard from "./LeaderboardCard";

const Leaderboard = () => {
  const [traders, setTraders] = useState([]);
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
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/auth/leaderboard?timeFrame=${timeFrame}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch data");
        setTraders(data.data);
        setFilteredTraders(data.data);
      } catch (error) {
        console.error("Leaderboard fetch failed:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeFrame]);

  const sortedTraders = useMemo(() => {
    return [...filteredTraders].sort((a, b) => {
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
  }, [filteredTraders, sortBy]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  if (loading)
    return (
      <div className="flex justify-center p-4 text-gray-900 dark:text-gray-100">
        Loading leaderboard...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center p-4 text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    );

  const topProfitTrader = traders[0];
  const topWinRateTrader = traders.sort(
    (a, b) => b.stats.winRate - a.stats.winRate
  )[0];
  const mostActiveTrader = traders.sort(
    (a, b) => b.stats.totalTrades - a.stats.totalTrades
  )[0];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
        Trader Leaderboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <LeaderboardStatsCard
          title="Top Profit"
          value={formatCurrency(topProfitTrader.stats.totalProfit)}
          username={topProfitTrader.username}
          icon={<Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          color="blue"
        />
        <LeaderboardStatsCard
          title="Highest Win Rate"
          value={`${topWinRateTrader.stats.winRate}%`}
          username={topWinRateTrader.username}
          icon={
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          }
          color="green"
        />
        <LeaderboardStatsCard
          title="Most Active"
          value={mostActiveTrader.stats.totalTrades}
          username={mostActiveTrader.username}
          icon={
            <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          }
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:ml-auto">
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
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
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
        >
          <option value="totalProfit">Total Profit</option>
          <option value="winRate">Win Rate</option>
          <option value="totalTrades">Number of Trades</option>
        </select>
      </div>

      {/* Table - Desktop */}
      <div className="hidden sm:block bg-white dark:bg-gray-700 rounded-md shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-600/50">
            <tr>
              {["Rank", "Trader", "Profit", "Win Rate", "Trades"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {sortedTraders.map((trader, idx) => (
              <LeaderboardTableRow
                key={trader._id}
                trader={trader}
                rank={idx + 1}
                formatCurrency={formatCurrency}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm">
        {sortedTraders.map((trader, idx) => (
          <LeaderboardCard
            key={trader._id}
            trader={trader}
            rank={idx + 1}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
