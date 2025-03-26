import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CreditCard,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  Calendar,
  ChevronDown,
  InfoIcon,
} from "lucide-react";
import { useTradingStats } from "../context/TradingStatsContext";
import { useAuth } from "../context/AuthContext";

const ProfileStats = ({ userId, trades = [], stats: propStats = {} }) => {
  const [timeFrame, setTimeFrame] = useState("all");
  const [activeMetric, setActiveMetric] = useState("pnl");
  const { stats: contextStats, formatters, refreshData } = useTradingStats();
  const { formatCurrency, formatPercent } = formatters;
  const { user } = useAuth();

  // Decide which stats to use - context stats for current user, prop stats for others
  const isCurrentUser = user && user._id === userId;
  const stats = isCurrentUser ? contextStats : propStats;

  // Refresh stats data when viewing own profile
  useEffect(() => {
    if (isCurrentUser) {
      refreshData();
    }
  }, [isCurrentUser, refreshData, userId]);

  // Calculate monthly P&L data
  const monthlyPnL = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const groupedByMonth = trades.reduce((acc, trade) => {
      const date = new Date(trade.entryDate || trade.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          profit: 0,
          trades: 0,
          winRate: 0,
          winningTrades: 0,
        };
      }

      // Handle different structures for profitLoss
      const profitLossValue =
        typeof trade.profitLoss === "object"
          ? trade.profitLoss.realized || 0
          : typeof trade.profitLoss === "number"
          ? trade.profitLoss
          : 0;

      acc[monthKey].profit += profitLossValue;
      acc[monthKey].trades += 1;
      if (profitLossValue > 0) {
        acc[monthKey].winningTrades += 1;
      }

      return acc;
    }, {});

    return Object.values(groupedByMonth).map((month) => ({
      ...month,
      winRate:
        month.trades > 0
          ? ((month.winningTrades / month.trades) * 100).toFixed(1)
          : "0",
    }));
  }, [trades]);

  // Calculate trade type distribution
  const tradeTypeData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const distribution = trades.reduce((acc, trade) => {
      const type = trade.type || trade.direction || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  }, [trades]);

  // Safely calculate win rate
  const winRateValue = useMemo(() => {
    if (stats?.winRate !== undefined) return stats.winRate;

    if (
      stats?.winningTrades !== undefined &&
      stats?.totalTrades &&
      stats.totalTrades > 0
    ) {
      return (stats.winningTrades / stats.totalTrades) * 100;
    }

    if (
      stats?.profitableTrades !== undefined &&
      stats?.totalTrades &&
      stats.totalTrades > 0
    ) {
      return (stats.profitableTrades / stats.totalTrades) * 100;
    }

    return 0;
  }, [stats]);

  // Safely calculate average profit
  const avgProfit = useMemo(() => {
    if (!stats?.totalTrades || stats.totalTrades === 0) return 0;
    return (stats?.totalProfit || 0) / stats.totalTrades;
  }, [stats]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header with time frame selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <div className="h-5 w-1.5 bg-primary rounded-full mr-2"></div>
          Trading Statistics
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600/70 round-sm text-sm
            bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            appearance-none"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="6months">Last 6 Months</option>
            <option value="month">This Month</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm p-4 hover:shadow transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 dark:bg-primary/20 p-2 round-sm">
              <CreditCard className="h-5 w-5 text-primary dark:text-primary-light" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Total P&L
            </h3>
          </div>
          <p
            className={`text-2xl font-bold ${
              (stats?.totalProfit || 0) >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(stats?.totalProfit || 0)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm p-4 hover:shadow transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100/80 dark:bg-green-800/30 p-2 round-sm">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Win Rate
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPercent(winRateValue)}
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-1.5">
            <div
              className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, winRateValue)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm p-4 hover:shadow transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-accent/10 dark:bg-accent/20 p-2 round-sm">
              <BarChart2 className="h-5 w-5 text-accent dark:text-accent-light" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Total Trades
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats?.totalTrades || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm p-4 hover:shadow transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100/80 dark:bg-orange-800/30 p-2 round-sm">
              <PieChartIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Avg. Profit
            </h3>
          </div>
          <p
            className={`text-2xl font-bold ${
              avgProfit >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(avgProfit)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly P&L Chart */}
        <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm p-5 hover:shadow transition-shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Monthly Performance
          </h3>
          <div className="h-[300px]">
            {monthlyPnL.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPnL}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.2}
                  />
                  <XAxis dataKey="month" tick={{ fill: "#6B7280" }} />
                  <YAxis tick={{ fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31, 41, 55)",
                      border: "1px solid rgb(55, 65, 81)",
                      color: "#fff",
                      borderRadius: "0.375rem",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    formatter={(value, name) => {
                      if (name === "profit") return formatCurrency(value);
                      if (name === "winRate") return `${value}%`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    name="P&L"
                  />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Win Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-6 bg-gray-50/80 dark:bg-gray-700/30 rounded-sm">
                <InfoIcon className="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
                <p>No data available for the selected time period</p>
              </div>
            )}
          </div>
        </div>

        {/* Trade Type Distribution */}
        <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm p-5 hover:shadow transition-shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Trade Type Distribution
          </h3>
          <div className="h-[300px]">
            {tradeTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tradeTypeData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tradeTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31, 41, 55)",
                      border: "1px solid rgb(55, 65, 81)",
                      color: "#fff",
                      borderRadius: "0.375rem",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-gray-900 dark:text-gray-100">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-6 bg-gray-50/80 dark:bg-gray-700/30 rounded-sm">
                <InfoIcon className="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
                <p>No trade type data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
