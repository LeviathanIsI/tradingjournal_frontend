import React, { useState, useMemo } from "react";
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
  ChartBar,
  PieChart as PieChartIcon,
} from "lucide-react";

const ProfileStats = ({ userId, trades, stats }) => {
  const [timeFrame, setTimeFrame] = useState("all");
  const [activeMetric, setActiveMetric] = useState("pnl");

  // Calculate monthly P&L data
  const monthlyPnL = useMemo(() => {
    const groupedByMonth = trades.reduce((acc, trade) => {
      const date = new Date(trade.entryDate);
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

      acc[monthKey].profit += trade.profitLoss.realized;
      acc[monthKey].trades += 1;
      if (trade.profitLoss.realized > 0) {
        acc[monthKey].winningTrades += 1;
      }

      return acc;
    }, {});

    return Object.values(groupedByMonth).map((month) => ({
      ...month,
      winRate: ((month.winningTrades / month.trades) * 100).toFixed(1),
    }));
  }, [trades]);

  // Calculate trade type distribution
  const tradeTypeData = useMemo(() => {
    const distribution = trades.reduce((acc, trade) => {
      acc[trade.type] = (acc[trade.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  }, [trades]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Time frame selector */}
      <div className="flex justify-between items-center">
        <div className="w-full sm:w-auto">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm text-sm
            bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="6months">Last 6 Months</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">
              Total P&L
            </h3>
          </div>
          <p
            className={`text-lg sm:text-2xl font-bold ${
              stats.totalProfit >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ${stats.totalProfit.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
            <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">
              Win Rate
            </h3>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.winningTrades && stats.totalTrades
              ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(1)
              : stats.winRate?.toFixed(1) || "0"}
            %
          </p>
        </div>

        <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBar className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">
              Total Trades
            </h3>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalTrades}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">
              Avg. Profit
            </h3>
          </div>
          <p
            className={`text-lg sm:text-2xl font-bold ${
              stats.totalProfit / stats.totalTrades >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ${(stats.totalProfit / stats.totalTrades).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly P&L Chart */}
        <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Monthly Performance
          </h3>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPnL}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: "#6B7280" }} />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(31, 41, 55)",
                    border: "1px solid rgb(55, 65, 81)",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8884d8"
                  name="P&L"
                />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  stroke="#82ca9d"
                  name="Win Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trade Type Distribution */}
        <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Trade Type Distribution
          </h3>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tradeTypeData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tradeTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(31, 41, 55)",
                    border: "1px solid rgb(55, 65, 81)",
                    color: "#fff",
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
