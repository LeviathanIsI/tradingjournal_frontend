import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TimeAnalysis = ({ trades }) => {
  const [selectedSession, setSelectedSession] = useState("all");

  const timeAnalysis = useMemo(() => {
    // Group trades by hour
    const hourlyData = {};
    trades.forEach((trade) => {
      if (trade.status !== "CLOSED") return;

      const hour = new Date(trade.entryDate).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          hour,
          totalTrades: 0,
          winningTrades: 0,
          totalProfit: 0,
          session: trade.session || "Regular", // Default to Regular if missing
        };
      }

      hourlyData[hour].totalTrades++;
      if (trade.profitLoss && trade.profitLoss.realized > 0) {
        hourlyData[hour].winningTrades++;
      }
      hourlyData[hour].totalProfit += trade.profitLoss
        ? trade.profitLoss.realized
        : 0;
    });

    return Object.values(hourlyData)
      .map((data) => ({
        ...data,
        winRate:
          data.totalTrades > 0
            ? (data.winningTrades / data.totalTrades) * 100
            : 0,
        avgProfit:
          data.totalTrades > 0 ? data.totalProfit / data.totalTrades : 0,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [trades]);

  const sessionStats = useMemo(() => {
    const stats = {
      "Pre-Market": { totalTrades: 0, winningTrades: 0, totalProfit: 0 },
      Regular: { totalTrades: 0, winningTrades: 0, totalProfit: 0 },
      "After-Hours": { totalTrades: 0, winningTrades: 0, totalProfit: 0 },
      Unknown: { totalTrades: 0, winningTrades: 0, totalProfit: 0 }, // Add fallback category
    };

    trades.forEach((trade) => {
      if (trade.status !== "CLOSED") return;

      // Handle missing or invalid session
      const sessionName =
        trade.session && stats[trade.session] ? trade.session : "Regular"; // Default to Regular

      const sessionData = stats[sessionName];
      sessionData.totalTrades++;

      if (trade.profitLoss && trade.profitLoss.realized > 0) {
        sessionData.winningTrades++;
      }

      sessionData.totalProfit += trade.profitLoss
        ? trade.profitLoss.realized
        : 0;
    });

    // Remove Unknown category if empty
    if (stats.Unknown.totalTrades === 0) {
      delete stats.Unknown;
    }

    // Calculate percentages and averages
    Object.keys(stats).forEach((session) => {
      const data = stats[session];
      data.winRate = data.totalTrades
        ? (data.winningTrades / data.totalTrades) * 100
        : 0;
      data.avgProfit = data.totalTrades
        ? data.totalProfit / data.totalTrades
        : 0;
    });

    return stats;
  }, [trades]);

  const filteredTimeData =
    selectedSession === "all"
      ? timeAnalysis
      : timeAnalysis.filter((data) => data.session === selectedSession);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Session Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {Object.entries(sessionStats).map(([session, stats]) => (
          <div
            key={session}
            onClick={() =>
              setSelectedSession(session === selectedSession ? "all" : session)
            }
            className={`p-3 sm:p-4 rounded-sm border cursor-pointer transition-colors
            ${
              session === selectedSession
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400/80"
                : "border-gray-200 dark:border-gray-700/70 hover:border-blue-300 dark:hover:border-blue-500/70"
            }`}
          >
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
              {session}
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Trades: <span className="font-medium">{stats.totalTrades}</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Win Rate:{" "}
                <span className="font-medium">{stats.winRate.toFixed(1)}%</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Avg P/L:{" "}
                <span
                  className={`font-medium ${
                    stats.avgProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${stats.avgProfit.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Performance Chart */}
      <div className="bg-white dark:bg-gray-700/60 p-4 sm:p-6 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Hourly Performance{" "}
          {selectedSession !== "all" && `(${selectedSession})`}
        </h3>
        <div className="bg-gray-50 dark:bg-gray-600/30 rounded-sm">
          <div className="p-3 rounded-sm">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Understanding the chart:
            </p>
            <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>• Purple bars show your win rate for each hour</li>
              <li>• Green/Red bars show average profit/loss per trade</li>
              <li>• Click session tabs above to filter by market session</li>
              <li>• Hover over bars to see detailed statistics</li>
            </ul>
          </div>
        </div>
        <div className="h-64 sm:h-96 mt-4">
          {filteredTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTimeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-700/80"
                />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(hour) => `${hour}:00`}
                  tick={{ fill: "currentColor" }}
                  className="text-gray-600 dark:text-gray-300"
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#4338ca"
                  tick={{ fill: "currentColor" }}
                  className="text-gray-600 dark:text-gray-300"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#059669"
                  tick={{ fill: "currentColor" }}
                  className="text-gray-600 dark:text-gray-300"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg)",
                    border: "1px solid var(--tooltip-border)",
                    borderRadius: "0.25rem",
                    padding: "0.75rem",
                  }}
                  itemStyle={{
                    color: "var(--tooltip-text)",
                  }}
                  labelStyle={{
                    color: "var(--tooltip-text)",
                  }}
                  formatter={(value, name) => {
                    if (name === "Win Rate")
                      return [`${value.toFixed(1)}%`, name];
                    if (name === "Avg Profit") {
                      return [`$${value.toFixed(2)}`, name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(hour) => `Hour: ${hour}:00`}
                />
                <Legend
                  className="text-gray-900 dark:text-gray-100"
                  payload={[
                    { value: "Win Rate", type: "rect", color: "#818cf8" },
                    {
                      value: "Profitable Hours",
                      type: "rect",
                      color: "#34d399",
                    },
                    {
                      value: "Unprofitable Hours",
                      type: "rect",
                      color: "#f87171",
                    },
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="winRate"
                  name="Win Rate"
                  fill="#818cf8"
                />
                <Bar yAxisId="right" dataKey="avgProfit" name="Avg Profit">
                  {filteredTimeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.avgProfit >= 0 ? "#34d399" : "#f87171"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No trade data available for the selected session
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeAnalysis;
