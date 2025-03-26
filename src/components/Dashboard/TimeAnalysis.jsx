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
import { Clock, BarChart2, TrendingUp } from "lucide-react";

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

  // Get session colors
  const getSessionColor = (session) => {
    switch (session) {
      case "Pre-Market":
        return "from-accent to-accent/80";
      case "Regular":
        return "from-primary to-primary/80";
      case "After-Hours":
        return "from-secondary to-secondary/80";
      default:
        return "from-gray-500 to-gray-400";
    }
  };

  // Get session icons
  const getSessionIcon = (session) => {
    switch (session) {
      case "Pre-Market":
        return <Clock className="h-5 w-5 text-accent/90" />;
      case "Regular":
        return <BarChart2 className="h-5 w-5 text-primary/90" />;
      case "After-Hours":
        return <TrendingUp className="h-5 w-5 text-secondary/90" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Session Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(sessionStats).map(([session, stats]) => (
          <div
            key={session}
            onClick={() =>
              setSelectedSession(session === selectedSession ? "all" : session)
            }
            className={`p-4 rounded-sm border shadow-sm cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800/60 backdrop-blur-sm
            ${
              session === selectedSession
                ? `border-${
                    session === "Pre-Market"
                      ? "accent"
                      : session === "Regular"
                      ? "primary"
                      : "secondary"
                  } bg-gradient-to-br ${getSessionColor(session)}/5 dark:bg-${
                    session === "Pre-Market"
                      ? "accent"
                      : session === "Regular"
                      ? "primary"
                      : "secondary"
                  }/10 dark:border-${
                    session === "Pre-Market"
                      ? "accent"
                      : session === "Regular"
                      ? "primary"
                      : "secondary"
                  }/50 hover:shadow`
                : "border-gray-200 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex-shrink-0`}>{getSessionIcon(session)}</div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                {session}
              </h3>
            </div>
            <div className="mt-3 space-y-2 pl-2">
              <div className="flex justify-between">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Trades
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                  {stats.totalTrades}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Win Rate
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                  {stats.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Avg P/L
                </p>
                <p
                  className={`text-xs sm:text-sm font-medium ${
                    stats.avgProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${stats.avgProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Performance Chart */}
      <div className="bg-white/90 dark:bg-gray-800/60 p-5 sm:p-6 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="h-6 w-1 bg-primary rounded-full mr-2 hidden sm:block"></div>
            Hourly Performance{" "}
            {selectedSession !== "all" && (
              <span className="ml-2 text-sm font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {selectedSession}
              </span>
            )}
          </h3>

          <div className="mt-2 sm:mt-0 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {selectedSession === "all"
              ? "Showing all trading sessions"
              : `Filtered to ${selectedSession} session`}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-700/30 dark:to-gray-600/20 p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm mb-5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Understanding the chart:
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-accent"></div>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Purple bars show win rate for each hour
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-green-400"></div>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Green bars show profitable hours
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-red-400"></div>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Red bars show unprofitable hours
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm border border-dashed border-primary"></div>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Click session cards to filter by market session
              </span>
            </div>
          </div>
        </div>

        <div className="h-80 sm:h-96">
          {filteredTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTimeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-700/60"
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
                  stroke="#8b5cf6" // accent color
                  tick={{ fill: "currentColor" }}
                  className="text-gray-600 dark:text-gray-300"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981" // green-500
                  tick={{ fill: "currentColor" }}
                  className="text-gray-600 dark:text-gray-300"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "var(--tooltip-bg, rgba(255, 255, 255, 0.95))",
                    border:
                      "1px solid var(--tooltip-border, rgba(0, 0, 0, 0.1))",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  itemStyle={{
                    color: "var(--tooltip-text, #374151)",
                  }}
                  labelStyle={{
                    color: "var(--tooltip-text, #374151)",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    padding: "0 0 0.5rem 0",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
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
                    { value: "Win Rate", type: "rect", color: "#8b5cf6" }, // accent
                    {
                      value: "Profitable Hours",
                      type: "rect",
                      color: "#10b981", // green-500
                    },
                    {
                      value: "Unprofitable Hours",
                      type: "rect",
                      color: "#ef4444", // red-500
                    },
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="winRate"
                  name="Win Rate"
                  fill="#8b5cf6" // accent color
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="avgProfit"
                  name="Avg Profit"
                  radius={[4, 4, 0, 0]}
                >
                  {filteredTimeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.avgProfit >= 0 ? "#10b981" : "#ef4444"} // green-500 or red-500
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50/50 dark:bg-gray-700/20 rounded-sm border border-dashed border-gray-300 dark:border-gray-600/50">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No trade data available for the selected session
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Try selecting a different session
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeAnalysis;
